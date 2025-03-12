import { pool } from "../config/db";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ErrorHandler } from "../utils/ErrorHandler";
import { parsePagination } from "../utils/parsePagination";
import {
  VAddNewNotice,
  VDeleteSingleNotice,
  VUpdateSingleNotice,
} from "../validator/website.validator";

export const addNewNotice = asyncErrorHandler(async (req, res) => {
  const { error, value } = VAddNewNotice.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  await pool.query(
    `INSERT INTO notice (heading, description, visible) VALUES ($1, $2, $3)`,
    [value.heading, value.description, value.visible]
  );

  res.status(201).json(new ApiResponse(201, "New notice added"));
});

export const updateSingleNotice = asyncErrorHandler(async (req, res) => {
  const { error, value } = VUpdateSingleNotice.validate({
    ...req.params,
    ...req.body,
  });
  if (error) throw new ErrorHandler(400, error.message);

  await pool.query(
    `UPDATE notice SET heading = $1, description = $2, visible = $3 WHERE notice_id = $4`,
    [value.heading, value.description, value.visible, value.notice_id]
  );

  res.status(200).json(new ApiResponse(200, "Notice Successfully Updated"));
});

export const deleteSingleNotice = asyncErrorHandler(async (req, res) => {
  const { error, value } = VDeleteSingleNotice.validate(req.params);
  if (error) throw new ErrorHandler(400, error.message);

  await pool.query(`DELETE FROM notice WHERE notice_id = $1`, [
    value.notice_id,
  ]);

  res.status(200).json(new ApiResponse(200, "Notice Removed"));
});

export const getSingleNotice = asyncErrorHandler(async (req, res) => {
  const { error, value } = VDeleteSingleNotice.validate(req.params);
  if (error) throw new ErrorHandler(400, error.message);

  const { rows, rowCount } = await pool.query(
    `SELECT * FROM notice WHERE notice_id = $1`,
    [value.notice_id]
  );

  if (!rowCount || rowCount === 0) {
    throw new ErrorHandler(400, "No Notice Avilable With This notice id");
  }

  res.status(200).json(new ApiResponse(200, "Single Notice Info", rows[0]));
});

export const getAllNotice = asyncErrorHandler(async (req, res) => {
  const { LIMIT, OFFSET } = parsePagination(req);

  const forWhome = req.query.for || "frontend";

  const { rows } = await pool.query(
    `
    SELECT * FROM notice

    ${forWhome === "crm" ? "" : "WHERE visible = true"}

    ORDER BY notice_id DESC

    LIMIT ${LIMIT} OFFSET ${OFFSET}
    `
  );

  res.status(200).json(new ApiResponse(200, "All Notice", rows));
});
