import { pool } from "../../config/db";
import asyncErrorHandler from "../../middleware/asyncErrorHandler";
import { ApiResponse } from "../../utils/ApiResponse";

// const { rows } = await pool.query(
//   `
//     WITH latest_purchase AS (
//       SELECT item_id, MAX(purchase_date) AS last_purchase_date
//       FROM inventory_stock_info
//       GROUP BY item_id
//     )

//     SELECT
//       iii.item_name,
//       iii.category,
//       iii.sub_category,
//       iii.where_to_use,
//       iii.used_by,
//       iii.description,
//       iii.institute,
//       v.vendor_name,
//       v.vendor_id,
//       lp.last_purchase_date,
//       SUM(CASE WHEN isi.purchase_date = lp.last_purchase_date THEN isi.stock_quantity ELSE 0 END) AS opening_stock,
//       MAX(CASE WHEN isi.row_num = 1 THEN isi.cost_per_unit END) AS current_cost_per_unit,
//       MAX(CASE WHEN isi.row_num = 2 THEN isi.cost_per_unit END) AS previous_cost_per_unit
//     FROM inventory_item_info iii

//     LEFT JOIN vendor v 
//     ON v.vendor_id = iii.vendor_id

//     LEFT JOIN LATERAL (
//       SELECT 
//         ROW_NUMBER() OVER (PARTITION BY item_id ORDER BY purchase_date DESC) AS row_num,
//         cost_per_unit,
//         purchase_date,
//         stock
//       FROM inventory_stock_info isi
//       WHERE isi.item_id = iii.item_id
//     ) isi ON true

//     LEFT JOIN latest_purchase lp 
//     ON lp.item_id = iii.item_id

//     GROUP BY iii.item_id, v.vendor_id
//   `
// );

export const getInventoryItem = asyncErrorHandler(async (req, res) => {

  const { rows } = await pool.query(
    `
      SELECT
        iii.item_name,
        iii.category,
        iii.sub_category,
        iii.where_to_use,
        iii.used_by,
        iii.description,
        iii.institute,
        v.vendor_name,
        v.vendor_id
      FROM inventory_item_info iii

      LEFT JOIN vendor v 
      ON v.vendor_id = iii.vendor_id

      GROUP BY iii.item_id, v.vendor_id
    `
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, "Inventory Item Info Form Inventory V2 Api", rows)
    );
});
