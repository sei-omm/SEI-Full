import { pool } from "../config/db";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ErrorHandler } from "../utils/ErrorHandler";
import { tryCatch } from "../utils/tryCatch";
import { sendNotificationValidator } from "../validator/notification.validator";

export const getNotification = asyncErrorHandler(async (req, res) => {
  const { role, employee_id } = res.locals;

  const { rows } = await pool.query(
    `
    SELECT
     * 
    FROM notification 
    WHERE 
    to_roles LIKE '%' || $1 || '%'
    OR to_ids LIKE '%' || $2 || '%'
  `,
    [role, employee_id]
  );

  res.status(200).json(new ApiResponse(200, "", rows));
});

export const sendNotification = asyncErrorHandler(async (req, res) => {
  const { error } = sendNotificationValidator.validate(req.body);
  if (error) {
    throw new ErrorHandler(400, error.message);
  }

  const { notification_type } = req.body;
  if (notification_type === "private") {
    const { employee_id } = res.locals; // from employee

    const client = await pool.connect();

    const { error: tryError } = await tryCatch(async () => {
      await client.query("BEGIN");

      //write code
      const { rows } = await pool.query(
        "INSERT INTO notification (notification_title, notification_description, from_id) VALUES ($1, $2, $3) RETURNING notification_id",
        [
          req.body.notification_title,
          req.body.notification_description,
          employee_id
        ]
      );

      const newNotificationId = rows[0].notification_id;

      const { rows: toRows } = await pool.query(
        "INSERT INTO notification_to (notification_id, to_id, to_role) VALUES ($1, $2, $3)",
        [newNotificationId]
      );

      await client.query("COMMIT");
      client.release();
    });

    if (tryError) {
      await client.query("ROLLBACK");
      client.release();
      throw new ErrorHandler(400, tryError.message);
    }

    return res
      .status(201)
      .json(new ApiResponse(201, "Notification sent successfully"));
  }

  await pool.query(
    "INSERT INTO notification (notification_title, notification_description, from_role, to_roles) VALUES ($1, $2, $3, $4)",
    [
      req.body.notification_title,
      req.body.notification_description,
      "Inventory",
      req.body.to_roles,
    ]
  );

  res.status(201).json(new ApiResponse(201, "Notification sent successfully"));
});
