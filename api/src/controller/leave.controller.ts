import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { pool } from "../config/db";
import { ApiResponse } from "../utils/ApiResponse";
import { ErrorHandler } from "../utils/ErrorHandler";
import {
  createLeaveRequestValidator,
  updateLeaveStatusValidator,
} from "../validator/leave.validator";
import { objectToSqlInsert } from "../utils/objectToSql";
import { getDate } from "../utils/getDate";
import { dbTransaction } from "../utils/dbTransaction";
import { parsePagination } from "../utils/parsePagination";
import { transaction } from "../utils/transaction";

const table_name = "leave";

export const getRequestedLeaveLists = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { LIMIT, OFFSET } = parsePagination(req);
    const { rows } = await pool.query(`
      SELECT l.*, e.name AS employee_name, e.profile_image AS employee_profile_image FROM ${table_name} AS l
      JOIN employee AS e
      ON l.employee_id = e.id

      ORDER BY id DESC

      LIMIT ${LIMIT} OFFSET ${OFFSET}
    `);
    res.status(200).json(new ApiResponse(200, "All Leave Requests", rows));
  }
);

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
        AND financial_year_date >=
          CASE 
            WHEN EXTRACT(MONTH FROM CURRENT_DATE) < 4 
            THEN MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT - 1, 4, 1) 
            ELSE MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT, 4, 1) 
          END
        AND financial_year_date <
          CASE 
            WHEN EXTRACT(MONTH FROM CURRENT_DATE) < 4 
            THEN MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT, 4, 1) 
            ELSE MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1, 4, 1) 
          END
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

    const { columns, params, values } = objectToSqlInsert({
      ...req.body,
      employee_id: res.locals?.employee_id,
    });

    const sql = `INSERT INTO ${table_name} ${columns} VALUES ${params}`;

    await pool.query(sql, values);

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
            .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
            .join(", ")};
        `;

      await dbTransaction({
        query1: { sql: sql1, values: [value.leave_status, value.id] },
        query2: {
          sql: sql2,
          values: datas.flatMap((data) => [
            data.employee_id,
            data.date,
            data.status,
          ]),
        },
      });
    } else {
      sql1 = `DELETE FROM attendance WHERE employee_id = $1 AND date BETWEEN $2 AND $3`;
      sql2 = `UPDATE ${table_name} SET leave_status = $1 WHERE id = $2`;

      await dbTransaction({
        query1: {
          sql: sql1,
          values: [value.employee_id, value.leave_from, value.leave_to],
        },
        query2: { sql: sql2, values: [value.leave_status, value.id] },
      });
    }

    res
      .status(200)
      .json(new ApiResponse(200, "Employee Leave Request Status Updated"));
  }
);
