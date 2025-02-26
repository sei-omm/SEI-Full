import { PoolClient } from "pg";
import { pool } from "../config/db";
import { sqlPlaceholderCreator } from "./sql/sqlPlaceholderCreator";

type TSendNotification = {
  notification_title: string;
  notification_description: string;
  notification_link?: string;
  notification_type: "role_base" | "private";
  employee_ids?: number[];
  employee_roles?: string[];

  client?: PoolClient;
};

export const sendNotificationUtil = async ({
  notification_title,
  notification_description,
  employee_ids,
  employee_roles,
  notification_link,
  notification_type,
  client,
}: TSendNotification) => {
  if (notification_type === "private" && !employee_ids)
    throw new Error("Employee Ids are required for private notifications");
  if (notification_type === "role_base" && !employee_roles)
    throw new Error("Employee Roles are required for role based notifications");

  const dbClient = client ?? (await pool.connect());

  try {
    const { rows: notification } = await dbClient.query(
      `
        INSERT INTO notification
          (notification_title, notification_description, link)
        VALUES
           ($1, $2, $3)
        RETURNING notification_id
            `,
      [notification_title, notification_description, notification_link]
    );

    const colLength =
      notification_type === "private"
        ? employee_ids?.length || 0
        : employee_roles?.length || 0;

    await dbClient.query(
      `
        INSERT INTO notification_sended
          (notification_id, employee_id)
        VALUES
        ${sqlPlaceholderCreator(2, colLength).placeholder}
            `,
      notification_type === "private"
        ? employee_ids?.flatMap((item: any) => [
            notification[0].notification_id,
            item,
          ])
        : employee_roles?.flatMap((item: any) => [
            notification[0].notification_id,
            item,
          ])
    );
    if (!client) {
      await dbClient.query("COMMIT");
      dbClient.release();
    }
  } catch (error) {
    if (!client) {
      await dbClient.query("ROLLBACK");
      dbClient.release();
    }
  }
};
