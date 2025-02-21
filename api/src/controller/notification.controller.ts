import { pool } from "../config/db";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ErrorHandler } from "../utils/ErrorHandler";
import { parsePagination } from "../utils/parsePagination";
import { sqlPlaceholderCreator } from "../utils/sql/sqlPlaceholderCreator";
import {
  createAndSendNotificationValidator,
  sendNotificationValidator,
} from "../validator/notification.validator";

export const getNotification = asyncErrorHandler(async (req, res) => {
  const { role, employee_id } = res.locals;
  const { LIMIT, OFFSET } = parsePagination(req);

  const { rows } = await pool.query(
    `
    SELECT 
     n.*,
     ns.is_readed,
     ns.notification_sended_id
    FROM notification_sended ns

    LEFT JOIN notification n
    ON n.notification_id = ns.notification_id

    WHERE ns.employee_id = $1 OR ns.employee_role = $2

    ORDER BY ns.notification_sended_id DESC

    LIMIT ${LIMIT} OFFSET ${OFFSET}
    `,
    [employee_id, role]
  );

  res.status(200).json(new ApiResponse(200, "", rows));
});

//read mean delete notification
export const readNotification = asyncErrorHandler(async (req, res) => {
  await pool.query(
    `DELETE FROM notification_sended WHERE notification_sended_id = $1`,
    [req.params.notification_sended_id]
  );

  res.status(200).json(new ApiResponse(200, "Notification Read"));
});

export const createAndSendNotification = asyncErrorHandler(async (req, res) => {
  const { error, value } = createAndSendNotificationValidator.validate(
    req.body
  );
  if (error) throw new ErrorHandler(400, error.message);

  const { notification_type } = value;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    //add info to notification table
    const { rows } = await client.query(
      `
      INSERT INTO notification
        (notification_title, notification_description, link)
      VALUES
        ($1, $2, $3)
      RETURNING notification_id
      `,
      [
        value.notification_title,
        value.notification_description,
        value.notification_link,
      ]
    );

    const createdNotificationID = rows[0].notification_id;

    if (notification_type === "private") {
      await client.query(
        `
        INSERT INTO notification_sended
         (notification_id, employee_id)
        VALUES
          ${sqlPlaceholderCreator(2, value.employee_ids.length).placeholder}
        `,
        value.employee_ids.flatMap((item: any) => [createdNotificationID, item])
      );
    } else {
      await client.query(
        `
        INSERT INTO notification_sended
         (notification_id, employee_role)
        VALUES
          ${sqlPlaceholderCreator(2, value.employee_roles.length).placeholder}
        `,
        value.employee_roles.flatMap((item: any) => [
          createdNotificationID,
          item,
        ])
      );
    }

    await client.query("COMMIT");
    client.release();
  } catch (error: any) {
    await client.query("ROLLBACK");
    client.release();
    throw new ErrorHandler(400, error.message);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Notification sent successfully"));
});

export const sendNotification = asyncErrorHandler(async (req, res) => {
  const { error, value } = sendNotificationValidator.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  if (value.notification_type === "private") {
    await pool.query(
      `
      INSERT INTO notification_sended
       (notification_id, employee_id)
      VALUES
        ${sqlPlaceholderCreator(2, value.employee_ids.length).placeholder}
      `,
      value.employee_ids.flatMap((item: any) => [value.notification_id, item])
    );
  } else {
    await pool.query(
      `
      INSERT INTO notification_sended
       (notification_id, employee_role)
      VALUES
        ${sqlPlaceholderCreator(2, value.employee_roles.length).placeholder}
      `,
      value.employee_roles.flatMap((item: any) => [value.notification_id, item])
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Notification sent successfully"));
});
