import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { pool } from "../config/db";
import { ApiResponse } from "../utils/ApiResponse";
import { ErrorHandler } from "../utils/ErrorHandler";
import {
  createLeaveRequestValidator,
  getLeaveReciptV,
  getOthersLeaveListV,
  updateLeaveStatusValidator,
  VEachEmployeLeaveDetails,
} from "../validator/leave.validator";
import { objectToSqlInsert } from "../utils/objectToSql";
import { getDate } from "../utils/getDate";
import { parsePagination } from "../utils/parsePagination";
import { transaction } from "../utils/transaction";
import { countDays } from "../utils/countDays";
import { AUTHORITY } from "../constant";
import { sendNotificationUtil } from "../utils/sendNotificationUtil";
import { beautifyDate } from "../utils/beautifyDate";

const table_name = "leave";

export const getRequestedLeaveLists = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = VEachEmployeLeaveDetails.validate({
      ...req.query,
    });
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

export const getOthersLeaveList = asyncErrorHandler(async (req, res) => {
  const { error, value } = getOthersLeaveListV.validate({
    employee_id: res.locals.employee_id,
  });
  if (error) throw new ErrorHandler(400, error.message);

  const { rows } = await pool.query(
    `
     SELECT
      l.id,
      l.employee_id,
      e.name as employee_name,
      e.profile_image AS employee_profile_image,
      l.leave_from,
      l.leave_to,
      l.leave_reason,
      lae.status as leave_status,
      l.leave_type,
      lae.item_id AS row_id
     FROM leave_and_employee lae

     LEFT JOIN leave AS l
     ON l.id = lae.leave_id

     LEFT JOIN employee AS e
     ON e.id = l.employee_id

     WHERE lae.to_employee_id = $1

     ORDER BY l.id DESC
    `,
    [value.employee_id]
  );

  res.status(200).json(new ApiResponse(200, "Others Leave Request", rows));
});

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
    const { error, value } = createLeaveRequestValidator.validate({
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

      // check is leave on the same date has already taken
      const { rowCount : existLeaveCount } = await client.query(
        `SELECT employee_id 
         FROM leave 
         WHERE employee_id = $1 
         AND leave_from <= $3 
         AND leave_to >= $2 
         LIMIT 1
        `,
        [value.employee_id, value.leave_from, value.leave_to]
      );

      if(existLeaveCount && existLeaveCount > 0) throw new ErrorHandler(400, "You already have a leave taken during this period. Please choose different dates.");


      // check is employee have any leave avilable or not
      const { rowCount, rows } = await client.query(
        `
          SELECT ${leave_type} FROM employee_leave
          WHERE ${leave_type} > 0 AND employee_id = $1 AND financial_year_date >= get_financial_year_start() 
        `,
        [value.employee_id]
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

      // get some info about current employee
      const { rows: currentEmployeeInfo } = await client.query(
        `SELECT id, authority, department_id, institute FROM employee WHERE id = $1`,
        [value.employee_id]
      );

      let highAuthorityName = "HOD";

      // add extra filter if higher authority is HOD than don't need to check department as it will got to HOI
      let extra_filter = "";
      const extra_filter_values: string[] = [];
      if (
        currentEmployeeInfo[0].authority !== "HOD" &&
        currentEmployeeInfo[0].authority !== "HOI"
      ) {
        extra_filter = " AND ha.department_id = $3";
        extra_filter_values.push(currentEmployeeInfo[0].department_id);
      } else {
        // check what is the name of current employee higher authority name ex : if HOD than HOI is higher
        const currentEmployeeAuthorityIndex = AUTHORITY.findIndex(
          (item) => item === currentEmployeeInfo[0].authority
        );
        const highAuthorityNameInner: string | undefined =
          AUTHORITY[currentEmployeeAuthorityIndex - 1];
        highAuthorityName = highAuthorityNameInner;
      }

      //find id form employee where authority is higher authority
      const { rows: highAuthorityInfo, rowCount: highAuthRowCount } =
        await client.query(
          `
          SELECT
            id,
            name
          FROM employee ha 
            WHERE ha.authority = $1
            AND ha.is_active = true
            AND ha.institute = $2
            ${extra_filter}
            `,
          [
            highAuthorityName,
            currentEmployeeInfo[0].institute,
            ...extra_filter_values,
          ]
        );

      if (highAuthRowCount === 0)
        throw new Error(
          "No higher authority is defined for " +
            currentEmployeeInfo[0].authority
        );

      const { rowCount: totalRowCreated, rows: leave } = await client.query(
        `
        INSERT INTO ${table_name} ${columns} VALUES ${params}
        ON CONFLICT DO NOTHING
        RETURNING id
        `,
        values
      );

      if (totalRowCreated === 0)
        throw new ErrorHandler(
          400,
          "You have already submitted a leave request for this date."
        );

      await client.query(
        `INSERT INTO leave_and_employee (leave_id, from_employee_id, to_employee_id) VALUES ($1, $2, $3)`,
        [leave[0].id, res.locals?.employee_id, highAuthorityInfo[0].id]
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
      who_is_updating_id: res.locals?.employee_id,
    });

    if (error) throw new ErrorHandler(400, error.message);

    const leave_type = req.body.leave_type;

    if (value.leave_status === "success") {
      //we will now check is it hod or hoi if yes then we will send a notification to the employee
      //don't update the status of leave table
      //only update the status of leave_and_employee table status
      //if it is hr than update leave table status and do other modification like update attendance and other related table

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        const { rows, rowCount } = await client.query(
          `UPDATE leave_and_employee SET status = 'success' WHERE item_id = $1 RETURNING to_employee_id`,
          [value.leave_and_employee_row_id]
        );

        if(!rowCount || rowCount === 0) throw new ErrorHandler(400, "No leave found");

        if(rows[0].to_employee_id !== value?.who_is_updating_id) {
          //if anyone want try to hack
          throw new ErrorHandler(400, "You are not able to change the leave status of an employee who didn't send you this leave request.");
        }

        const { rows: whoIsUpdatingInfo } = await client.query(
          `
          SELECT 
            authority, 
            institute,
            d.name as department_name 
          FROM employee e 

          LEFT JOIN department d
          ON d.id = e.department_id

          WHERE e.id = $1`,
          [value.who_is_updating_id]
        );

        const currentAuthority = whoIsUpdatingInfo[0].authority;

        if (
          whoIsUpdatingInfo[0].department_name !== "HR Department" &&
          (currentAuthority === "HOD" ||
            currentAuthority === "HOI" ||
            currentAuthority === "SUPER ADMIN")
        ) {
          //send a notification to the employee, update leave_and_employee table status, send the requst to the hr
          await sendNotificationUtil({
            notification_title: `Leave Request Status`,
            notification_description: `${currentAuthority} has approved your leave request; it will now be sent to the HR Department for final approval.`,
            notification_type: "private",
            employee_ids: [value.employee_id],
            client: client,
          });

          const { rows: hrInfo } = await client.query(
            `
            SELECT 
              e.id
            FROM employee e

            LEFT JOIN department d
            ON d.id = e.department_id

            WHERE authority = 'HOD' AND institute = $1 AND d.name = 'HR Department'`,
            [whoIsUpdatingInfo[0].institute]
          );

          await client.query(
            `INSERT INTO leave_and_employee (leave_id, from_employee_id, to_employee_id) VALUES ($1, $2, $3)`,
            [value.id, value.who_is_updating_id, hrInfo[0].id]
          );

          await client.query("COMMIT");
          client.release();

          return res
            .status(200)
            .json(
              new ApiResponse(
                200,
                "Leave request has been sent to the HR Department."
              )
            );
        }

        const leaveStartDate = new Date(getDate(new Date(value.leave_from)));
        const leaveEndDate = new Date(getDate(new Date(value.leave_to)));

        const datas = [];

        // Loop through each day
        while (leaveStartDate <= leaveEndDate) {
          datas.push({
            employee_id: value.employee_id,
            date: leaveStartDate.toISOString().split("T")[0],
            status: "Leave",
          });
          leaveStartDate.setDate(leaveStartDate.getDate() + 1);
        }

        const total_leave_days = countDays(value.leave_from, value.leave_to);

        if (value.previous_status !== "pending") {
          await client.query(
            `UPDATE employee_leave SET ${leave_type} = ${leave_type} - ${total_leave_days} WHERE employee_id = $1 AND financial_year_date >= get_financial_year_start() AND ${leave_type} > 0`,
            [req.body.employee_id]
          );
        }

        await client.query(
          `
          UPDATE leave
          SET leave_status = $1
          WHERE id = $2;
        `,
          [value.leave_status, value.id]
        );

        await client.query(
          `
          INSERT INTO attendance (employee_id, date, status)
          VALUES ${datas
            .map(
              (_: any, i: number) =>
                `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`
            )
            .join(", ")};
        `,
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
      const total_leave_days = countDays(value.leave_from, value.leave_to);

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        const { rowCount, rows} = await client.query(
          `UPDATE leave_and_employee SET status = 'decline' WHERE item_id = $1 RETURNING to_employee_id`,
          [value.leave_and_employee_row_id]
        );

        if(!rowCount || rowCount === 0) throw new ErrorHandler(400, "No leave found");

        if(rows[0].to_employee_id !== value?.who_is_updating_id) {
          //if anyone want try to hack
          throw new ErrorHandler(400, "You are not able to change the leave status of an employee who didn't send you this leave request.");
        }

        const { rows: whoIsUpdatingInfo } = await client.query(
          `
            SELECT 
              authority, 
              institute,
              d.name as department_name 
            FROM employee e 

            LEFT JOIN department d
            ON d.id = e.department_id

            WHERE e.id = $1`,
          [value.who_is_updating_id]
        );

        const currentAuthority = whoIsUpdatingInfo[0].authority;

        if (
          whoIsUpdatingInfo[0].department_name !== "HR Department" &&
          (currentAuthority === "HOD" ||
            currentAuthority === "HOI" ||
            currentAuthority === "SUPER ADMIN")
        ) {
          //send a notification to the employee, update leave_and_employee table status, send the requst to the hr
          await sendNotificationUtil({
            notification_title: `Leave Request Status`,
            notification_description: `${currentAuthority} has rejected your leave request.`,
            notification_type: "private",
            employee_ids: [value.employee_id],
            client: client,
          });

          const { rows: hrInfo } = await client.query(
            `
            SELECT 
              e.id
            FROM employee e

            LEFT JOIN department d
            ON d.id = e.department_id

            WHERE authority = 'HOD' AND institute = $1 AND d.name = 'HR Department'`,
            [whoIsUpdatingInfo[0].institute]
          );

          // await client.query(
          //   `INSERT INTO leave_and_employee (leave_id, from_employee_id, to_employee_id) VALUES ($1, $2, $3)`,
          //   [value.id, value.who_is_updating_id, hrInfo[0].id]
          // );

          await client.query(
            `DELETE FROM leave_and_employee WHERE leave_id = $1 AND to_employee_id = $2`,
            [value.id, hrInfo[0].id]
          );

          await client.query("COMMIT");
          client.release();

          return res
            .status(200)
            .json(new ApiResponse(200, "The leave request has been rejected."));
        }

        await client.query(
          `DELETE FROM attendance WHERE employee_id = $1 AND date BETWEEN $2 AND $3`,
          [value.employee_id, value.leave_from, value.leave_to]
        );

        await client.query(
          `UPDATE ${table_name} SET leave_status = $1 WHERE id = $2`,
          [value.leave_status, value.id]
        );

        await client.query(
          `UPDATE employee_leave SET ${leave_type} = ${leave_type} + ${total_leave_days} WHERE employee_id = $1 AND financial_year_date >= get_financial_year_start()`,
          [req.body.employee_id]
        );

        await client.query("COMMIT");
        client.release();
      } catch (error: any) {
        await client.query("ROLLBACK");
        client.release();
        throw new ErrorHandler(400, error.message);
      }
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

      WHERE e.institute = $1 AND e.is_active = true AND e.employee_role != 'Super Admin'
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
    // const { rows } = await client.query(
    //   `
    //     WITH current_month_days AS (
    //       SELECT DATE_PART('day', (DATE_TRUNC('month', NOW() - INTERVAL '1 month') + INTERVAL '1 month - 1 day')) AS total_days
    //     ),
    //     current_month_holiday AS (
    //       SELECT
    //         COUNT(holiday_id) as total_holiday_this_month,
    //         institute
    //       FROM holiday_management
    //       WHERE DATE_TRUNC('month', holiday_date) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')
    //       GROUP BY institute
    //     )
    //     SELECT
    //       e.id AS employee_id,
    //       cmd.total_days AS total_month_days, 
    //       COUNT(a.id) AS total_not_present,
    //       COALESCE(cmh.total_holiday_this_month, 0) AS total_holiday_this_month,
    //       (cmd.total_days - COUNT(a.id) - COALESCE(cmh.total_holiday_this_month, 0)) AS total_present_days
    //     FROM employee e
    //     LEFT JOIN employee_leave el ON e.id = el.employee_id
    //     LEFT JOIN attendance a 
    //       ON a.employee_id = e.id 
    //       AND DATE_TRUNC('month', a.date) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')
    //       COUNT(a.id) AS total_not_present,
    //       COALESCE(cmh.total_holiday_this_month, 0) AS total_holiday_this_month,
    //       (cmd.total_days - COUNT(a.id) - COALESCE(cmh.total_holiday_this_month, 0)) AS total_present_days
    //     FROM employee e
    //     LEFT JOIN employee_leave el ON e.id = el.employee_id
    //     LEFT JOIN attendance a 
    //       ON a.employee_id = e.id 
    //       AND DATE_TRUNC('month', a.date) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')
    //     CROSS JOIN current_month_days cmd
    //     LEFT JOIN current_month_holiday cmh 
    //       ON cmh.institute = e.institute
    //     WHERE e.joining_date <= CURRENT_DATE - INTERVAL '1 year'
    //     LEFT JOIN current_month_holiday cmh 
    //       ON cmh.institute = e.institute
    //     WHERE e.joining_date <= CURRENT_DATE - INTERVAL '1 year'
    //     GROUP BY e.id, cmd.total_days, cmh.total_holiday_this_month
    //     HAVING (cmd.total_days - COUNT(a.id) - COALESCE(cmh.total_holiday_this_month, 0)) >= 24
    //     HAVING (cmd.total_days - COUNT(a.id) - COALESCE(cmh.total_holiday_this_month, 0)) >= 24
    //   `
    // );

    const { rows } = await client.query(
      `
              WITH current_month_days AS (
                  SELECT DATE_PART('day', NOW() - INTERVAL '1 month' + INTERVAL '1 month - 1 day') AS total_days
              ),
              current_month_holiday AS (
                  SELECT
                      COUNT(holiday_id) AS total_holiday_this_month,
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
              LEFT JOIN employee_leave el 
                  ON e.id = el.employee_id
              LEFT JOIN attendance a 
                  ON a.employee_id = e.id 
                  AND DATE_TRUNC('month', a.date) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')
              CROSS JOIN current_month_days cmd
              LEFT JOIN current_month_holiday cmh 
                  ON cmh.institute = e.institute
              WHERE e.joining_date <= CURRENT_DATE - INTERVAL '1 year'
              GROUP BY e.id, cmd.total_days, cmh.total_holiday_this_month
              HAVING (cmd.total_days - COUNT(a.id) - COALESCE(cmh.total_holiday_this_month, 0)) >= 24;
      `
    )
 
    const employeeIds = rows.map((item) => item.employee_id).join(",");

    if (employeeIds.length > 0) {
      await client.query(
        `UPDATE employee_leave SET el = el + 1 WHERE employee_id IN (${employeeIds})`
      );
    }

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
  } catch (error: any) {
    console.log(error)
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
  );

  res.status(200).json(new ApiResponse(200, "Successfully Updated"));
});

export const generateLeaveReceipt = asyncErrorHandler(async (req, res) => {
  const { error, value } = getLeaveReciptV.validate(req.params);
  if (error) throw new ErrorHandler(400, error.message);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `
        SELECT
          l.id as leave_id,
          TO_CHAR(l.created_at, 'DD Mon YYYY') as issue_date,
          e.name,
          l.employee_id,
          e.designation,
          l.leave_from,
          l.leave_to,
          l.leave_reason,
          e.institute
        FROM leave l
  
        LEFT JOIN employee e
        ON e.id = l.employee_id
  
        WHERE l.id = $1
      `,
      [value.leave_id]
    );

    const { rows: totalLeaveInfo } = await client.query(
      `
      SELECT 
        COUNT(employee_id) total_leave 
      FROM attendance
      WHERE employee_id = $1 AND date BETWEEN get_financial_year_start() AND get_financial_year_end() AND (status = 'Leave')
      `,
      [rows[0].employee_id]
    );

    const totalDays = countDays(rows[0].leave_from, rows[0].leave_to);

    res.render("leave_format.ejs", {
      ...rows[0],
      total_days: totalDays,
      leave_from: beautifyDate(rows[0].leave_from),
      leave_to: beautifyDate(rows[0].leave_to),
      total_leave_days: totalLeaveInfo[0].total_leave,
    });

    await client.query("COMMIT");
    client.release();
  } catch (error) {
    await client.query("ROLLBACK");
    client.release();
    throw new ErrorHandler(500, "Error generating leave receipt");
  }
});
