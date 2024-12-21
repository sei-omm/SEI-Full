import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { pool } from "../config/db";
import { ErrorHandler } from "../utils/ErrorHandler";
import {
  addNewSubjectValidator,
  deleteSubjectValidator,
  updateSubjectValidator,
} from "../validator/subject.validator";
import { ApiResponse } from "../utils/ApiResponse";

const tableName = "subjects";
export const getSubject = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rows } = await pool.query(`SELECT * FROM ${tableName}`);
    res.status(200).json(new ApiResponse(200, "Subjects", rows));
  }
);

export const addNewSubject = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = addNewSubjectValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(`INSERT INTO ${tableName} (subject_name) VALUES ($1)`, [
      req.body.subject_name,
    ]);

    res.status(200).json(new ApiResponse(200, "New Subject Has Added"));
  }
);

export const updateSubject = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = updateSubjectValidator.validate({
      ...req.body,
      ...req.params,
    });
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(
      `UPDATE ${tableName} SET subject_name = $1 WHERE subject_id = $2`,
      [req.body.subject_name, req.params.subject_id]
    );

    res.status(200).json(new ApiResponse(200, "Subject Info Updated"));
  }
);

export const deleteSubject = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = deleteSubjectValidator.validate(req.params);
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(`DELETE FROM ${tableName} WHERE subject_id = $1 `, [
      req.params.subject_id,
    ]);

    res.status(200).json(new ApiResponse(200, "Subject Has Deleted"));
  }
);
