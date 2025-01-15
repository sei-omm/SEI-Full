import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import {
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
import { apiPaginationSql } from "../utils/apiPaginationSql";
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
export const getAllItemInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { LIMIT, OFFSET } = parsePagination(req);
    const { filterQuery, filterValues } = filterToSql(req.query, "iii");

    const { rows } = await pool.query(
      `
        SELECT
            iii.item_id,
            iii.item_name,
            iii.category,
            iii.sub_category,
            iii.minimum_quantity,
            SUM(isi.opening_stock) AS opening_stock,
            SUM(isi.item_consumed) AS item_consumed,
            SUM(isi.opening_stock) - SUM(isi.item_consumed) AS closing_stock,
            iii.current_status,
            iii.current_purchase_date,
            iii.current_vendor_id,
            v.vendor_name AS current_vendor_name,
            iii.cost_per_unit_current,
            iii.cost_per_unit_previous,
            SUM(isi.total_value) AS total_value
        FROM inventory_item_info AS iii
        LEFT JOIN inventory_stock_info AS isi
          ON isi.item_id = iii.item_id
        LEFT JOIN vendor AS v
          ON v.vendor_id = iii.current_vendor_id
        
        ${filterQuery}

        GROUP BY iii.item_id, v.vendor_name

        ORDER BY iii.created_at DESC
        LIMIT ${LIMIT} OFFSET ${OFFSET}
   `,
      filterValues
    );

    res.status(200).json(new ApiResponse(200, "", rows));
  }
);

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
      (item_name, category, sub_category, where_to_use, used_by, description, minimum_quantity, institute)
     VALUES
      ${sqlPlaceholderCreator(8, value.length).placeholder}
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

export const consumeStock = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = consumeStockValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const { columns, values, params } = objectToSqlInsert(req.body);
    await pool.query(
      `INSERT INTO inventory_stock_info ${columns} VALUES ${params}`,
      values
    );

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

    if (req.query.institute) {
      filterQuery += " mr.institute = $1";
      filterValues.push(req.query.institute as string);
    }

    if (req.query.from_date && req.query.to_date) {
      if (filterQuery === "WHERE") {
        filterQuery += " mr.created_at BETWEEN $1 AND $2";
      } else {
        filterQuery += " AND mr.created_at BETWEEN $2 AND $3";
      }

      filterValues.push(req.query.from_date as string);
      filterValues.push(req.query.to_date as string);
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

  await pool.query(
    `INSERT INTO maintence_record (item_id, maintence_date, work_station, description_of_work, department, assigned_person, approved_by, cost, status, remark, institute, completed_date) VALUES ${
      sqlPlaceholderCreator(12, value.length).placeholder
    }`,
    value.flatMap((item) => [
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
    ])
  );

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

export const getMaintenceRecordsExcel = asyncErrorHandler(
  async (req: Request, res: Response) => {}
);

//for planned maintenance system
export const getPlannedMaintenanceSystem = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { LIMIT, OFFSET } = parsePagination(req);
    const { rows } = await pool.query(
      `
      SELECT 
      pm.*,
      iii.item_name
      FROM planned_maintenance_system AS pm

      LEFT JOIN inventory_item_info AS iii
      ON iii.item_id = pm.item_id

      ORDER BY planned_maintenance_system_id DESC
      LIMIT ${LIMIT} OFFSET ${OFFSET}
      `
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

export const addMultiPlannedMaintenanceSystem = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = addMultiPlannedMaintenanceSystemValidator.validate(
      req.body
    );
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(
      `
      INSERT INTO planned_maintenance_system 
        (item_id, frequency, last_done, next_due, description, remark)
      VALUES
        ${sqlPlaceholderCreator(6, value.length).placeholder}
      `,
      value.flatMap((item) => [
        item.item_id,
        item.frequency,
        item.last_done,
        item.next_due,
        item.description,
        item.remark,
      ])
    );

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
