import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { pool } from "../config/db";
import { ApiResponse } from "../utils/ApiResponse";
import { ErrorHandler } from "../utils/ErrorHandler";
import {
  createLeaveRequestValidator,
  updateLeaveStatusValidator,
  VEachEmployeLeaveDetails,
} from "../validator/leave.validator";
import { objectToSqlInsert } from "../utils/objectToSql";
import { getDate } from "../utils/getDate";
import { parsePagination } from "../utils/parsePagination";
import { transaction } from "../utils/transaction";
import { countDays } from "../utils/countDays";

const table_name = "leave";

export const getRequestedLeaveLists = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = VEachEmployeLeaveDetails.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    const { LIMIT, OFFSET } = parsePagination(req);
    const { rows } = await pool.query(
      `
      SELECT l.*, e.name AS employee_name, e.profile_image AS employee_profile_image FROM ${table_name} AS l
      JOIN employee AS e
      ON l.employee_id = e.id

      WHERE e.institute = $1

      ORDER BY id DESC

      LIMIT ${LIMIT} OFFSET ${OFFSET}
    `,
      [value.institute]
    );
    res.status(200).json(new ApiResponse(200, "All Leave Requests", rows));
  }
);

// SELECT * FROM employee_leave WHERE employee_id = $1
//         AND financial_year_date >=
//           CASE
//             WHEN EXTRACT(MONTH FROM CURRENT_DATE) < 4
//             THEN MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT - 1, 4, 1)
//             ELSE MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT, 4, 1)
//           END
//         AND financial_year_date <
//           CASE
//             WHEN EXTRACT(MONTH FROM CURRENT_DATE) < 4
//             THEN MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT, 4, 1)
//             ELSE MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1, 4, 1)
//           END
export const getEmployeeLeaveRequest = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const [leaveRequestList, leaveDetails] = await transaction([
      {
        sql: `SELECT * FROM ${table_name} WHERE employee_id = $1 ORDER BY id DESC`,
        values: [res.locals?.employee_id],
      },
      {
        sql: `
          SELECT 
            el.employee_id,
            el.cl,
            el.sl,
            el.el,
            (CASE WHEN e.gender = 'Male' THEN NULL ELSE el.ml END) AS ml,
            el.financial_year_date
          FROM employee_leave el

          LEFT JOIN employee e
          ON e.id = el.employee_id

          WHERE el.employee_id = $1
          AND el.financial_year_date >= get_financial_year_start()

        `,
        values: [res.locals?.employee_id],
      },
    ]);

    res.status(200).json(
      new ApiResponse(200, "Employee Leave Request", {
        leave_request_list: leaveRequestList.rows,
        leave_details: leaveDetails.rows,
      })
    );
  }
);

export const createEmployeeLeaveRequest = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = createLeaveRequestValidator.validate({
      ...req.body,
      employee_id: res.locals?.employee_id,
    });

    if (error) throw new ErrorHandler(400, error.message);

    const leave_type = req.body.leave_type;

    const { columns, params, values } = objectToSqlInsert({
      ...req.body,
      employee_id: res.locals?.employee_id,
    });

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { rowCount, rows } = await client.query(
        `
          SELECT ${leave_type} FROM employee_leave
          WHERE ${leave_type} > 0 AND employee_id = $1 AND financial_year_date >= get_financial_year_start() 
        `,
        [res.locals?.employee_id]
      );

      if (rowCount === 0)
        throw new ErrorHandler(400, "You Do Not Have Any Leave Left");

      const total_leave_days = countDays(
        req.body.leave_from,
        req.body.leave_to
      );
      if (total_leave_days > rows[0][leave_type]) {
        throw new ErrorHandler(
          400,
          `You Have Total ${rows[0][leave_type]} Day Remain Leaves And You Want ${total_leave_days} Which Is Not Possible`
        );
      }

      const { rowCount: totalRowCreated } = await client.query(
        `
        INSERT INTO ${table_name} ${columns} VALUES ${params}
        ON CONFLICT DO NOTHING
        `,
        values
      );

      if (totalRowCreated === 0)
        throw new ErrorHandler(
          400,
          "You have already submitted a leave request for this date."
        );

      await client.query(
        `UPDATE employee_leave SET ${leave_type} = ${leave_type} - ${total_leave_days} WHERE employee_id = $1 AND financial_year_date >= get_financial_year_start() RETURNING ${leave_type}`,
        [res.locals?.employee_id]
      );

      await client.query("COMMIT");
      client.release();
    } catch (error: any) {
      await client.query("ROLLBACK");
      client.release();
      throw new ErrorHandler(400, error.message);
    }

    res.status(200).json(new ApiResponse(200, "Leave request has sended"));
  }
);

export const updateLeaveStatus = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = updateLeaveStatusValidator.validate({
      ...req.body,
      ...req.params,
    });

    if (error) throw new ErrorHandler(400, error.message);

    let sql1 = "";
    let sql2 = "";
    let sql3 = "";

    const leave_type = req.body.leave_type;

    if (value.leave_status === "success") {
      const leaveStartDate = new Date(getDate(new Date(value.leave_from)));
      const leaveEndDate = new Date(getDate(new Date(value.leave_to)));

      const datas = [];

      // Loop through each day
      while (leaveStartDate <= leaveEndDate) {
        datas.push({
          employee_id: value.employee_id,
          date: leaveStartDate.toISOString().split("T")[0],
          status: "Absent",
        });
        leaveStartDate.setDate(leaveStartDate.getDate() + 1);
      }

      sql1 = `
          UPDATE leave
          SET leave_status = $1
          WHERE id = $2;
        `;

      sql2 = `
          INSERT INTO attendance (employee_id, date, status)
          VALUES ${datas
            .map(
              (_: any, i: number) =>
                `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`
            )
            .join(", ")};
        `;

      const total_leave_days = countDays(value.leave_from, value.leave_to);

      sql3 = `UPDATE employee_leave SET ${leave_type} = ${leave_type} - ${total_leave_days} WHERE employee_id = $1 AND financial_year_date >= get_financial_year_start() AND ${leave_type} > 0`;

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        if (value.previous_status !== "pending") {
          await client.query(sql3, [req.body.employee_id]);
        }

        await client.query(sql1, [value.leave_status, value.id]);

        await client.query(
          sql2,
          datas.flatMap((data: any) => [
            data.employee_id,
            data.date,
            data.status,
          ])
        );

        await client.query("COMMIT");
        client.release();
      } catch (error: any) {
        await client.query("ROLLBACK");
        client.release();
        throw new ErrorHandler(400, error.message);
      }
    } else {
      sql1 = `DELETE FROM attendance WHERE employee_id = $1 AND date BETWEEN $2 AND $3`;
      sql2 = `UPDATE ${table_name} SET leave_status = $1 WHERE id = $2`;
      const total_leave_days = countDays(value.leave_from, value.leave_to);
      sql3 = `UPDATE employee_leave SET ${leave_type} = ${leave_type} + ${total_leave_days} WHERE employee_id = $1 AND financial_year_date >= get_financial_year_start()`;

      await transaction([
        {
          sql: sql1,
          values: [value.employee_id, value.leave_from, value.leave_to],
        },
        {
          sql: sql2,
          values: [value.leave_status, value.id],
        },
        {
          sql: sql3,
          values: [req.body.employee_id],
        },
      ]);
    }

    res
      .status(200)
      .json(new ApiResponse(200, "Employee Leave Request Status Updated"));
  }
);

export const getEachEmployeLeaveDetails = asyncErrorHandler(
  async (req, res) => {
    const { error, value } = VEachEmployeLeaveDetails.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows } = await pool.query(
      `
      SELECT
        e.name,
        e.profile_image,
        el.cl,
        el.sl,
        el.el,
        CASE WHEN e.gender = 'Male' THEN 'NA' ELSE el.ml::TEXT END
      FROM employee_leave el

      LEFT JOIN employee e
      ON e.id = el.employee_id AND financial_year_date = get_financial_year_start()

      WHERE e.institute = $1 AND e.is_active = true
  `,
      [value.institute]
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, "Each Employee Leave Details This Year", rows)
      );
  }
);

export const removeLeaveRequestRow = asyncErrorHandler(async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `DELETE FROM leave WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    await client.query(
      `DELETE FROM attendance WHERE employee_id = $1 AND date BETWEEN $2 AND $3`,
      [rows[0].employee_id, rows[0].leave_from, rows[0].leave_to]
    );

    const leave_type = rows[0].leave_type;

    const total_leave_days = countDays(rows[0].leave_from, rows[0].leave_to);

    if (rows[0].leave_status !== "decline") {
      await client.query(
        `UPDATE employee_leave SET ${leave_type} = ${leave_type} + ${total_leave_days} WHERE employee_id = $1 AND financial_year_date >= get_financial_year_start()`,
        [rows[0].employee_id]
      );
    }

    await client.query("COMMIT");
    client.release();
  } catch (error: any) {
    await client.query("ROLLBACK");
    client.release();
    throw new ErrorHandler(400, error?.message);
  }

  res.status(200).json(new ApiResponse(200, "Leave Request Has Removed"));
});

// export const addEarnLeaveToAllEmployee = asyncErrorHandler(async (req, res) => {
//   const { rowCount } = await pool.query(`
//     SELECT 1 
//     FROM earned_leave_history 
//     WHERE DATE_TRUNC('month', month) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')
//     LIMIT 1
//   `);

//   if (rowCount !== 0)
//     return res.status(200).json(new ApiResponse(200, "Have Already Done"));

//   //i have to check has employee done 24 days contunius job or not if yes add 1 to existed_earned_leave

//   //get all the employee_id  who have done 24 days contunius work (SKIP holiday, and employee_taken leave)

//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");
//     const { rows } = await client.query(
//       `
//         WITH current_month_days AS (
//           SELECT DATE_PART('day', (DATE_TRUNC('month', NOW() - INTERVAL '1 month') + INTERVAL '1 month - 1 day')) AS total_days
//         ),
//         current_month_holiday AS (
//           SELECT
//             COUNT(holiday_id) as total_holiday_this_month,
//             institute
//           FROM holiday_management
//           WHERE DATE_TRUNC('month', holiday_date) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')

//           GROUP BY institute
//         )

//         SELECT
//           e.id AS employee_id,
//           cmd.total_days AS total_month_days, 
//           COUNT(a.id) as total_not_present,
//           cmh.total_holiday_this_month,
//           (cmd.total_days - COUNT(a.id) - cmh.total_holiday_this_month) AS total_present_days
//         FROM employee_leave el

//         LEFT JOIN employee e
//         ON e.joining_date <= CURRENT_DATE - INTERVAL '1 year' AND e.id = el.employee_id

//         LEFT JOIN attendance a
//         ON a.employee_id = el.employee_id AND DATE_TRUNC('month', a.date) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')

//         CROSS JOIN current_month_days cmd
//         LEFT JOIN current_month_holiday cmh
//         ON cmh.institute = e.institute

//         GROUP BY e.id, cmd.total_days, cmh.total_holiday_this_month

//         HAVING 
//             (cmd.total_days - COUNT(a.id) - COALESCE(cmh.total_holiday_this_month, 0)) >= 24
//       `
//     );

//     // now update earn_leave value with +1
//     const employeeIds = rows.map((item) => item.employee_id).join(",");
//     await client.query(
//       `UPDATE employee_leave SET el = el + 1 WHERE employee_id IN (${employeeIds})`
//     );

//     await client.query(
//       `INSERT INTO earned_leave_history (month) VALUES (DATE_TRUNC('month', NOW() - INTERVAL '1 month'))`
//     );

//     await client.query("COMMIT");
//     client.release();
//   } catch (error: any) {
//     console.log(error);
//     await client.query("ROLLBACK");
//     client.release();
//     throw new ErrorHandler(400, error?.message);
//   }

//   res.status(200).json(new ApiResponse(200, "Successfully Updated"));
// });

export const addEarnLeaveToAllEmployee = asyncErrorHandler(async (req, res) => {
  const { rowCount } = await pool.query(`
    SELECT 1 
    FROM earned_leave_history 
    WHERE DATE_TRUNC('month', month) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')
    LIMIT 1
  `);

  if (rowCount !== 0)
    return res.status(200).json(new ApiResponse(200, "Have Already Done"));

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `
        WITH current_month_days AS (
          SELECT DATE_PART('day', (DATE_TRUNC('month', NOW() - INTERVAL '1 month') + INTERVAL '1 month - 1 day')) AS total_days
        ),
        current_month_holiday AS (
          SELECT
            COUNT(holiday_id) as total_holiday_this_month,
            institute
          FROM holiday_management
          WHERE DATE_TRUNC('month', holiday_date) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')
          GROUP BY institute
        )
        SELECT
          e.id AS employee_id,
          cmd.total_days AS total_month_days, 
          COUNT(a.id) AS total_not_present,
          COALESCE(cmh.total_holiday_this_month, 0) AS total_holiday_this_month,
          (cmd.total_days - COUNT(a.id) - COALESCE(cmh.total_holiday_this_month, 0)) AS total_present_days
        FROM employee e
        LEFT JOIN employee_leave el ON e.id = el.employee_id
        LEFT JOIN attendance a 
          ON a.employee_id = e.id 
          AND DATE_TRUNC('month', a.date) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')
        CROSS JOIN current_month_days cmd
        LEFT JOIN current_month_holiday cmh 
          ON cmh.institute = e.institute
        WHERE e.joining_date <= CURRENT_DATE - INTERVAL '1 year'
        GROUP BY e.id, cmd.total_days, cmh.total_holiday_this_month
        HAVING (cmd.total_days - COUNT(a.id) - COALESCE(cmh.total_holiday_this_month, 0)) >= 24
      `
    );

    const employeeIds = rows.map((item) => item.employee_id).join(",");

    if (employeeIds.length > 0) {
      await client.query(
        `UPDATE employee_leave SET el = el + 1 WHERE employee_id IN (${employeeIds})`
      );
    }

    await client.query(
      `INSERT INTO earned_leave_history (month) VALUES (DATE_TRUNC('month', NOW() - INTERVAL '1 month'))`
    );

    await client.query("COMMIT");
    client.release();
  } catch (error : any) {
    await client.query("ROLLBACK");
    client.release();
    throw new ErrorHandler(400, error?.message);
  }

  res.status(200).json(new ApiResponse(200, "Successfully Updated"));
});

export const addLeaveValuesYearly = asyncErrorHandler(async (req, res) => {
  // await pool.query(
  //   `
  //   INSERT INTO employee_leave (employee_id, cl, sl, el, ml)
  //   SELECT employee_id, cl + 10, sl + 10, el, 84
  //   FROM employee_leave
  //   ON CONFLICT (employee_id, financial_year_date) DO NOTHING;
  //   `
  // );

  await pool.query(
    `
    INSERT INTO employee_leave (employee_id, cl, sl, el, ml)
    SELECT 
        e.id, 
        -- COALESCE(el.cl, 10),  -- If not in employee_leave, start with 10
        10, -- cl aloways 10
        CASE 
            WHEN (COALESCE(el.sl, 0) + 10) <= 30 THEN COALESCE(el.sl, 0) + 10
            ELSE 30
        END,
        COALESCE(el.el, 0),  -- Default EL to 0 if not found
        84
    FROM employee e
    LEFT JOIN employee_leave el ON e.id = el.employee_id
    ON CONFLICT (employee_id, financial_year_date) DO NOTHING;

    `
  )

  res.status(200).json(new ApiResponse(200, "Successfully Updated"));
});
