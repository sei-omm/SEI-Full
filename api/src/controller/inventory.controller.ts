import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import {
  addMultiItemStockValidator,
  addMultiItemValidator,
  addMultiMaintenceRecordValidator,
  addMultiPlannedMaintenanceSystemValidator,
  addMultipleVendorItemValidator,
  addNewCategoryValidator,
  addNewConsumableItemValidator,
  addNewDurableValidator,
  addNewItemStockValidator,
  addNewItemValidator,
  addNewListValidator,
  addNewMaintenceRecordValidator,
  addNewPlannedMaintenanceSystemValidator,
  addNewVendorValidator,
  calcluteStockInfoValidator,
  changeLastDoneDateValidator,
  consumeStockValidator,
  deleteCategoryValidator,
  deleteConsumableItemValidator,
  deleteVendorValidator,
  getAllStockInfo,
  getPreviousOpeningStockValidator,
  getSingleDurableInfoValidator,
  updateCategoryValidator,
  updateConsumableItemValidator,
  updateDurableValidator,
  updateItemStockValidator,
  updateItemValidator,
  updateMaintenceRecordStatusValidator,
  updateMaintenceRecordValidator,
  updatePlannedMaintenanceSystemValidator,
  updateVendorValidator,
  VBulkUpdateMaintenceRecord,
} from "../validator/inventory.validator";
import { ErrorHandler } from "../utils/ErrorHandler";
import {
  objectToSqlConverterUpdate,
  objectToSqlInsert,
} from "../utils/objectToSql";
import { pool } from "../config/db";
import { ApiResponse } from "../utils/ApiResponse";
import { transaction } from "../utils/transaction";
import { tryCatch } from "../utils/tryCatch";
import { filterToSql } from "../utils/filterToSql";
import { parsePagination } from "../utils/parsePagination";
import { sqlPlaceholderCreator } from "../utils/sql/sqlPlaceholderCreator";

//inventory list
export const addNewList = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = addNewListValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const { columns, params, values } = objectToSqlInsert(req.body);
    await pool.query(
      `INSERT INTO inventory_list ${columns} VALUES ${params}`,
      values
    );

    res.status(200).json(new ApiResponse(200, "New Record Added"));
  }
);

//for inventory item basic info
// export const getAllItemInfo = asyncErrorHandler(
//   async (req: Request, res: Response) => {
//     const { LIMIT, OFFSET } = parsePagination(req);
//     const { filterQuery, filterValues } = filterToSql(req.query, "iii");

//     const { rows } = await pool.query(
//       `
//         SELECT
//             iii.item_id,
//             iii.item_name,
//             iii.category,
//             iii.sub_category,
//             iii.minimum_quantity,
//             SUM(isi.opening_stock) AS opening_stock,
//             SUM(isi.item_consumed) AS item_consumed,
//             SUM(isi.opening_stock) - SUM(isi.item_consumed) AS closing_stock,
//             iii.current_status,
//             iii.current_purchase_date,
//             -- iii.current_vendor_id,
//             iii.vendor_id,
//             v.vendor_name AS current_vendor_name,
//             iii.cost_per_unit_current,
//             iii.cost_per_unit_previous,
//             SUM(isi.total_value) AS total_value
//         FROM inventory_item_info AS iii
//         LEFT JOIN inventory_stock_info AS isi
//           ON isi.item_id = iii.item_id
//         LEFT JOIN vendor AS v
//           ON v.vendor_id = iii.vendor_id

//         ${filterQuery}

//         GROUP BY iii.item_id, v.vendor_name

//         ORDER BY iii.created_at DESC
//         LIMIT ${LIMIT} OFFSET ${OFFSET}
//   `,
//       filterValues
//     );

//     res.status(200).json(new ApiResponse(200, "", rows));
//   }
// );

export const getAllItemInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const search = req.query.search;
    delete req.query.search;

    const { LIMIT, OFFSET } = parsePagination(req);
    const { filterQuery, filterValues } = filterToSql(req.query, "iii");

    // this data will updated every day with cron tasks with vercel
    // check cron controller for more info

    // const { rows } = await pool.query(
    //   `
    //   WITH update_opening_stock AS (
    //     UPDATE inventory_item_info SET
    //       opening_stock = closing_stock,
    //       updated_date = CURRENT_DATE,
    //       item_consumed = 0
    //     WHERE updated_date != CURRENT_DATE
    //     RETURNING opening_stock, item_id
    //   )
    //   SELECT
    //     iii.*,
    //     v.vendor_name,
    //     COALESCE(u.opening_stock, iii.opening_stock) AS opening_stock
    //   FROM inventory_item_info iii

    //   LEFT JOIN vendor v
    //   ON v.vendor_id = iii.vendor_id

    //   LEFT JOIN update_opening_stock u
    //   ON u.item_id = iii.item_id

    //   ${
    //     search
    //       ? `
    //         WHERE iii.item_name ILIKE '%' || $1 || '%'
    //               OR iii.item_id::TEXT LIKE '%' || $1 || '%'
    //   `
    //       : filterQuery
    //   }

    //   LIMIT ${LIMIT} OFFSET ${OFFSET}
    //   `,
    //   search ? [search] : filterValues
    // );

    const { rows } = await pool.query(
      `
      SELECT
        iii.*,
        v.vendor_name
      FROM inventory_item_info iii

      LEFT JOIN vendor v
      ON v.vendor_id = iii.vendor_id
      ${
        search
          ? `
            WHERE iii.item_name ILIKE '%' || $1 || '%' 
                  OR iii.item_id::TEXT LIKE '%' || $1 || '%'
      `
          : filterQuery
      }
      
      LIMIT ${LIMIT} OFFSET ${OFFSET}
      `,
      search ? [search] : filterValues
    );

    res.status(200).json(new ApiResponse(200, "Inventory Item Info", rows));
  }
);

export const getItemOfVendor = asyncErrorHandler(async (req, res) => {
  const { rows } = await pool.query(
    `
    SELECT
      item_id,
      item_name,
      current_purchase_date
    FROM inventory_item_info
    WHERE vendor_id = $1
    `,
    [req.params.vendor_id]
  );

  res.status(200).json(new ApiResponse(200, "Vendor Items", rows));
});

export const getItemsForDropDown = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rows } = await pool.query(
      `SELECT item_id, item_name FROM inventory_item_info`
    );
    res.status(200).json(new ApiResponse(200, "", rows));
  }
);

export const getSingleItemInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rowCount, rows } = await pool.query(
      `SELECT * FROM inventory_item_info WHERE item_id = $1`,
      [req.params.item_id]
    );

    if (rowCount === 0) throw new ErrorHandler(404, "No Item Found");

    res.status(200).json(new ApiResponse(200, "New Item Has Added", rows[0]));
  }
);

export const addNewItemInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = addNewItemValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const { columns, params, values } = objectToSqlInsert(req.body);
    await pool.query(
      `INSERT INTO inventory_item_info ${columns} VALUES ${params}`,
      values
    );

    res.status(200).json(new ApiResponse(200, "New Item Has Added"));
  }
);

export const updateItemInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = updateItemValidator.validate({
      ...req.body,
      ...req.params,
    });
    if (error) throw new ErrorHandler(400, error.message);

    const { keys, values, paramsNum } = objectToSqlConverterUpdate(req.body);
    values.push(req.params.item_id);
    await pool.query(
      `UPDATE inventory_item_info SET ${keys} WHERE item_id = $${paramsNum}`,
      values
    );

    res.status(200).json(new ApiResponse(200, "Item Info Has Updated"));
  }
);

// export const addMulipInventoryItem = asyncErrorHandler(async (req, res) => {
//   const { error, value } = addMultiInventoryItem.validate(req.body);
//   if (error) throw new ErrorHandler(400, error.message);

//   const client = await pool.connect();

//   const { error: tryCatchError } = await tryCatch(async () => {
//     await client.query("BEGIN");

//     const { rows: inventoryInfo } = await client.query(
//       `
//         INSERT INTO new_inventory_list
//           (item_name, category, sub_category, description, where_to_use, used_by, minimum_quantity, item_consumed, closing_stock, item_status)
//         VALUES
//           ${sqlPlaceholderCreator(10, value.length).placeholder}

//         RETURNING inventory_item_id
//       `,
//       value.flatMap((item) => [
//         item.item_name,
//         item.category,
//         item.sub_category,
//         item.description,
//         item.where_to_use,
//         item.used_by,
//         item.minimum_quantity,
//         item.item_consumed,
//         item.closing_stock,
//         item.item_status,
//       ])
//     );

//     const itemID = inventoryInfo[0].inventory_item_id;

//     await client.query(
//       `
//       INSERT INTO new_inventory_stock
//         (inventory_item_id, opening_stock, vendor_id, purchsed_date, remark)
//       VALUES
//         ${sqlPlaceholderCreator(5, value.length).placeholder}
//       `,
//       value.flatMap((item) => [
//         itemID,
//         item.opening_stock,
//         item.vendor_id,
//         item.purchsed_date,
//         item.remark,
//       ])
//     );

//     await client.query("COMMIT");
//     client.release();
//   });

//   if (tryCatchError) {
//     await client.query("ROLLBACK");
//     client.release();
//     throw tryCatchError;
//   }

//   res
//     .status(201)
//     .json(new ApiResponse(201, "Item Info Has Stored Successfully"));
// });

export const addMulipInventoryItem = asyncErrorHandler(async (req, res) => {
  const { error, value } = addMultiItemValidator.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  await pool.query(
    `
    INSERT INTO inventory_item_info
      (item_name, category, sub_category, where_to_use, used_by, description, minimum_quantity, institute, vendor_id)
     VALUES
      ${sqlPlaceholderCreator(9, value.length).placeholder}
    `,
    value.flatMap((item) => [
      item.item_name,
      item.category,
      item.sub_category,
      item.where_to_use,
      item.used_by,
      item.description,
      item.minimum_quantity,
      item.institute,
      item.vendor_id,
    ])
  );

  res.status(200).json(new ApiResponse(200, "Inventory Items Are Saved"));
});

//item stock
export const getAllItemStockInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = getAllStockInfo.validate(req.params);
    if (error) throw new ErrorHandler(400, error.message);

    const [stockInfo, calcluteStockInfo] = await transaction([
      {
        sql: `SELECT 
        isi.*,
        v.vendor_name
        FROM inventory_stock_info as isi
        LEFT JOIN vendor AS v
        ON v.vendor_id = isi.vendor_id
        WHERE isi.item_id = $1 AND isi.type = 'add'

        ORDER BY isi.stock_id DESC
        `,
        values: [req.params.item_id],
      },
      {
        sql: `
            SELECT 
              SUM(isi.opening_stock) AS total_stock,
              SUM(isi.item_consumed) AS total_item_consumed,
              SUM(isi.opening_stock) - SUM(isi.item_consumed) AS remain_stock,
              SUM(isi.total_value) AS total_spend
            FROM inventory_stock_info AS isi
            WHERE isi.item_id = $1
        `,
        values: [req.params.item_id],
      },
    ]);
    res.status(200).json(
      new ApiResponse(200, "", {
        stock_info: stockInfo.rows,
        stock_calcluction: calcluteStockInfo.rows[0],
      })
    );
  }
);

export const getStockCalcluction = asyncErrorHandler(async (req, res) => {
  const { error } = getAllStockInfo.validate(req.params);
  if (error) throw new ErrorHandler(400, error.message);

  const { rows } = await pool.query(
    `
      SELECT 
        COALESCE(SUM(isi.opening_stock), 0) AS total_stock,
        COALESCE(SUM(isi.item_consumed), 0) AS total_item_consumed,
        COALESCE(SUM(isi.opening_stock) - SUM(isi.item_consumed), 0) AS remain_stock,
        COALESCE(SUM(isi.total_value), 0) AS total_spend
      FROM inventory_stock_info AS isi
      WHERE isi.item_id = $1
        `,
    [req.params.item_id]
  );

  res.status(200).json(new ApiResponse(200, "", rows[0]));
});

export const getPreviousOpeningStock = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = getPreviousOpeningStockValidator.validate(req.params);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows, rowCount } = await pool.query(
      `SELECT closing_stock FROM inventory_stock_info WHERE item_id = $1 ORDER BY created_at DESC`,
      [req.params.item_id]
    );

    if (rowCount === 0)
      return res.status(200).json(new ApiResponse(200, "", -1));

    res.status(200).json(new ApiResponse(200, "", rows[0].closing_stock));
  }
);

export const calcluteStockInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = calcluteStockInfoValidator.validate(req.params);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows } = await pool.query(
      `
      SELECT 
        SUM(isi.opening_stock) AS total_stock,
        SUM(isi.item_consumed) AS total_item_consumed,
        SUM(isi.closing_stock) AS remain_stock,
        SUM(isi.total_value) AS total_spend
      FROM inventory_stock_info AS isi
      WHERE isi.item_id = $1
    `,
      [req.params.item_id]
    );

    res.status(200).json(new ApiResponse(200, "", rows?.[0]));
  }
);

export const getSingleStockInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rowCount, rows } = await pool.query(
      `SELECT * FROM inventory_stock_info WHERE stock_id = $1`,
      [req.params.stock_id]
    );

    if (rowCount === 0) throw new ErrorHandler(404, "No Item Stock Found");

    res.status(200).json(new ApiResponse(200, "", rows[0]));
  }
);

export const addNewItemStock = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = addNewItemStockValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const client = await pool.connect();

    const { error: tError } = await tryCatch(async () => {
      await client.query("BEGIN");

      //get the previous current date
      const { rows, rowCount } = await client.query(`
        SELECT
          cost_per_unit_current
        FROM inventory_stock_info
        WHERE cost_per_unit_current IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 1
      `);

      //insert into inventory_stock_info
      const { columns, params, values } = objectToSqlInsert(req.body);
      await client.query(
        `INSERT INTO inventory_stock_info ${columns} VALUES ${params}`,
        values
      );

      //update the inventory_item_info
      await client.query(
        `UPDATE inventory_item_info SET 
            current_status = $1, 
            current_vendor_id = $2, 
            cost_per_unit_current = $3,
            cost_per_unit_previous = $4,
            current_purchase_date = $5
         WHERE item_id = $6
            `,
        [
          req.body.status,
          req.body.vendor_id,
          req.body.cost_per_unit_current,
          rowCount === 0 ? null : rows[0].cost_per_unit_current,
          req.body.purchase_date,
          req.body.item_id,
        ]
      );

      await client.query("COMMIT");
      client.release();
    });

    if (tError) {
      await client.query("ROLLBACK");
      client.release();
      throw new ErrorHandler(400, tError.message);
    }

    res.status(200).json(new ApiResponse(200, "New Item Stock Has Added"));
  }
);

// export const addMultiItemStock = asyncErrorHandler(async (req, res) => {
//   const { error, value } = addMultiItemStockValidator.validate(req.body);
//   if (error) throw new ErrorHandler(400, error.message);

//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     const valuesForUpdate: (string | null)[] = [];
//     if (value.length > 1) {
//       const lastIndex = value.length - 1;
//       const lastPrevIndex = value.length - 2;
//       valuesForUpdate.push(value[lastIndex].status);
//       valuesForUpdate.push(value[lastIndex].vendor_id);
//       valuesForUpdate.push(value[lastIndex].cost_per_unit_current);
//       valuesForUpdate.push(value[lastPrevIndex].cost_per_unit_current);
//       valuesForUpdate.push(value[lastIndex].purchase_date);
//       valuesForUpdate.push(value[0].item_id);
//     } else {
//       const { rows, rowCount } = await client.query(
//         ` SELECT cost_per_unit_current, purchase_date
//           FROM inventory_stock_info
//           WHERE item_id = $1
//           ORDER BY purchase_date DESC
//           LIMIT 1`,
//         [value[0].item_id]
//       );
//       valuesForUpdate.push(value[0].status);
//       valuesForUpdate.push(value[0].vendor_id);
//       valuesForUpdate.push(value[0].cost_per_unit_current);
//       if (rowCount === 0) {
//         valuesForUpdate.push(null);
//       } else {
//         valuesForUpdate.push(rows[0].cost_per_unit_current);
//       }
//       valuesForUpdate.push(value[0].purchase_date);
//       valuesForUpdate.push(value[0].item_id);
//     }

//     await client.query(
//       `
//        UPDATE inventory_item_info
//         SET current_status = $1,
//             current_vendor_id = $2,
//             cost_per_unit_current = $3,
//             cost_per_unit_previous = $4,
//             current_purchase_date = $5
//        WHERE item_id = $6
//       `,
//       valuesForUpdate
//     );

//     await client.query(
//       `
//       INSERT INTO inventory_stock_info
//         (opening_stock, item_consumed, closing_stock, status, vendor_id, cost_per_unit_current, total_value, remark, item_id, type, purchase_date)
//       VALUES
//         ${sqlPlaceholderCreator(11, value.length).placeholder}
//       `,
//       value.flatMap((item) => [
//         item.opening_stock,
//         item.item_consumed,
//         item.closing_stock,
//         item.status,
//         item.vendor_id,
//         item.cost_per_unit_current,
//         item.total_value,
//         item.remark,
//         item.item_id,
//         item.type,
//         item.purchase_date,
//       ])
//     );

//     await client.query("COMMIT");
//     client.release();
//   } catch (error: any) {
//     await client.query("ROLLBACK");
//     client.release();
//     throw new ErrorHandler(400, error?.message);
//   }

//   res.status(200).json(new ApiResponse(200, "Stock informations Are Saved"));
// });

export const addMultiItemStock = asyncErrorHandler(async (req, res) => {
  const { error, value } = addMultiItemStockValidator.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // await client.query(
    //   `
    //   CREATE TEMP TABLE temp_info_table 
    //     (
    //     item_id INT, 
    //     current_purchase_date DATE, 
    //     cost_per_unit_current DECIMAL(10, 2),
    //     status TEXT,
    //     total_value DECIMAL(10, 2),
    //     opening_stock INT
    //     )
        
    //   `
    // );

    // await client.query(
    //   `
    //   INSERT INTO temp_info_table 
    //     (
    //       item_id, current_purchase_date, cost_per_unit_current, status, total_value, opening_stock
    //     )
    //   VALUES
    //     ${sqlPlaceholderCreator(6, value.length).placeholder}
    //   `,
    //   value.flatMap((item) => [
    //     item.item_id,
    //     item.purchase_date,
    //     item.cost_per_unit,
    //     item.status,
    //     item.total_value,
    //     item.stock,
    //   ])
    // );

    const existItem = new Map<number, number>();
    const report: {
      item_id: number;
      item_name: string;
      category: number;
      sub_category: number;
      where_to_use: string;
      used_by: string;
      description: string;
      minimum_quantity: number;
      current_status: string;

      vendor_id: number;
      institute: string;
      created_at: string;

      closing_stock: number;
      opening_stock: number;
      item_consumed: number;
      stock_added: number;
      total_value: number;
      cost_per_unit_current: number;
      cost_per_unit_previous: number;
      current_purchase_date: string;

      remark : string;
    }[] = [];

    const updated_data: {
      item_id: number;
      current_purchase_date: string;
      cost_per_unit_previous: number;
      cost_per_unit_current: number;
      current_status: string;
      total_value: number;
      opening_stock: number;
      closing_stock: number;
      item_consumed : number; // not need to store in db
      remark : string;
    }[] = [];

    const item_ids = value.map(item => item.item_id);

    const { rows : inventoryInfo } = await client.query(
      "SELECT * FROM inventory_item_info WHERE item_id = ANY($1)",
      [item_ids]
    );

    let loopi = -1;
    for (const temp of value) {
      loopi++;
      // if already exist than update else insert
      const index = existItem.get(temp.item_id);

      const current_inventory_info = inventoryInfo.find(loopItem => loopItem.item_id === temp.item_id);

      if (index === undefined) {
        updated_data.push({
          item_id: temp.item_id,
          current_purchase_date: temp.purchase_date,
          // current_purchase_date : new Date(temp.purchase_date) > new Date(current_inventory_info.current_purchase_date) ? temp.purchase_date : current_inventory_info.current_purchase_date,
          cost_per_unit_previous : current_inventory_info.cost_per_unit_current,
          cost_per_unit_current: temp.cost_per_unit,
          current_status: temp.status,
          total_value: parseFloat(current_inventory_info.total_value) + temp.total_value,
          opening_stock: current_inventory_info.opening_stock + temp.stock,
          closing_stock: current_inventory_info.opening_stock + temp.stock - current_inventory_info.item_consumed,
          item_consumed : current_inventory_info.item_consumed,
          remark : temp.remark,
        })
        existItem.set(temp.item_id, loopi)
      } else {
        updated_data[index] = {
          item_id: temp.item_id,
            current_purchase_date: temp.purchase_date,
            // current_purchase_date : new Date(temp.purchase_date) > new Date(current_inventory_info.current_purchase_date) ? temp.purchase_date : current_inventory_info.current_purchase_date,
            cost_per_unit_previous : updated_data[index].cost_per_unit_current,
            cost_per_unit_current: temp.cost_per_unit,
            current_status: temp.status,
            total_value: updated_data[index].total_value + temp.total_value,
            opening_stock: updated_data[index].opening_stock + temp.stock,
            closing_stock: updated_data[index].opening_stock + temp.stock - updated_data[index].item_consumed,
            item_consumed : updated_data[index].item_consumed,
            remark : temp.remark,
        }
      }

          // await client.query(
    //   `
    //   UPDATE inventory_item_info SET
    //     current_purchase_date = CASE
    //       WHEN tmp.current_purchase_date < CURRENT_DATE THEN inventory_item_info.current_purchase_date
    //       ELSE tmp.current_purchase_date
    //     END,
    //     cost_per_unit_previous = CASE
    //       WHEN (CURRENT_DATE - tmp.current_purchase_date) = 1 THEN tmp.cost_per_unit_current
    //       ELSE inventory_item_info.cost_per_unit_current
    //     END,
    //     cost_per_unit_current = CASE
    //       WHEN tmp.current_purchase_date < CURRENT_DATE THEN inventory_item_info.cost_per_unit_current
    //       ELSE tmp.cost_per_unit_current
    //     END,
    //     -- cost_per_unit_previous = inventory_item_info.cost_per_unit_current,
    //     current_status = tmp.status,
    //     total_value = inventory_item_info.total_value + tmp.total_value,
    //     opening_stock = inventory_item_info.opening_stock + tmp.opening_stock,
    //     closing_stock = inventory_item_info.opening_stock + tmp.opening_stock - inventory_item_info.item_consumed
    //   FROM (
    //     SELECT
    //       item_id,
    //       SUM(total_value) as total_value
    //     FROM temp_info_table
    //     GROUP BY item_id
    //   ) tmp
    //   WHERE inventory_item_info.item_id = tmp.item_id
    //   `
    // );

      report.push({
        item_id : current_inventory_info.item_id,
        item_name : current_inventory_info.item_name,
        category : current_inventory_info.category,
        sub_category : current_inventory_info.sub_category,
        where_to_use : current_inventory_info.where_to_use,
        used_by : current_inventory_info.used_by,
        description : current_inventory_info.description,
        minimum_quantity : current_inventory_info.minimum_quantity,
        current_status : updated_data[index || 0].current_status,
        vendor_id : current_inventory_info.vendor_id,
        institute : current_inventory_info.institute,
        created_at : current_inventory_info.created_at,
        closing_stock : updated_data[index|| 0].closing_stock,
        opening_stock : updated_data[index || 0].opening_stock,
        item_consumed : 0,
        stock_added : temp.stock,
        total_value : updated_data[index || 0].total_value,
        cost_per_unit_current : parseFloat(updated_data[index || 0].cost_per_unit_current.toString()),
        cost_per_unit_previous : parseFloat(updated_data[index || 0].cost_per_unit_previous.toString()),
        current_purchase_date : updated_data[index || 0].current_purchase_date,
        remark : updated_data[index || 0].remark
      })
    }

    const values = updated_data.map(item => `(
      ${item.item_id},
      '${item.current_purchase_date}', 
      ${item.cost_per_unit_previous}, 
      ${item.cost_per_unit_current}, 
      '${item.current_status ?? ''}', 
      ${item.total_value}, 
      ${item.opening_stock}, 
      ${item.closing_stock},
      '${item.remark}'
    )`).join(", ");
    
      await client.query(
      `
        UPDATE inventory_item_info AS i
        SET 
          current_purchase_date = v.current_purchase_date::DATE,
          cost_per_unit_previous = v.cost_per_unit_previous,
          cost_per_unit_current = v.cost_per_unit_current,
          current_status = v.current_status,
          total_value = v.total_value,
          opening_stock = v.opening_stock,
          closing_stock = v.closing_stock,
          remark = v.remark
        FROM (VALUES ${values}) AS v(item_id, current_purchase_date, cost_per_unit_previous, cost_per_unit_current, current_status, total_value, opening_stock, closing_stock, remark)

        WHERE i.item_id = v.item_id

      `
    )

    await client.query(
      `
      INSERT INTO inventory_daily_report
        (
          item_id,
          item_name,
          category,
          sub_category,
          where_to_use,
          used_by,
          description,
          minimum_quantity,
          current_status,
          vendor_id,
          institute,
          created_at,
          closing_stock,
          opening_stock,
          item_consumed,
          stock_added,
          total_value,
          cost_per_unit_current,
          cost_per_unit_previous,
          current_purchase_date,
          remark
        ) VALUES ${sqlPlaceholderCreator(21, report.length).placeholder}
      
      `
      ,
      report.flatMap(item => [
      ...Object.values(item)
    ]))

    // await client.query(
    //   `
    //       WITH aggregated_tmp AS (
    //         SELECT
    //           item_id,
    //           MAX(current_purchase_date) AS current_purchase_date, -- or another aggregate as needed
    //           MAX(cost_per_unit_current) AS cost_per_unit_current,    -- adjust as required
    //           MAX(status) AS status,                                  -- adjust as required
    //           SUM(total_value) AS total_value,
    //           SUM(opening_stock) AS opening_stock
    //         FROM temp_info_table
    //         GROUP BY item_id
    //       ),
    //       updated AS (
    //         UPDATE inventory_item_info
    //         SET
    //           current_purchase_date = CASE
    //             WHEN agg.current_purchase_date < CURRENT_DATE THEN inventory_item_info.current_purchase_date
    //             ELSE agg.current_purchase_date
    //           END,
    //           cost_per_unit_previous = CASE
    //             WHEN (CURRENT_DATE - agg.current_purchase_date) = 1 THEN agg.cost_per_unit_current
    //             ELSE inventory_item_info.cost_per_unit_current
    //           END,
    //           cost_per_unit_current = CASE
    //             WHEN agg.current_purchase_date < CURRENT_DATE THEN inventory_item_info.cost_per_unit_current
    //             ELSE agg.cost_per_unit_current
    //           END,
    //           current_status = agg.status,
    //           total_value = inventory_item_info.total_value + agg.total_value,
    //           opening_stock = inventory_item_info.opening_stock + agg.opening_stock,
    //           closing_stock = inventory_item_info.opening_stock + agg.opening_stock - inventory_item_info.item_consumed
    //         FROM aggregated_tmp agg
    //         WHERE inventory_item_info.item_id = agg.item_id
    //         RETURNING inventory_item_info.*
    //       )
    //       INSERT INTO inventory_daily_report (
    //         item_id, item_name, category, sub_category, where_to_use, used_by,
    //         description, minimum_quantity, current_status, vendor_id, institute, created_at,
    //         closing_stock, opening_stock, item_consumed, stock_added, total_value,
    //         cost_per_unit_current, cost_per_unit_previous, current_purchase_date, report_date
    //       )
    //       SELECT
    //         u.item_id, u.item_name, u.category, u.sub_category, u.where_to_use, u.used_by,
    //         u.description, u.minimum_quantity, u.current_status, u.vendor_id, u.institute, u.created_at,
    //         u.closing_stock, u.opening_stock, 0, agg.opening_stock, u.total_value,
    //         u.cost_per_unit_current, u.cost_per_unit_previous, u.current_purchase_date, NOW()
    //       FROM updated u
    //       JOIN aggregated_tmp agg ON u.item_id = agg.item_id;
    //   `
    // )

    //add info to inventory stock info

    await client.query(
      `
      INSERT INTO inventory_stock_info 
        (stock, status, cost_per_unit, total_value, remark, item_id, purchase_date)
      VALUES
        ${sqlPlaceholderCreator(7, value.length).placeholder}
      `,
      value.flatMap((item) => [
        item.stock,
        item.status,
        item.cost_per_unit,
        item.total_value,
        item.remark,
        item.item_id,
        item.purchase_date,
      ])
    );

    await client.query("COMMIT");
    client.release();
  } catch (error: any) {
    await client.query("ROLLBACK");
    client.release();
    throw new ErrorHandler(400, error.message);
  }

  res.status(201).json(new ApiResponse(201, "Stock Info Added"));
});

export const consumeStock = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = consumeStockValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      //consume stock date form inventory_item_info table
      const { rows } = await client.query(
        `
        UPDATE inventory_item_info SET 
          item_consumed = inventory_item_info.item_consumed + $1,
          closing_stock = inventory_item_info.closing_stock - $1,
          remark = $2
        WHERE item_id = $3
        RETURNING *
        `,
        [value.consume_stock, value.remark, value.item_id]
      );

      // store inventory report table
      await client.query(
        `
         INSERT INTO inventory_daily_report
            (
              item_id,
              item_name,
              category,
              sub_category,
              where_to_use,
              used_by,
              description,
              minimum_quantity,
              current_status,
              vendor_id,
              institute,
              created_at,
              closing_stock,
              opening_stock,
              item_consumed,
              stock_added,
              total_value,
              cost_per_unit_current,
              cost_per_unit_previous,
              current_purchase_date,
              remark
            ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        `,
        [
          rows[0].item_id,
          rows[0].item_name,
          rows[0].category,
          rows[0].sub_category,
          rows[0].where_to_use,
          rows[0].used_by,
          rows[0].description,
          rows[0].minimum_quantity,
          rows[0].current_status,
          rows[0].vendor_id,
          rows[0].institute,
          rows[0].created_at,
          rows[0].closing_stock,
          rows[0].opening_stock,
          value.consume_stock,
          0,
          parseFloat(rows[0].total_value),
          parseFloat(rows[0].cost_per_unit_current),
          parseFloat(rows[0].cost_per_unit_previous),
          rows[0].current_purchase_date,
          value.remark,
        ]
      )

      //add new row to inventory_stock_info table
      const { columns, values, params } = objectToSqlInsert(value);
      await client.query(
        `INSERT INTO inventory_item_consume ${columns} VALUES ${params}`,
        values
      );

      await client.query("COMMIT");
      client.release();
    } catch (error: any) {
      await client.query("ROLLBACK");
      client.release();
      throw new ErrorHandler(400, error.message);
    }

    res.status(200).json(new ApiResponse(200, "Item Has Consumed From Stock"));
  }
);

export const updateItemStock = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = updateItemStockValidator.validate({
      ...req.body,
      ...req.params,
    });
    if (error) throw new ErrorHandler(400, error.message);

    const { keys, values, paramsNum } = objectToSqlConverterUpdate(req.body);
    values.push(req.params.stock_id);
    await pool.query(
      `UPDATE inventory_stock_info SET ${keys} WHERE stock_id = $${paramsNum}`,
      values
    );

    res.status(200).json(new ApiResponse(200, "Item Stock Info Has Updated"));
  }
);

//for maintence-record
export const getMaintenceRecords = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { LIMIT, OFFSET } = parsePagination(req);

    let filterQuery = "WHERE";
    const filterValues: string[] = [];
    let paramsNumber = 1;

    if (req.query.institute) {
      filterQuery += ` mr.institute = $${paramsNumber}`;
      filterValues.push(req.query.institute as string);
      paramsNumber++;
    }

    if (req.query.from_date && req.query.to_date) {
      const filter_by =
        req.query.filter_by === "maintenance_date"
          ? "mr.maintence_date::DATE"
          : "mr.completed_date::DATE";
      if (filterQuery === "WHERE") {
        filterQuery += ` ${filter_by} BETWEEN $${paramsNumber} AND $${
          paramsNumber + 1
        }`;
      } else {
        filterQuery += ` AND ${filter_by} BETWEEN $${paramsNumber} AND $${
          paramsNumber + 1
        }`;
      }
      paramsNumber++;
      paramsNumber++;
      filterValues.push(req.query.from_date as string);
      filterValues.push(req.query.to_date as string);
    }

    if (req.query.status) {
      if (filterQuery === "WHERE") {
        filterQuery += ` mr.status = $${paramsNumber}`;
      } else {
        filterQuery += ` AND mr.status = $${paramsNumber}`;
      }
      paramsNumber++;
      filterValues.push(req.query.status as string);
    }

    if (filterQuery === "WHERE") {
      filterQuery = "";
    }

    const { rows } = await pool.query(
      `
        SELECT 
          mr.*,
          iii.item_name
        FROM maintence_record AS mr
  
        LEFT JOIN inventory_item_info AS iii
        ON iii.item_id = mr.item_id
        ${filterQuery}
        ORDER BY mr.created_at DESC
        LIMIT ${LIMIT} OFFSET ${OFFSET}
        `,
      filterValues
    );
    res.status(200).json(new ApiResponse(200, "", rows));
  }
);

export const getSingleMaintenceRecord = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rows, rowCount } = await pool.query(
      `SELECT * FROM maintence_record WHERE record_id = $1`,
      [req.params.record_id]
    );

    if (rowCount === 0) throw new ErrorHandler(400, "No Record Found");

    res.status(200).json(new ApiResponse(200, "", rows[0]));
  }
);

export const addNewMaintenceRecord = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = addNewMaintenceRecordValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const { columns, params, values } = objectToSqlInsert(req.body);
    await pool.query(
      `INSERT INTO maintence_record ${columns} VALUES ${params}`,
      values
    );

    res.status(200).json(new ApiResponse(200, "New Record Added"));
  }
);

export const addMultiMaintenceRecord = asyncErrorHandler(async (req, res) => {
  const { error, value } = addMultiMaintenceRecordValidator.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  const inventoryItem: any[] = [];
  const customItem: any[] = [];
  value.forEach((item) => {
    if (item.item_id) {
      inventoryItem.push(item);
    } else {
      customItem.push(item);
    }
  });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (inventoryItem.length !== 0) {
      await client.query(
        `INSERT INTO maintence_record (item_id, maintence_date, work_station, description_of_work, department, assigned_person, approved_by, cost, status, remark, institute, completed_date) VALUES ${
          sqlPlaceholderCreator(12, inventoryItem.length).placeholder
        }

        ON CONFLICT (item_id, maintence_date) DO UPDATE SET
          item_id = EXCLUDED.item_id,
          maintence_date = EXCLUDED.maintence_date,
          work_station = EXCLUDED.work_station,
          description_of_work = EXCLUDED.description_of_work,
          department = EXCLUDED.department,
          assigned_person = EXCLUDED.assigned_person,
          approved_by = EXCLUDED.approved_by,
          cost = EXCLUDED.cost,
          status = EXCLUDED.status,
          remark = EXCLUDED.remark,
          institute = EXCLUDED.institute,
          completed_date = EXCLUDED.completed_date
        
        `,
        inventoryItem.flatMap((item) => {
          return [
            item.item_id,
            item.maintence_date,
            item.work_station,
            item.description_of_work,
            item.department,
            item.assigned_person,
            item.approved_by,
            item.cost,
            item.status,
            item.remark,
            item.institute,
            item.completed_date,
          ];
        })
      );
    }

    if (customItem.length !== 0) {
      await client.query(
        `INSERT INTO maintence_record 
          (custom_item, maintence_date, work_station, description_of_work, department, assigned_person, approved_by, cost, status, remark, institute, completed_date) 
        VALUES ${sqlPlaceholderCreator(12, customItem.length).placeholder}

        ON CONFLICT (custom_item, maintence_date) DO UPDATE SET
        custom_item = EXCLUDED.custom_item,
        maintence_date = EXCLUDED.maintence_date,
        work_station = EXCLUDED.work_station,
        description_of_work = EXCLUDED.description_of_work,
        department = EXCLUDED.department,
        assigned_person = EXCLUDED.assigned_person,
        approved_by = EXCLUDED.approved_by,
        cost = EXCLUDED.cost,
        status = EXCLUDED.status,
        remark = EXCLUDED.remark,
        institute = EXCLUDED.institute,
        completed_date = EXCLUDED.completed_date
        `,
        customItem.flatMap((item) => [
          item.custom_item,
          item.maintence_date,
          item.work_station,
          item.description_of_work,
          item.department,
          item.assigned_person,
          item.approved_by,
          item.cost,
          item.status,
          item.remark,
          item.institute,
          item.completed_date,
        ])
      );
    }

    await client.query("COMMIT");
    client.release();
  } catch (error: any) {
    await client.query("ROLLBACK");
    client.release();
    throw new ErrorHandler(400, error.mesage);
  }

  res.status(200).json(new ApiResponse(200, "Maintence Informations Added"));
});

export const updateMaintenceRecord = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = updateMaintenceRecordValidator.validate({
      ...req.body,
      ...req.params,
    });
    if (error) throw new ErrorHandler(400, error.message);

    const { keys, values, paramsNum } = objectToSqlConverterUpdate(req.body);
    values.push(req.params.record_id);
    await pool.query(
      `UPDATE maintence_record SET ${keys} WHERE record_id = $${paramsNum}`,
      values
    );

    res.status(200).json(new ApiResponse(200, "Record Info Has Updated"));
  }
);

export const updateMaintenceRecordStatus = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = updateMaintenceRecordStatusValidator.validate({
      ...req.body,
      ...req.params,
    });
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(
      `UPDATE maintence_record SET status = $1 WHERE record_id = $2`,
      [req.body.status, req.params.record_id]
    );

    res.status(200).json(new ApiResponse(200, "Record Status Has Updated"));
  }
);

export const deleteMaintenceRecord = asyncErrorHandler(async (req, res) => {
  await pool.query(`DELETE FROM maintence_record WHERE record_id = $1`, [
    req.params.record_id,
  ]);

  res.status(200).json(new ApiResponse(200, "Record Successfully Removed"));
});

export const bulkUpdateMaintenceRecord = asyncErrorHandler(async (req, res) => {
  const { error, value } = VBulkUpdateMaintenceRecord.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  const values = value
    .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
    .join(", ");
  const params = value.flatMap((u) => [
    u.record_id,
    u.status,
    u.completed_date,
  ]);

  await pool.query(
    `
      UPDATE maintence_record AS mr
        SET 
          status = v.status,
          completed_date = NULLIF(v.completed_date, 'null')::TIMESTAMP
        FROM (VALUES ${values}) AS v(record_id, status, completed_date)
      WHERE mr.record_id = v.record_id::INTEGER
    `,
    params
  );

  res.status(200).json(new ApiResponse(200, "Status Updated"));
});

//for planned maintenance system
export const getPlannedMaintenanceSystem = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { LIMIT, OFFSET } = parsePagination(req);
    const { filterQuery, filterValues } = filterToSql(req.query, "pm");

    const { rows } = await pool.query(
      `
        WITH history_data AS (
            SELECT DISTINCT ON (planned_maintenance_system_id) *
            FROM pms_history
            ORDER BY planned_maintenance_system_id, pms_history_id DESC 
        )
        SELECT
            pm.*,
            COALESCE(iii.item_name, pm.custom_item) as item_name,
            hd.*
        FROM planned_maintenance_system pm

        LEFT JOIN inventory_item_info iii ON iii.item_id = pm.item_id

        LEFT JOIN history_data hd ON hd.planned_maintenance_system_id = pm.planned_maintenance_system_id

      ${filterQuery}

      ORDER BY pm.planned_maintenance_system_id DESC

      LIMIT ${LIMIT} OFFSET ${OFFSET}
      `,
      filterValues
    );
    res.status(200).json(new ApiResponse(200, "", rows));
  }
);

export const getSinglePlannedMaintenanceSystem = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rows, rowCount } = await pool.query(
      `SELECT * FROM planned_maintenance_system WHERE planned_maintenance_system_id = $1`,
      [req.params.planned_maintenance_system_id] //planned_maintenance_system_id
    );

    if (rowCount === 0)
      throw new ErrorHandler(400, "No Planned Maintenance System Found");

    res.status(200).json(new ApiResponse(200, "", rows[0]));
  }
);

export const addNewPlannedMaintenanceSystem = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = addNewPlannedMaintenanceSystemValidator.validate(
      req.body
    );
    if (error) throw new ErrorHandler(400, error.message);

    const { columns, params, values } = objectToSqlInsert(req.body);
    await pool.query(
      `INSERT INTO planned_maintenance_system ${columns} VALUES ${params}`,
      values
    );

    res
      .status(200)
      .json(new ApiResponse(200, "New Planned Maintenance System Has Added"));
  }
);

export const addMultiPlannedMaintenanceSystemInventoryItem = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = addMultiPlannedMaintenanceSystemValidator.validate(
      req.body
    );
    if (error) throw new ErrorHandler(400, error.message);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const inventoryItem: any[] = [];
      const customItem: any[] = [];
      value.forEach((item) => {
        if (item.item_id) {
          inventoryItem.push(item);
        } else {
          customItem.push(item);
        }
      });

      const idOfNewRecords: number[] = [];

      if (inventoryItem.length !== 0) {
        const { rows, rowCount } = await client.query(
          `
          INSERT INTO planned_maintenance_system
           (item_id, institute, frequency)
          VALUES
            ${sqlPlaceholderCreator(3, inventoryItem.length).placeholder}
          ON CONFLICT (item_id, institute, frequency) DO NOTHING
          RETURNING planned_maintenance_system_id
          `,
          inventoryItem.flatMap((item) => [item.item_id, item.institute, item.frequency])
        );

        if (rowCount === 0) {
          const { rows: cRows } = await client.query(
            `
            SELECT planned_maintenance_system_id 
            FROM planned_maintenance_system 
            WHERE item_id IN (${inventoryItem
              .map((item) => item.item_id)
              .join(", ")}) AND institute IN ('${inventoryItem
              .map((item) => item.institute)
              .join(", ")}');
            `
          );

          cRows.forEach((item) => {
            idOfNewRecords.push(item.planned_maintenance_system_id);
          });
        } else {
          rows.forEach((item) => {
            idOfNewRecords.push(item.planned_maintenance_system_id);
          });
        }
      }

      if (customItem.length !== 0) {
        const { rows: rows2, rowCount: rowCount2 } = await client.query(
          `
          INSERT INTO planned_maintenance_system
           (custom_item, institute, frequency)
          VALUES
            ${sqlPlaceholderCreator(3, customItem.length).placeholder}
          ON CONFLICT (custom_item, institute, frequency) DO NOTHING
          RETURNING planned_maintenance_system_id
          `,
          customItem.flatMap((item) => [item.custom_item, item.institute, item.frequency])
        );

        if (rowCount2 === 0) {
          const { rows: cRows } = await client.query(
            `
            SELECT planned_maintenance_system_id 
            FROM planned_maintenance_system 
            WHERE custom_item IN ('${customItem
              .map((item) => item.custom_item)
              .join(", ")}') AND institute IN ('${customItem
              .map((item) => item.institute)
              .join(", ")}');
            `
          );

          cRows.forEach((item) => {
            idOfNewRecords.push(item.planned_maintenance_system_id);
          });
        } else {
          rows2.forEach((item) => {
            idOfNewRecords.push(item.planned_maintenance_system_id);
          });
        }
      }

      const alreadyStoredIds = new Map();
      let cIdIndex = 0;

      await client.query(
        `
        INSERT INTO pms_history
          (planned_maintenance_system_id, frequency, last_done, next_due, description, remark)
        VALUES
         ${sqlPlaceholderCreator(6, value.length).placeholder}
        ON CONFLICT (planned_maintenance_system_id, frequency) DO UPDATE
          SET last_done = EXCLUDED.last_done, next_due = EXCLUDED.next_due, description = EXCLUDED.description, remark = EXCLUDED.remark
        `,
        value.flatMap((item) => {
          let pmsIdToStore = 0;
          if (
            alreadyStoredIds.has(
              `${item.item_id}-${item.custom_item}-${item.institute}`
            )
          ) {
            pmsIdToStore = alreadyStoredIds.get(
              `${item.item_id}-${item.custom_item}-${item.institute}`
            );
          } else {
            alreadyStoredIds.set(
              `${item.item_id}-${item.custom_item}-${item.institute}`,
              idOfNewRecords[cIdIndex]
            );
            pmsIdToStore = idOfNewRecords[cIdIndex];
            cIdIndex++;
          }
          return [
            pmsIdToStore,
            item.frequency,
            item.last_done,
            item.next_due,
            item.description,
            item.remark,
          ];
        })
      );

      await client.query("COMMIT");
      client.release();
    } catch (error: any) {
      await client.query("ROLLBACK");
      client.release();
      throw new ErrorHandler(400, error.message);
    }

    res.status(200).json(new ApiResponse(200, "Rows Are Added"));
  }
);

export const updatePlannedMaintenanceSystem = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = updatePlannedMaintenanceSystemValidator.validate({
      ...req.body,
      ...req.params,
    });
    if (error) throw new ErrorHandler(400, error.message);

    const { keys, values, paramsNum } = objectToSqlConverterUpdate(req.body);
    values.push(req.params.planned_maintenance_system_id);
    await pool.query(
      `UPDATE planned_maintenance_system SET ${keys} WHERE planned_maintenance_system_id = $${paramsNum}`,
      values
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Planned Maintenance System Has Updated"));
  }
);

export const changeLastDoneDate = asyncErrorHandler(async (req, res) => {
  const { error, value } = changeLastDoneDateValidator.validate({
    ...req.params,
    ...req.body,
  });
  if (error) throw new ErrorHandler(400, error.message);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows, rowCount } = await client.query(
      `SELECT 
        frequency, 
        description, 
        remark 
      FROM pms_history WHERE planned_maintenance_system_id = $1
      ORDER BY last_done DESC LIMIT 1
      `,
      [value.pms_id]
    );

    if (rowCount === 0)
      throw new ErrorHandler(400, "No Planned Maintenance System Found");

    await client.query(
      `
        INSERT INTO pms_history
            (planned_maintenance_system_id, frequency, last_done, next_due, description, remark)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        value.pms_id,
        rows[0].frequency,
        value.last_done,
        value.next_due,
        rows[0].description,
        rows[0].remark,
      ]
    );

    res.status(200).json(new ApiResponse(200, "Last Done Date Has Updated"));

    await client.query("COMMIT");
    client.release();
  } catch (error: any) {
    await client.query("ROLLBACK");
    client.release();
    throw new ErrorHandler(400, error.mesage);
  }

  // await pool.query(
  //   `
  //     UPDATE pms_history SET last_done = $1, next_due = $2 WHERE pms_history_id = $3
  //   `,
  //   [value.last_done, value.next_due, value.pms_history_id]
  // );
});

export const deletePmsItem = asyncErrorHandler(async (req, res) => {
  const pms_id = req.params.pms_id;
  await pool.query(
    `DELETE FROM planned_maintenance_system WHERE planned_maintenance_system_id = $1`,
    [pms_id]
  );
  res.status(200).json(new ApiResponse(200, "Info Removed Successfully"));
});

export const deletePmsHistory = asyncErrorHandler(async (req, res) => {
  const pms_history_id = req.params.pms_history_id;
  await pool.query(`DELETE FROM pms_history WHERE pms_history_id = $1`, [
    pms_history_id,
  ]);
  res.status(200).json(new ApiResponse(200, "Info Removed Successfully"));
});

export const getPmsItemHistory = asyncErrorHandler(async (req, res) => {
  const { planned_maintenance_system_id } = req.params;
  if (!planned_maintenance_system_id)
    throw new ErrorHandler(400, "Planned Maintenance System ID is required");

  const { LIMIT, OFFSET } = parsePagination(req);

  const { rows } = await pool.query(
    `
    SELECT 
      pms_history_id,
      last_done,
      next_due,
      remark
    FROM 
      pms_history 
    WHERE 
      planned_maintenance_system_id = $1 
    ORDER BY 
      last_done DESC
    LIMIT ${LIMIT} OFFSET ${OFFSET}
    `,
    [planned_maintenance_system_id]
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Planed Maintence Record History", rows));
});

//for durable
export const getDurableInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    //for filters
    let filter = "";
    const filterValues: any[] = [];
    Object.entries(req.query).forEach(([key, value], index) => {
      if (filter === "") filter = "WHERE";

      if (index === 0) {
        filter += ` ${key} = $${index + 1}`;
      } else {
        filter += ` AND ${key} = $${index + 1}`;
      }
      filterValues.push(value);
    });

    const { rows } = await pool.query(
      `SELECT 
        * 
      FROM durable 
      ${filter}
      ORDER BY created_at DESC`,
      filterValues
    );
    res.status(200).json(new ApiResponse(200, "", rows));
  }
);

export const getSingleDurableInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = getSingleDurableInfoValidator.validate(req.params);
    if (error) throw new ErrorHandler(400, error.message);

    // await new Promise((resolve) => setTimeout(() => resolve(""), 3000));

    const { rows, rowCount } = await pool.query(
      `SELECT * FROM durable WHERE durable_id = $1`,
      [req.params.durable_id]
    );
    if (rowCount === 0) throw new ErrorHandler(400, "No Durable Info Exist");

    res.status(200).json(new ApiResponse(200, "", rows[0]));
  }
);

export const addNewDurable = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = addNewDurableValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const { columns, params, values } = objectToSqlInsert(req.body);
    await pool.query(`INSERT INTO durable ${columns} VALUES ${params}`, values);

    res.status(201).json(new ApiResponse(201, "New Info Has Added"));
  }
);

export const updateDurableInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = updateDurableValidator.validate({
      ...req.params,
      ...req.body,
    });
    if (error) throw new ErrorHandler(400, error.message);

    const { keys, values, paramsNum } = objectToSqlConverterUpdate(req.body);
    values.push(req.params.durable_id);
    await pool.query(
      `UPDATE durable SET ${keys} WHERE durable_id = $${paramsNum}`,
      values
    );

    res.status(200).json(new ApiResponse(200, "Info Has Updated"));
  }
);

export const getDurableFiltersItemInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rows } = await pool.query(
      `SELECT 
        JSON_AGG(DISTINCT floor) AS floors,
        JSON_AGG(DISTINCT number_of_rows) AS number_of_rows,
        JSON_AGG(DISTINCT capasity) AS capacities
       FROM durable`
    );
    res.status(200).json(new ApiResponse(200, "", rows[0]));
  }
);

const tableName = "consumable_category";
export const getCategory = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rows } = await pool.query(`SELECT * FROM ${tableName}`);
    res.status(200).json(new ApiResponse(200, "Consumable Category", rows));
  }
);

export const addNewCategory = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = addNewCategoryValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(`INSERT INTO ${tableName} (category_name) VALUES ($1)`, [
      req.body.category_name,
    ]);

    res.status(200).json(new ApiResponse(200, "New Category Has Added"));
  }
);

export const updateCategory = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = updateCategoryValidator.validate({
      ...req.body,
      ...req.params,
    });
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(
      `UPDATE ${tableName} SET category_name = $1 WHERE category_id = $2`,
      [req.body.category_name, req.params.category_id]
    );

    res.status(200).json(new ApiResponse(200, "Category Info Updated"));
  }
);

export const deleteCategory = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = deleteCategoryValidator.validate(req.params);
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(`DELETE FROM ${tableName} WHERE category_id = $1 `, [
      req.params.category_id,
    ]);

    res.status(200).json(new ApiResponse(200, "Category Has Deleted"));
  }
);

//Consumable
export const getConsumableInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rows } = await pool.query(
      `
      SELECT 
        c.*,
        cc.category_name,
        v.vendor_name
      FROM consumable AS c

      LEFT JOIN consumable_category AS cc
      ON cc.category_id = c.category_id

      LEFT JOIN vendor AS v
      ON v.vendor_id = c.vendor_id

      ORDER BY created_at DESC
      `
    );
    res.status(200).json(new ApiResponse(200, "", rows));
  }
);

export const getSingleConsumableInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rows, rowCount } = await pool.query(
      `SELECT * FROM consumable WHERE consumable_id = $1`,
      [req.params.consumable_id]
    );

    if (rowCount === 0) throw new ErrorHandler(400, "No Consumable Info Exist");

    res.status(200).json(new ApiResponse(200, "", rows[0]));
  }
);

export const addNewConsumableItem = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = addNewConsumableItemValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const { columns, params, values } = objectToSqlInsert(req.body);
    await pool.query(
      `INSERT INTO consumable ${columns} VALUES ${params}`,
      values
    );

    res.status(201).json(new ApiResponse(201, "New Item Has Added"));
  }
);

export const updateConsumableItem = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = updateConsumableItemValidator.validate({
      ...req.body,
      ...req.params,
    });
    if (error) throw new ErrorHandler(400, error.message);

    const { keys, values, paramsNum } = objectToSqlConverterUpdate(req.body);
    values.push(req.params.consumable_id);
    await pool.query(
      `UPDATE consumable SET ${keys} WHERE consumable_id = $${paramsNum}`,
      values
    );

    res.status(200).json(new ApiResponse(200, "Item Has Updated"));
  }
);

export const deleteConsumableItem = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = deleteConsumableItemValidator.validate(req.params);
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(`DELETE FROM consumable WHERE consumable_id = $1`, [
      req.params.consumable_id,
    ]);

    res.status(200).json(new ApiResponse(200, "Item Has Deleted"));
  }
);

//Vendor
export const getVendorIdName = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rows } = await pool.query(
      `
      SELECT 
        vendor_id,
        vendor_name
      FROM vendor
      ORDER BY created_at DESC
      `
    );
    res.status(200).json(new ApiResponse(200, "", rows));
  }
);

export const getVendorInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { LIMIT, OFFSET } = parsePagination(req);

    //for filters
    let filter = "";
    const filterValues: any[] = [];
    Object.entries(req.query).forEach(([key, value], index) => {
      if (filter === "") filter = "WHERE";

      if (index === 0) {
        if (key === "institute") {
          filter += ` ${key} LIKE '%' || $${index + 1} || '%'`;
        } else {
          filter += ` ${key} = $${index + 1}`;
        }
      } else {
        if (key === "institute") {
          filter += ` AND ${key} LIKE '%' || $${index + 1} || '%'`;
        } else {
          filter += ` AND ${key} = $${index + 1}`;
        }
      }
      filterValues.push(value);
    });

    const { rows } = await pool.query(
      `
      SELECT 
        *
      FROM vendor
      ${filter}
      ORDER BY created_at DESC
      LIMIT ${LIMIT} OFFSET ${OFFSET}
      `,
      filterValues
    );
    res.status(200).json(new ApiResponse(200, "", rows));
  }
);

export const getSingleVendorInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rows, rowCount } = await pool.query(
      `SELECT * FROM vendor WHERE vendor_id = $1`,
      [req.params.vendor_id]
    );

    if (rowCount === 0) throw new ErrorHandler(400, "No Consumable Info Exist");

    res.status(200).json(new ApiResponse(200, "", rows[0]));
  }
);

export const addNewVendorItem = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = addNewVendorValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const { columns, params, values } = objectToSqlInsert(req.body);
    await pool.query(`INSERT INTO vendor ${columns} VALUES ${params}`, values);

    res.status(201).json(new ApiResponse(201, "New Item Has Added"));
  }
);

export const addMultipleVendorItem = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = addMultipleVendorItemValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(
      `INSERT INTO vendor (vendor_name, service_type, address, contact_details, institute) VALUES ${
        sqlPlaceholderCreator(5, value.length).placeholder
      }`,
      value.flatMap((item) => [
        item.vendor_name,
        item.service_type,
        item.address,
        item.contact_details,
        item.institute,
      ])
    );

    res.status(201).json(new ApiResponse(201, "Vendor Information Saved"));
  }
);

export const updateVendorItem = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = updateVendorValidator.validate({
      ...req.body,
      ...req.params,
    });
    if (error) throw new ErrorHandler(400, error.message);

    const { keys, values, paramsNum } = objectToSqlConverterUpdate(req.body);
    values.push(req.params.vendor_id);
    await pool.query(
      `UPDATE vendor SET ${keys} WHERE vendor_id = $${paramsNum}`,
      values
    );

    res.status(200).json(new ApiResponse(200, "Item Has Updated"));
  }
);

export const deleteVendorItem = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = deleteVendorValidator.validate(req.params);
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(`DELETE FROM vendor WHERE vendor_id = $1`, [
      req.params.vendor_id,
    ]);

    res.status(200).json(new ApiResponse(200, "Item Has Deleted"));
  }
);

export const getVendorFiltersItemInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rows } = await pool.query(
      `SELECT 
        JSON_AGG(DISTINCT service_type) AS service_type
       FROM vendor`
    );
    res.status(200).json(new ApiResponse(200, "", rows[0]));
  }
);
