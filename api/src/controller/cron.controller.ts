import { pool } from "../config/db";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { ErrorHandler } from "../utils/ErrorHandler";

export const updateInventoryInfoDaily = asyncErrorHandler(async (req, res) => {
  const CRON_SECRET = process.env.CRON_SECRET || "";

  const authToken = req.headers["x-cron-auth"] || req.query.token; // Get token from headers

  if (!authToken || authToken !== CRON_SECRET) {
    throw new ErrorHandler(403, "Unauthorized request");
  }

  await pool.query(
    `
    UPDATE inventory_item_info SET
        opening_stock = closing_stock,
        updated_date = CURRENT_DATE,
        item_consumed = 0
    WHERE updated_date != CURRENT_DATE
    `
  )

  res.send("inventory info updated daily basis")
});
