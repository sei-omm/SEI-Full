import { pool } from "../config/db";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { ErrorHandler } from "../utils/ErrorHandler";

export const updateInventoryInfoDaily = asyncErrorHandler(async (req, res) => {
  const CRON_SECRET = process.env.CRON_SECRET || "";

  const authToken = req.headers["x-cron-auth"] || req.query.token; // Get token from headers

  if (!authToken || authToken !== CRON_SECRET) {
    throw new ErrorHandler(403, "Unauthorized request");
  }
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // store daily inventory report

    // await client.query(
    //   `
    //     INSERT INTO inventory_daily_report (
    //         item_id, item_name, category, sub_category, where_to_use, used_by, description, 
    //         minimum_quantity, current_status, vendor_id, institute, created_at, closing_stock, 
    //         opening_stock, item_consumed, total_value, cost_per_unit_current, cost_per_unit_previous, 
    //         current_purchase_date, report_date
    //     )
    //     SELECT 
    //         item_id, item_name, category, sub_category, where_to_use, used_by, description, 
    //         minimum_quantity, current_status, vendor_id, institute, created_at, closing_stock, 
    //         opening_stock, item_consumed, total_value, cost_per_unit_current, cost_per_unit_previous, 
    //         current_purchase_date, NOW() - INTERVAL '1 day'
    //     FROM inventory;
    //   `
    // )

    // than change the closing stock and opening stock of the inventory table
    await client.query(
      `
      UPDATE inventory_item_info SET
          opening_stock = closing_stock,
          updated_date = CURRENT_DATE,
          item_consumed = 0
      WHERE updated_date != CURRENT_DATE
      `
    );

    await client.query("COMMIT");
    client.release();
  } catch (error) {
    await client.query("ROLLBACK");
    client.release();
    throw new ErrorHandler(500, "Internal Server Error");
  }

  res.send("inventory info updated daily basis");
});