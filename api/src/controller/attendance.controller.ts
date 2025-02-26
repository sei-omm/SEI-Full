import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { pool } from "../config/db";
import { ApiResponse } from "../utils/ApiResponse";
import {
  addNewEmployeeAttendanceValidator,
  updateBuldAttendanceValidator,
} from "../validator/attendance.controller";
import { ErrorHandler } from "../utils/ErrorHandler";
import XLSX from "xlsx";
import { months } from "../constant";
import { filterToSql } from "../utils/filterToSql";
import { parsePagination } from "../utils/parsePagination";
import { getDatesInBetween } from "../utils/getDatesInBetween";
import { sqlPlaceholderCreator } from "../utils/sql/sqlPlaceholderCreator";
import { generateEmployeeAttendance } from "../service/attendance.service";

const date = new Date();
const table_name = "attendance";

// async function generateEmployeeAttendance(req: Request) {
//   const { LIMIT, OFFSET } = parsePagination(req);
//   let loopDate = 1;
//   const currentYear = req.query.year ?? date.getFullYear();
//   const currentMoth = req.query.month ?? date.getMonth() + 1;

// const queryForFilter = { ...req.query } as any;
// delete queryForFilter.month;
// delete queryForFilter.year;
// const { filterQuery, filterValues, placeholderNum } = filterToSql(
//   queryForFilter,
//   "e"
// );

//   const thisMonthLastDate = new Date(
//     parseInt(`${currentYear}`),
//     parseInt(`${currentMoth}`),
//     0
//   ).getDate();

//   const currentDate =
//     currentMoth != date.getMonth() + 1 ? thisMonthLastDate : date.getDate();

//   let selectColumns = "";

//   const startDate = `${currentYear}-${currentMoth}-${1}`;
//   const endDate = `${currentYear}-${currentMoth}-${
//     currentMoth != date.getMonth() + 1 ? thisMonthLastDate : currentDate
//   }`;

//   while (loopDate <= currentDate) {
//     const eachDate = `${currentYear}-${currentMoth}-${loopDate}`;

//     selectColumns += `${loopDate === 1 ? "" : ",\n"}COALESCE(MAX(
//           CASE
//               WHEN a.date = '${eachDate}' THEN a.status
//               -- WHEN l.leave_from = '${eachDate}' AND NOT l.leave_status = 'pending' THEN 'Absent'
//               WHEN '${eachDate}' BETWEEN l.leave_from AND l.leave_to THEN
//                 CASE
//                   WHEN l.leave_status = 'success' THEN 'Absent'
//                   WHEN e.joining_date < '${eachDate}' THEN 'Not Employed'
//                   ELSE 'Pending'
//                 END
//               ELSE NULL
//           END
//          ), 'Pending') AS "${eachDate}"`;
//     loopDate++;
//   }

//   const sql = `
//           SELECT
//           e.id AS employee_id,
//           e.name,
//           e.profile_image,
//           ${selectColumns}
//       FROM
//           employee e
//       LEFT JOIN
//           attendance a ON e.id = a.employee_id AND a.date BETWEEN $${placeholderNum} AND $${
//     placeholderNum + 1
//   }
//       LEFT JOIN
//           leave l ON e.id = l.employee_id

//        ${filterQuery}

//       GROUP BY
//           e.id, e.name
//       ORDER BY
//           e.id
//       LIMIT ${LIMIT} OFFSET ${OFFSET}
//     `;
//   return await pool.query(sql, [...filterValues, startDate, endDate]);
// }

// async function generateEmployeeAttendance(req: Request) {
//   const { LIMIT, OFFSET } = parsePagination(req);
//   const endData = new Date(2025, 1, 0);
//   const totalDays = endData.getDate();

// const queryForFilter = { ...req.query } as any;
// delete queryForFilter.month;
// delete queryForFilter.year;
// const { filterQuery, filterValues, placeholderNum } = filterToSql(
//   queryForFilter,
//   "e"
// );

//   let cases = "";
//   const currentMonth = endData.getMonth() + 1;
//   for (let i = 1; i <= totalDays; i++) {
//     const eachDate = `${endData.getFullYear()}-${
//       currentMonth <= 9 ? `0${currentMonth}` : currentMonth
//     }-${i <= 9 ? `0${i}` : i}`;
//     cases += `,
//       COALESCE(MAX(
//       CASE
//         WHEN e.joining_date <= TO_DATE('${eachDate}', 'YYYY-MM-DD') THEN
//             CASE
//               WHEN a.date = TO_DATE('${eachDate}', 'YYYY-MM-DD') THEN a.status
//               WHEN '${eachDate}' BETWEEN l.leave_from AND l.leave_to THEN
//                 CASE
//                   WHEN l.leave_status = 'success' THEN 'Absent'
//                   ELSE 'Pending'
//                 END
//               ELSE 'Pending'
//             END
//         ELSE NULL
//       END
//       ), 'Not Employed') AS "${eachDate}"
//     `;
//   }

//   const sql = `
//     SELECT
//      e.id AS employee_id,
//      e.name,
//      e.profile_image
//      ${cases}
//     FROM employee AS e

//     LEFT JOIN attendance AS a
//     ON e.id = a.employee_id

//     LEFT JOIN leave AS l
//     ON e.id = l.employee_id

//     ${filterQuery}

//     GROUP BY e.id, e.name

//     ORDER BY e.id

//     LIMIT ${LIMIT} OFFSET ${OFFSET}
//   `;

//   return await pool.query(sql);
// }

export const getAllEmployeeAllAttendances = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const rows = await generateEmployeeAttendance(req);
    // let loopDate = 1;
    // const currentYear = req.query.year ?? date.getFullYear();
    // const currentMoth = req.query.month ?? date.getMonth() + 1;

    // const thisMonthLastDate = new Date(
    //   parseInt(`${currentYear}`),
    //   parseInt(`${currentMoth}`),
    //   0
    // ).getDate();

    // const currentDate =
    //   currentMoth != date.getMonth() + 1 ? thisMonthLastDate : date.getDate();

    // let selectColumns = "";

    // const startDate = `${currentYear}-${currentMoth}-${1}`;
    // const endDate = `${currentYear}-${currentMoth}-${
    //   currentMoth != date.getMonth() + 1 ? thisMonthLastDate : currentDate
    // }`;

    // while (loopDate <= currentDate) {
    //   const eachDate = `${currentYear}-${currentMoth}-${loopDate}`;

    //   selectColumns += `${loopDate === 1 ? "" : ",\n"}COALESCE(MAX(
    //       CASE
    //           WHEN a.date = '${eachDate}' THEN a.status
    //           -- WHEN l.leave_from = '${eachDate}' AND NOT l.leave_status = 'pending' THEN 'Absent'
    //           WHEN '${eachDate}' BETWEEN l.leave_from AND l.leave_to THEN
    //             CASE
    //               WHEN l.leave_status = 'success' THEN 'Absent'
    //               ELSE 'Pending'
    //             END
    //           ELSE NULL
    //       END
    //      ), 'Pending') AS "${eachDate}"`;
    //   loopDate++;
    //   // selectColumns += `${loopDate === 1 ? "" : ",\n"}COALESCE(
    //   //   CASE
    //   //       WHEN a.date = '${eachDate}' THEN a.status
    //   //   END,
    //   //   'Pending'
    //   //   ) AS "${eachDate}"`;
    //   // loopDate++;
    // }

    // const sql = `
    //       SELECT
    //       e.id AS employee_id,
    //       e.name,
    //       e.profile_image,
    //       ${selectColumns}
    //   FROM
    //       employee e
    //   LEFT JOIN
    //       attendance a ON e.id = a.employee_id AND a.date BETWEEN $1 AND $2
    //   LEFT JOIN
    //       leave l ON e.id = l.employee_id
    //   GROUP BY
    //       e.id, e.name
    //   ORDER BY
    //       e.id;
    // `;
    // // const sql = `
    // //     SELECT
    // //     e.id AS employee_id,
    // //     e.name,
    // //     e.profile_image,
    // //     ${selectColumns}
    // // FROM
    // //     employee e
    // // LEFT JOIN
    // //     attendance a ON e.id = a.employee_id AND a.date BETWEEN $1 AND $2
    // // LEFT JOIN
    // //     leave l ON e.id = l.employee_id
    // // `;
    // const { rows } = await pool.query(sql, [startDate, endDate]);
    res.status(200).json(new ApiResponse(200, "All Data", rows));
  }
);

export const addNewEmployeeAttendance = asyncErrorHandler(
  async (req: Request, res: Response) => {
    //get all the employee
    const { error } = addNewEmployeeAttendanceValidator.validate(req.body);

    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(
      `INSERT INTO ${table_name} (status, employee_id) VALUES ($1, $2)`,
      [req.body.status, req.body.employee_id]
    );

    // const query = `
    //     WITH existing_record AS (
    //         SELECT *
    //         FROM attendance
    //         WHERE employee_id = $1
    //         AND date = CURRENT_DATE
    //     )
    //     UPDATE attendance
    //     SET status = $2
    //     WHERE employee_id = $1
    //     AND date = CURRENT_DATE;

    //     INSERT INTO attendance (employee_id, status)
    //     SELECT $1, $2, CURRENT_DATE
    //     WHERE NOT EXISTS (
    //         SELECT 1 FROM attendance WHERE employee_id = $1 AND date = CURRENT_DATE
    //     );
    // `;

    // await pool.query(query, [req.body.status, req.body.employee_id]);
    res.status(201).json(new ApiResponse(201, "Employee Attendance Updated"));
  }
);

export const updateEmployeeAttendance = asyncErrorHandler(
  async (req: Request, res: Response) => {
    //get all the employee
    const { error, value } = updateBuldAttendanceValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const sql = `
      INSERT INTO 
        ${table_name} (status, employee_id, date)
      VALUES 
        ${sqlPlaceholderCreator(3, value.length).placeholder}
      ON CONFLICT (employee_id, date)
      DO UPDATE
      SET status = EXCLUDED.status;
    `;

    await pool.query(
      sql,
      value.flatMap((item) => [item.attendance_option, item.employee_id, item.attendance_date])
    );

    res.status(200).json(new ApiResponse(200, "Employee Attendances Updated"));
  }
);

export const generateAttendanceSheet = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const currentMoth = req.query.month ?? date.getMonth() + 1;

    const rows = await generateEmployeeAttendance(req);

    if (rows.length === 0) throw new ErrorHandler(400, "No Employee Found");

    const excelSheetName = `${
      months[(currentMoth as number) - 1]
    }-Attendance-Sheet-Report.xlsx`;

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    // Write the workbook to a buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${excelSheetName}`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(excelBuffer);
  }
);
