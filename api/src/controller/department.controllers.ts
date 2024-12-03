import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { pool } from "../config/db";
import { ErrorHandler } from "../utils/ErrorHandler";

const table_name = "department";

export const getAllDepartments = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rows } = await pool.query(`SELECT * FROM ${table_name}`);

    res.status(200).json(new ApiResponse(200, "All Department List", rows));
  }
);

export const addNewDepartment = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const name = (req.body.department_name as string) || null;

    if (!name) throw new ErrorHandler(404, "'department_name' is required");

    const { rows } = await pool.query(
      `INSERT INTO ${table_name} (name) VALUES ($1) RETURNING *`,
      [name]
    );

    res.status(201).json(new ApiResponse(201, "New Department Added", rows));
  }
);

export const updateDepartment = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const id = (req.params.id as string) || null;
    const name = (req.body.department_name as string) || null;

    if (!id) throw new ErrorHandler(400, "'id' is required");

    if (!name) throw new ErrorHandler(404, "'department_name' is required");

    const { rows } = await pool.query(
      `UPDATE ${table_name} SET name = $1 WHERE id = $2 RETURNING *`,
      [name, id]
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Department Successfully Updated", rows));
  }
);

export const deleteDepartment = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const id = (req.params.id as string) || null;

    if (!id) throw new ErrorHandler(400, "'id' is required");

    const { rows } = await pool.query(
      `DELETE FROM ${table_name} WHERE id = $1 RETURNING *`,
      [id]
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Department Successfully Deleted", rows));
  }
);
