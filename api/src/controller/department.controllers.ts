import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { pool } from "../config/db";
import { ErrorHandler } from "../utils/ErrorHandler";
import {
  addDepartmentValidator,
  addDesignationValidator,
  updateDepartmentValidator,
} from "../validator/department.validator";
import { sqlPlaceholderCreator } from "../utils/sql/sqlPlaceholderCreator";
import {
  objectToSqlConverterUpdate,
  objectToSqlInsert,
} from "../utils/objectToSql";

const table_name = "department";

export const getAllDepartments = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rows } = await pool.query(`SELECT * FROM ${table_name}`);

    res.status(200).json(new ApiResponse(200, "All Department List", rows));
  }
);

export const getSingleDepartment = asyncErrorHandler(async (req, res) => {
  const { rows, rowCount } = await pool.query(
    `SELECT * FROM ${table_name} WHERE id = $1`,
    [req.params.department_id]
  );

  if (rowCount === 0) throw new ErrorHandler(404, "Department Not Found");

  res.status(200).json(new ApiResponse(200, "Single Department Info", rows[0]));
});

export const addNewDepartment = asyncErrorHandler(
  async (req: Request, res: Response) => {
    // const name = (req.body.department_name as string) || null;

    // if (!name) throw new ErrorHandler(404, "'department_name' is required");

    // const { rows } = await pool.query(
    //   `INSERT INTO ${table_name} (name) VALUES ($1) RETURNING *`,
    //   [name]
    // );

    // res.status(201).json(new ApiResponse(201, "New Department Added", rows));

    const { error } = addDepartmentValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const { columns, params, values } = objectToSqlInsert(req.body);
    await pool.query(
      `INSERT INTO department ${columns} VALUES ${params}`,
      values
    );

    res
      .status(201)
      .json(new ApiResponse(201, "Department And Designation Info Saved"));
  }
);

export const updateDepartment = asyncErrorHandler(
  async (req: Request, res: Response) => {
    // const id = (req.params.id as string) || null;
    // const name = (req.body.department_name as string) || null;

    // if (!id) throw new ErrorHandler(400, "'id' is required");

    // if (!name) throw new ErrorHandler(404, "'department_name' is required");

    // const { rows } = await pool.query(
    //   `UPDATE ${table_name} SET name = $1 WHERE id = $2 RETURNING *`,
    //   [name, id]
    // );

    // res
    //   .status(200)
    //   .json(new ApiResponse(200, "Department Successfully Updated", rows));

    const { error } = updateDepartmentValidator.validate({
      ...req.body,
      ...req.params,
    });
    if (error) throw new ErrorHandler(400, error.message);

    const { keys, values, paramsNum } = objectToSqlConverterUpdate(req.body);
    await pool.query(
      `UPDATE ${table_name} SET ${keys} WHERE id = $${paramsNum}`,
      [...values, req.params.department_id]
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Department Successfully Updated"));
  }
);

export const deleteDepartment = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const department_id = (req.params.department_id as string) || null;

    if (!department_id) throw new ErrorHandler(400, "'department_id' is required");

    await pool.query(`DELETE FROM ${table_name} WHERE id = $1`, [
      department_id,
    ]);

    res
      .status(200)
      .json(new ApiResponse(200, "Department Successfully Removed"));
  }
);

export const addDesignation = asyncErrorHandler(async (req, res) => {
  const { error, value } = addDesignationValidator.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  await pool.query(
    `INSERT INTO designations (department_id, deg_name) VALUES ${
      sqlPlaceholderCreator(2, value.length).placeholder
    }`,
    value.flatMap((item) => [item.department_id, item.deg_name])
  );

  res.status(200).json(new ApiResponse(200, "Designations Added"));
});

export const getAllDesignation = asyncErrorHandler(async (_, res) => {
  const { rows } = await pool.query(`
      SELECT
      DEG.*,
      DEP.name as department_name
      FROM designations AS DEG
      LEFT JOIN department AS DEP
      ON DEG.department_id = DEP.id
    `);
  res.status(200).json(new ApiResponse(200, "", rows));
});

// export const addDepartmentAndDesignation = asyncErrorHandler(
//   async (_, res) => {

//   }
// );
