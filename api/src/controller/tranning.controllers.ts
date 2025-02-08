import { pool } from "../config/db";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ErrorHandler } from "../utils/ErrorHandler";
import { objectToSqlInsert } from "../utils/objectToSql";
import {
  VGetSingleFormData,
  VSendFormData,
} from "../validator/tranning.validator";

export const getTranningList = asyncErrorHandler(async (req, res) => {
  const institute = req.query.institute;

  const { rows } = await pool.query(
    `
        SELECT
            e.id AS employee_id,
            e.profile_image,
            e.name,
            e.employee_type,
            COALESCE(
                json_agg(tr.*) FILTER (WHERE tr.employee_id IS NOT NULL),
                '[]'::json
            ) AS training_info
        FROM employee e

        LEFT JOIN tranning_requirement tr
        ON tr.employee_id = e.id

        WHERE e.is_active = true AND institute = $1

        GROUP BY e.id
        `,
    [institute ?? "Kolkata"]
  );

  res.status(200).json(new ApiResponse(200, "Tranning List", rows));
});

export const getTranningRequirementListEmployee = asyncErrorHandler(
  async (req, res) => {
    const employee_id = res.locals.employee_id;

    const { rows } = await pool.query(
      `
      SELECT
        tr.employee_id,
        tr.it_completed_date,
        tr.it_generated_date,
        tr.se_generated_date,
        tr.se_completed_date,
        tr.tr_generated_date,
        tr.tr_completed_date,
        tr.it_form_is_accepted,
        tr.se_form_is_accepted,
        tr.tr_form_is_accepted,
        e.employee_type
      FROM tranning_requirement tr

      LEFT JOIN employee e
      ON e.id = tr.employee_id

      WHERE tr.employee_id = $1
    `,
      [employee_id]
    );
    res.status(200).json(new ApiResponse(200, "Tranning Info", rows));
  }
);

export const sendFormData = asyncErrorHandler(async (req, res) => {
  const { error, value } = VSendFormData.validate(req.body);
  if (error) throw new ApiResponse(400, error.message);

  const actionType = value.action_type;
  delete req.body.action_type;

  const reqObj = { ...req.body };

  const today = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  if (value.tr_form_date && actionType === "Generate") {
    reqObj["tr_generated_date"] = today;
  }

  if (value.tr_form_date && actionType === "Accept") {
    reqObj["tr_completed_date"] = today;
  }

  if (value.se_form_data && actionType === "Generate") {
    reqObj["se_generated_date"] = today;
  }

  if (value.se_form_data && actionType === "Accept") {
    reqObj["se_completed_date"] = today;
  }

  if (value.it_form_data && actionType === "Generate") {
    reqObj["it_generated_date"] = today;
  }

  if (value.it_form_data && actionType === "Accept") {
    reqObj["it_completed_date"] = today;
  }

  const { columns, params, values } = objectToSqlInsert(reqObj);

  let excludeValues = "";

  if (actionType === "Generate") {
    excludeValues += value.it_form_data
      ? `it_form_data = EXCLUDED.it_form_data, it_generated_date = EXCLUDED.it_generated_date`
      : "";
    excludeValues += value.se_form_data
      ? "se_form_data = EXCLUDED.se_form_data, se_generated_date = EXCLUDED.se_generated_date"
      : "";
    excludeValues += value.tr_form_date
      ? "tr_form_date = EXCLUDED.tr_form_date, tr_generated_date = EXCLUDED.tr_generated_date"
      : "";
  } else {
    excludeValues += value.it_form_data
      ? `it_form_data = EXCLUDED.it_form_data, it_completed_date = EXCLUDED.it_completed_date, it_form_is_accepted = true`
      : "";
    excludeValues += value.se_form_data
      ? "se_form_data = EXCLUDED.se_form_data, se_completed_date = EXCLUDED.se_completed_date, se_form_is_accepted = true"
      : "";
    excludeValues += value.tr_form_date
      ? "tr_form_date = EXCLUDED.tr_form_date, tr_completed_date = EXCLUDED.tr_completed_date, tr_form_is_accepted = true"
      : "";
  }

  await pool.query(
    `
      INSERT INTO tranning_requirement ${columns} VALUES ${params}
      ON CONFLICT (employee_id) 
      DO UPDATE SET
      ${excludeValues}
    `,
    values
  );

  if (actionType === "Generate") {
    res.status(201).json(new ApiResponse(201, "Request Sended"));
  } else {
    res.status(200).json(new ApiResponse(201, "Request Accepted"));
  }
});

export const getSingleTranningFormData = asyncErrorHandler(async (req, res) => {
  const { error, value } = VGetSingleFormData.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);

  const { rows } = await pool.query(
    `SELECT ${value.col_name} FROM tranning_requirement WHERE employee_id = $1`,
    [value.employee_id]
  );

  res.status(200).json(new ApiResponse(200, "Form Data", rows[0]));
});
