import { pool } from "../config/db";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ErrorHandler } from "../utils/ErrorHandler";
import { sqlPlaceholderCreator } from "../utils/sql/sqlPlaceholderCreator";
import {
  addPayscaleValidator,
  getPayscaleValidator,
  updatePayscaleValidator,
} from "../validator/payscale.validator";

export const addPayscale = asyncErrorHandler(async (req, res) => {
  const { error, value } = addPayscaleValidator.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  await pool.query(
    `INSERT INTO payscale 
        (item_type, item_value) 
    VALUES 
        ${sqlPlaceholderCreator(2, value.length).placeholder}
    `,
    value.flatMap((item) => [item.item_type, item.item_value])
  );

  res.status(201).json(new ApiResponse(201, "Successfully Added"));
});

export const getPayscale = asyncErrorHandler(async (req, res) => {
  const { error } = getPayscaleValidator.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);

  if (req.query.item_type === "Year") {
    const { rows } = await pool.query(
      "SELECT * FROM payscale WHERE item_type = 'Year'"
    );
    return res.json(
      new ApiResponse(200, "Payscale year fetched successfully", rows)
    );
  }

  if (req.query.item_type === "Payscale Label") {
    const { rows } = await pool.query(
      "SELECT * FROM payscale WHERE item_type = 'Payscale Label'"
    );
    return res.json(
      new ApiResponse(200, "Payscale label fetched successfully", rows)
    );
  }

  const { rows } = await pool.query(`
    SELECT 
        COALESCE(JSON_AGG(JSON_OBJECT('item_id' : item_id, 'item_value' : item_value)) FILTER (WHERE item_type = 'Year'), '[]'::JSON) AS year,
        COALESCE(JSON_AGG(JSON_OBJECT('item_id' : item_id, 'item_value' : item_value)) FILTER (WHERE item_type = 'Payscale Label'), '[]'::JSON) AS label
    FROM payscale;
    `);
  res.json(new ApiResponse(200, "Payscale fetched successfully", rows[0]));
});

export const updatePayscale = asyncErrorHandler(async (req, res) => {
  const { error, value } = updatePayscaleValidator.validate({
    ...req.body,
    ...req.params,
  });
  if (error) throw new ErrorHandler(400, error.message);

  await pool.query(
    `UPDATE manage_payscale 
    SET 
        payscale_label = $1, 
        payscale_year = $2 
    WHERE 
        payscale_id = $3
    `,
    [value.payscale_label, value.payscale_year, req.params.payscale_id]
  );

  res.json(new ApiResponse(200, "Payscale updated successfully"));
});

export const deletePayscale = asyncErrorHandler(async (req, res) => {
  await pool.query(`DELETE FROM payscale WHERE item_id = $1`, [
    req.params.item_id,
  ]);

  res.status(200).json(new ApiResponse(200, "Successfully Completed"));
});
