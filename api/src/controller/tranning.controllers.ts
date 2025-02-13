import { pool } from "../config/db";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ErrorHandler } from "../utils/ErrorHandler";
import { parsePagination } from "../utils/parsePagination";
import {
  VCompleteTranning,
  VGenerateForm,
  VGetSingleFormData,
  VGetTranningListEmployee,
} from "../validator/tranning.validator";

// export const getTranningList = asyncErrorHandler(async (req, res) => {
//   const institute = req.query.institute;

//   const { rows } = await pool.query(
//     `
//         SELECT
//             e.id AS employee_id,
//             e.profile_image,
//             e.name,
//             e.employee_type,
//             COALESCE(
//                 json_agg(tr.*) FILTER (WHERE tr.employee_id IS NOT NULL),
//                 '[]'::json
//             ) AS training_info
//         FROM employee e

//         LEFT JOIN tranning_requirement tr
//         ON tr.employee_id = e.id

//         WHERE e.is_active = true AND institute = $1

//         GROUP BY e.id
//         `,
//     [institute ?? "Kolkata"]
//   );

//   res.status(200).json(new ApiResponse(200, "Tranning List", rows));
// });

// export const getTranningRequirementListEmployee = asyncErrorHandler(
//   async (req, res) => {
//     const employee_id = res.locals.employee_id;

//     const { rows } = await pool.query(
//       `
//       SELECT
//         tr.employee_id,
//         tr.it_completed_date,
//         tr.it_generated_date,
//         tr.se_generated_date,
//         tr.se_completed_date,
//         tr.tr_generated_date,
//         tr.tr_completed_date,
//         tr.it_form_is_accepted,
//         tr.se_form_is_accepted,
//         tr.tr_form_is_accepted,
//         e.employee_type
//       FROM tranning_requirement tr

//       LEFT JOIN employee e
//       ON e.id = tr.employee_id

//       WHERE tr.employee_id = $1
//     `,
//       [employee_id]
//     );
//     res.status(200).json(new ApiResponse(200, "Tranning Info", rows));
//   }
// );

// export const sendFormData = asyncErrorHandler(async (req, res) => {
//   const { error, value } = VSendFormData.validate(req.body);
//   if (error) throw new ApiResponse(400, error.message);

//   const actionType = value.action_type;
//   delete req.body.action_type;

//   const reqObj = { ...req.body };

//   const today = new Intl.DateTimeFormat("en-CA", {
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   }).format(new Date());

//   if (value.tr_form_date && actionType === "Generate") {
//     reqObj["tr_generated_date"] = today;
//   }

//   if (value.tr_form_date && actionType === "Accept") {
//     reqObj["tr_completed_date"] = today;
//   }

//   if (value.se_form_data && actionType === "Generate") {
//     reqObj["se_generated_date"] = today;
//   }

//   if (value.se_form_data && actionType === "Accept") {
//     reqObj["se_completed_date"] = today;
//   }

//   if (value.it_form_data && actionType === "Generate") {
//     reqObj["it_generated_date"] = today;
//   }

//   if (value.it_form_data && actionType === "Accept") {
//     reqObj["it_completed_date"] = today;
//   }

//   const { columns, params, values } = objectToSqlInsert(reqObj);

//   let excludeValues = "";

//   if (actionType === "Generate") {
//     excludeValues += value.it_form_data
//       ? `it_form_data = EXCLUDED.it_form_data, it_generated_date = EXCLUDED.it_generated_date`
//       : "";
//     excludeValues += value.se_form_data
//       ? "se_form_data = EXCLUDED.se_form_data, se_generated_date = EXCLUDED.se_generated_date"
//       : "";
//     excludeValues += value.tr_form_date
//       ? "tr_form_date = EXCLUDED.tr_form_date, tr_generated_date = EXCLUDED.tr_generated_date"
//       : "";
//   } else {
//     excludeValues += value.it_form_data
//       ? `it_form_data = EXCLUDED.it_form_data, it_completed_date = EXCLUDED.it_completed_date, it_form_is_accepted = true`
//       : "";
//     excludeValues += value.se_form_data
//       ? "se_form_data = EXCLUDED.se_form_data, se_completed_date = EXCLUDED.se_completed_date, se_form_is_accepted = true"
//       : "";
//     excludeValues += value.tr_form_date
//       ? "tr_form_date = EXCLUDED.tr_form_date, tr_completed_date = EXCLUDED.tr_completed_date, tr_form_is_accepted = true"
//       : "";
//   }

//   await pool.query(
//     `
//       INSERT INTO tranning_requirement ${columns} VALUES ${params}
//       ON CONFLICT (employee_id)
//       DO UPDATE SET
//       ${excludeValues}
//     `,
//     values
//   );

//   if (actionType === "Generate") {
//     res.status(201).json(new ApiResponse(201, "Request Sended"));
//   } else {
//     res.status(200).json(new ApiResponse(201, "Request Accepted"));
//   }
// });

// export const getSingleTranningFormData = asyncErrorHandler(async (req, res) => {
//   const { error, value } = VGetSingleFormData.validate(req.query);
//   if (error) throw new ErrorHandler(400, error.message);

//   const { rows } = await pool.query(
//     `SELECT ${value.col_name} FROM tranning_requirement WHERE employee_id = $1`,
//     [value.employee_id]
//   );

//   res.status(200).json(new ApiResponse(200, "Form Data", rows[0]));
// });

export const getTranningList = asyncErrorHandler(async (req, res) => {
  const institute = req.query.institute || "Kolkata";
  const { LIMIT, OFFSET } = parsePagination(req);

  const { rows } = await pool.query(
    `
    SELECT
      e.id AS employee_id,             
      e.profile_image,
      e.name,
      e.employee_type
    FROM employee e

    WHERE e.institute = $1 AND e.is_active = true

    LIMIT ${LIMIT} OFFSET ${OFFSET}
    `,
    [institute]
  );

  res.status(200).json(new ApiResponse(200, "Employee List", rows));
});

export const generateForm = asyncErrorHandler(async (req, res) => {
  const { error, value } = VGenerateForm.validate(req.body);
  if (error) throw new ApiResponse(400, error.message);

  const actionType = value.action_type as "Generate" | "Accept";

  await pool.query(
    `
    INSERT INTO tranning_requirement 
      (tranning_name, employee_id, employee_visibility, form_data)
    VALUES
      ($1, $2, $3, $4)
    `,
    [
      value.tranning_name,
      value.employee_id,
      value.employee_visibility,
      value.form_data,
    ]
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
    `SELECT form_data, record_id FROM tranning_requirement WHERE employee_id = $1 AND tranning_name = $2`,
    [value.employee_id, value.tranning_name]
  );

  res.status(200).json(new ApiResponse(200, "Form Data", rows[0]));
});

export const getTranningListEmployee = asyncErrorHandler(async (req, res) => {
  const { error, value } = VGetTranningListEmployee.validate({
    employee_id: res.locals.employee_id,
  });
  if (error) throw new ErrorHandler(400, error.message);

  const { rows } = await pool.query(
    `SELECT 
      tr.employee_id,
      tr.record_id,
      tr.tranning_name,
      tr.created_at,
      tr.completed_at,
      e.employee_type
    FROM tranning_requirement tr

    LEFT JOIN employee e
    ON e.id = tr.employee_id
    
    WHERE employee_id = $1 AND employee_visibility = true

    ORDER BY tr.record_id DESC
    
    `,
    [value.employee_id]
  );

  res.status(200).json(new ApiResponse(200, "Data", rows));
});

export const completeTranning = asyncErrorHandler(async (req, res) => {
  const { error, value } = VCompleteTranning.validate({
    ...req.params,
    ...req.body,
  });
  if (error) throw new ErrorHandler(400, error.message);

  await pool.query(
    `UPDATE tranning_requirement 
      SET completed_at = CURRENT_TIMESTAMP,
          form_data = $1
     WHERE record_id = $2`,
    [value.form_data, value.record_id]
  );

  res.status(200).json(new ApiResponse(200, "Successfully Completed"));
});

export const getTranningHistoryList = asyncErrorHandler(async (req, res) => {
  const { LIMIT, OFFSET } = parsePagination(req);
  const { rows } = await pool.query(
    `
    SELECT 
      tr.record_id,
      tr.employee_id, 
      e.name, 
      e.profile_image, 
      tr.tranning_name, 
      tr.created_at, 
      tr.completed_at,
      tr.employee_visibility,
      e.employee_type
    FROM 
      tranning_requirement tr 
      LEFT JOIN employee e ON e.id = tr.employee_id

    ORDER BY tr.record_id DESC

    LIMIT ${LIMIT} OFFSET ${OFFSET}
    `
  );

  res.status(200).json(new ApiResponse(200, "Tranning History List", rows));
});
