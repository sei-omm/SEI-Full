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
    const { rows } = await pool.query(`
      SELECT l.*, e.name AS employee_name, e.profile_image AS employee_profile_image FROM ${table_name} AS l
      JOIN employee AS e
      ON l.employee_id = e.id

      WHERE e.institute = $1

      ORDER BY id DESC

      LIMIT ${LIMIT} OFFSET ${OFFSET}
    `, [value.institute]);
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
        SELECT * FROM employee_leave WHERE employee_id = $1
        AND financial_year_date >= get_financial_year_start()
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

      await client.query(
        `INSERT INTO ${table_name} ${columns} VALUES ${params}`,
        values
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

      sql3 = `UPDATE employee_leave SET ${leave_type} = ${leave_type} - 1 WHERE employee_id = $1 AND financial_year_date >= get_financial_year_start() RETURNING ${leave_type}`;

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        const { rows } = await client.query(sql3, [req.body.employee_id]);
        if (rows[0][leave_type] < 0)
          throw new ErrorHandler(404, "He Don't Have Any Leave Avilable");

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
      sql3 = `UPDATE employee_leave SET ${leave_type} = ${leave_type} + 1 WHERE employee_id = $1 AND financial_year_date >= get_financial_year_start()`;

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
        el.ml
      FROM employee_leave el

      LEFT JOIN employee e
      ON e.id = el.employee_id AND financial_year_date = get_financial_year_start()

      WHERE e.institute = $1
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
