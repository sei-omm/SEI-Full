import { Request } from "express";
import { parsePagination } from "../utils/parsePagination";
import { filterToSql } from "../utils/filterToSql";
import { pool } from "../config/db";
import { getDatesInBetween } from "../utils/getDatesInBetween";

const date = new Date();

export const generateEmployeeAttendance = async (req: Request) => {
  const fromData = (req.query.from_date ||
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-01`) as string;
  const toData = (req.query.to_date ||
    date.toISOString().split("T")[0]) as string;

  const { LIMIT, OFFSET } = parsePagination(req);

  const queryForFilter = { ...req.query } as any;
  delete queryForFilter.from_date;
  delete queryForFilter.to_date;
  const { filterQuery, filterValues, placeholderNum } = filterToSql(
    queryForFilter,
    "e"
  );

  const sql = `
      SELECT
        e.id AS employee_id,
        e.name,
        e.profile_image,
        e.joining_date,
        e.institute,
        COALESCE(
          JSON_AGG(l.*) FILTER (WHERE l IS NOT NULL), 
          '[]'::json
        ) AS leaves,
        COALESCE(
          JSON_AGG(a.*) FILTER (WHERE a IS NOT NULL), 
          '[]'::json
        ) AS attendances
      FROM employee AS e
  
      LEFT JOIN leave AS l 
      ON e.id = l.employee_id AND (l.leave_from BETWEEN $${placeholderNum} AND $${
    placeholderNum + 1
  } OR l.leave_to BETWEEN $${placeholderNum} AND $${placeholderNum + 1})
  
      LEFT JOIN attendance AS a
      ON e.id = a.employee_id AND a.date BETWEEN $${placeholderNum} AND $${
    placeholderNum + 1
  }
  
      ${filterQuery}
  
      GROUP BY e.id
  
      LIMIT ${LIMIT} OFFSET ${OFFSET}
    `;

  filterValues.push(fromData, toData);

  const { rows } = await pool.query(sql, filterValues);

  const { rows: holidayList } = await pool.query(
    `SELECT 
        holiday_name, 
        TO_CHAR(holiday_date, 'YYYY-MM-DD') as holiday_date,
        institute
      FROM holiday_management WHERE holiday_year = $1`,
    [date.getFullYear()]
  );

  const dataToReturn: any[] = [];

  rows.forEach((item) => {
    const objToStore: any = {};
    const attendanceObj: any = {};
    const leavesObj: any = {};
    const holidayObj: any = {};
    const startDate = new Date(fromData);
    const endDate = new Date(toData);
    const joiningDate = new Date(item.joining_date);
    let needToStopLoop = false;
    objToStore["employee_id"] = item.employee_id;
    objToStore["name"] = item.name;
    objToStore["profile_image"] = item.profile_image;
    objToStore["institute"] = item.institute;

    item.attendances.forEach((aItem: any) => {
      attendanceObj[aItem.date] = aItem.status;
    });

    item.leaves.forEach((lItem: any) => {
      if (lItem.leave_status === "success") {
        const dates = getDatesInBetween(lItem.leave_from, lItem.leave_to);
        dates.forEach((eDate) => {
          leavesObj[eDate] = "Absent";
        });
      }
    });

    holidayList.forEach((hItem) => {
      holidayObj[hItem.holiday_date] = {
        status: "Holiday",
        institute: hItem.institute,
      };
    });

    let loopCount = 0;

    while (needToStopLoop === false) {
      loopCount++;
      if (
        startDate.toISOString().split("T")[0] ===
          endDate.toISOString().split("T")[0] ||
        loopCount > 3000
      ) {
        needToStopLoop = true;
      }

      const key = startDate.toISOString().split("T")[0];

      if (joiningDate.getTime() > startDate.getTime()) {
        objToStore[key] = "Not Employed";
      } else {
        objToStore[`${key}`] =
          attendanceObj[`${key}`] || leavesObj[`${key}`] || "Pending";
        if (
          holidayObj[`${key}`] &&
          holidayObj[`${key}`].institute === objToStore["institute"]
        ) {
          objToStore[`${key}`] = holidayObj[`${key}`].status;
        }

        //check sunday
        if (startDate.getDay() === 0) {
          objToStore[`${key}`] = "Sunday";
        }
      }
      startDate.setDate(startDate.getDate() + 1);
    }

    delete objToStore["institute"];
    dataToReturn.push(objToStore);
  });

  return dataToReturn;
};
