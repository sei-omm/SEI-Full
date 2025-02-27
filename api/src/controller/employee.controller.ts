import { Request, Response } from "express";
import XLSX from "xlsx-js-style";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { pool } from "../config/db";
import { ApiResponse } from "../utils/ApiResponse";
import { ErrorHandler } from "../utils/ErrorHandler";
import {
  assignAssetsValidator,
  assignFacultyCourseSubjectValidator,
  checkHOIV,
  createAppraisalValidator,
  employeeLoginValidator,
  employeeSchema,
  getAppraisalListValidator,
  getEmployeeDocumentValidator,
  getSingleAppraisalValidator,
  updateAppraisalValidator,
  updateEmployeeStatusValidator,
} from "../validator/employee.validator";
import { getDate } from "../utils/getDate";
import bcrypt from "bcrypt";
import { createToken } from "../utils/token";
import {
  objectToSqlConverterUpdate,
  objectToSqlInsert,
} from "../utils/objectToSql";
import { TEmployeeDocs } from "../types";
import { sqlPlaceholderCreator } from "../utils/sql/sqlPlaceholderCreator";
import { transaction } from "../utils/transaction";
import { tryCatch } from "../utils/tryCatch";
import { filterToSql } from "../utils/filterToSql";
import { parseNullOrUndefined } from "../utils/parseNullOrUndefined";
import { parsePagination } from "../utils/parsePagination";
import { generateEmployeeId } from "../utils/generateEmployeeId";
import { calculateYearsDifference } from "../utils/calculateYearsDifference";
import { AUTHORITY } from "../constant";
import { sendNotification } from "./notification.controller";
import { sendNotificationUtil } from "../utils/sendNotificationUtil";
import { beautifyDate } from "../utils/beautifyDate";
import { calculateAge } from "../utils/calculateAge";

const table_name = "employee";

const date = new Date();

export const getHrDashboardInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    // let query = `
    //   SELECT
    //       e.id AS employee_id,
    //       e.name,
    //       e.profile_image,
    //       e.job_title,
    //       d.name AS department_name,
    //       COALESCE(a.status, 'Pending') AS attendance_status
    //   FROM
    //       employee e
    //   LEFT JOIN
    //       attendance a
    //       ON e.id = a.employee_id
    //       AND a.date = $1
    //   LEFT JOIN
    //       department d
    //       ON e.department_id = d.id
    //   ORDER BY
    //       e.name;
    // `;
    // const { rows: employeeINFO } = await pool.query(query, [getDate(date)]);

    // res.status(200).json(
    //   new ApiResponse(200, "HR Dashboard Information", {
    //     employeeINFO,
    //   })
    // );

    // const sql = `
    //   SELECT
    //       COUNT(e.id) AS total_employees,
    //       COUNT(CASE WHEN e.is_active = 'true' THEN 1 END) AS active_employees,
    //       COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) AS employees_on_leave,
    //       COUNT(CASE WHEN lr.leave_status = 'pending' THEN 1 END) AS pending_leave_request
    //   FROM
    //       employee e
    //   LEFT JOIN
    //       attendance a
    //       ON e.id = a.employee_id
    //       AND a.date = $1
    //   LEFT JOIN
    //       leave lr ON e.id = lr.employee_id
    //   GROUP BY e.id;
    // `;

    // const { rows } = await pool.query(sql, [getDate(date)]);

    const institute = req.query.institute || null;

    const [response1, response2, response3] = await transaction([
      {
        sql: `
          SELECT 
            COUNT(e.id) as total_employees,
            COUNT(CASE WHEN e.is_active = 'true' THEN 0 END) AS active_employees
          FROM employee e

          ${institute ? `WHERE institute = $1` : ""}
            `,
        values: institute ? [institute] : [],
      },
      {
        sql: `
          SELECT
           COUNT(CASE WHEN lr.leave_status = 'pending' THEN 0 END) as pending_leave_request
          FROM leave lr

          ${
            institute
              ? `

            LEFT JOIN employee e
            ON e.id = lr.employee_id

            WHERE e.institute = $1
            
          `
              : ""
          }
        `,
        values: institute ? [institute] : [],
      },
      {
        sql: `
          SELECT
           COUNT(CASE WHEN a.status = 'Absent' THEN 0 END) AS employees_on_leave
          FROM attendance a

          ${
            institute
              ? `
            LEFT JOIN employee e
            ON e.id = a.employee_id
          `
              : ""
          }

          WHERE date = $1 ${institute ? "AND e.institute = $2" : ""}
        `,
        values: institute ? [getDate(date), institute] : [getDate(date)],
      },
    ]);

    //   const sql = `
    //     SELECT
    //       COUNT(e.id) as total_employees,
    //       COUNT(CASE WHEN e.is_active = 'true' THEN 1 END) AS active_employees,
    //       COUNT(CASE WHEN lr.leave_status = 'pending' THEN 1 END) AS pending_leave_request
    //     FROM employee e

    //     LEFT JOIN leave lr
    //       ON e.id = lr.employee_id
    // `;
    // const { rows } = await pool.query(sql)

    const finalResult = {
      ...response1.rows[0],
      ...response2.rows[0],
      ...response3.rows[0],
    };

    res
      .status(200)
      .json(new ApiResponse(200, "HR Dashborad Info", finalResult));
  }
);

export const getEmployee = asyncErrorHandler(
  async (req: Request, res: Response) => {
    // const employee_type = req.query.employee_type;

    const { OFFSET, LIMIT } = parsePagination(req);

    const { filterQuery, filterValues, placeholderNum } = filterToSql(
      req.query,
      "e"
    );

    let query = `
        SELECT 
            e.id AS employee_id,
            e.name,
            e.profile_image,
            e.employee_type,
            d.name AS department_name,
            -- COALESCE(a.status, 'Pending') AS attendance_status
            -- COALESCE(
             -- (SELECT 'Holiday' FROM holiday_management WHERE holiday_date = CURRENT_DATE),
             --  COALESCE(a.status, 'Pending')
            -- ) AS attendance_status
            e.is_active
        FROM 
            employee e
        -- LEFT JOIN 
        --    attendance 
        --    ON e.id = a.employee_id
        --    AND a.date = $${placeholderNum}
        LEFT JOIN 
            department d 
            ON e.department_id = d.id
        ${filterQuery}
        ORDER BY 
            e.name
        OFFSET ${OFFSET}
        LIMIT ${LIMIT};
    `;

    const { rows } = await pool.query(query, filterValues);

    res.status(200).json(new ApiResponse(200, "All Employee Info", rows));
  }
);

export const getSingleEmployeeInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const employee_id =
      parseNullOrUndefined(req.params.id) ||
      parseNullOrUndefined(res.locals.employee_id) ||
      null;
    if (!employee_id) throw new ErrorHandler(400, "Employee Id Is Required");

    const query = `
        SELECT 
            e.*,
            '********' AS login_password,                             
            d.name AS department_name, 
            COALESCE(a.status, 'Pending') AS attendance_status,
            -- COALESCE(JSON_AGG(DISTINCT aae.*) FILTER (WHERE aae IS NOT NULL), '[]') AS assigned_assets
             COALESCE((
                  SELECT JSON_AGG(aae)
                  FROM assign_assets_employee aae
                  WHERE aae.to_employee_id = e.id
              ), '[]') AS assigned_assets,
          (
            SELECT 
              json_agg(el.*) 
            FROM employee_leave el WHERE el.employee_id = e.id AND el.financial_year_date >= get_financial_year_start()
          ) AS leave_details,
           (CASE WHEN e.employee_role = 'Admin' THEN true ELSE false END) AS access_to_crm
        FROM 
            employee e
        LEFT JOIN 
            attendance a 
            ON e.id = a.employee_id
            AND a.date = $1  -- Use the date passed as parameter
        LEFT JOIN 
            department d 
            ON e.department_id = d.id

        -- LEFT JOIN assign_assets_employee AS aae
        -- ON aae.to_employee_id = e.id

        LEFT JOIN faculty_with_course_subject AS fwcs
        ON fwcs.faculty_id = e.id

        WHERE e.id = $2

        GROUP BY e.id, d.name, a.status
        ORDER BY 
            e.name;`;

    const { rows } = await pool.query(query, [getDate(date), employee_id]);
    // const salaryValues: number[] = [];
    // salaryValues.push(
    //   parseFloat(rows[0].basic_salary),
    //   parseFloat(rows[0].hra),
    //   parseFloat(rows[0].other_allowances),
    //   parseFloat(rows[0].provident_fund),
    //   parseFloat(rows[0].professional_tax),
    //   parseFloat(rows[0].esic),
    //   parseFloat(rows[0].income_tax)
    // );
    // const totalSalary = salaryValues.reduce((accumulator, currentValue) => {
    //   return accumulator + currentValue;
    // }, 0);

    // const deductions = salaryValues.reduce(
    //   (accumulator, currentValue, index) => {
    //     if (index > 2) return accumulator + currentValue;
    //     return 0;
    //   },
    //   0
    // );

    // const newSalary = totalSalary - deductions;

    const workingTenure = calculateYearsDifference(
      rows[0].joining_date || "",
      new Date().toISOString().split("T")[0]
    );

    // rows[0].total_salary = totalSalary;
    // rows[0].deductions = deductions;
    // rows[0].monthly_salary = (newSalary / 12).toFixed(2);
    // rows[0].gratuity = ((15 * (newSalary / 12) * workingTenure) / 26).toFixed(2);
    rows[0].working_tenure = workingTenure;
    // rows[0].net_salary = newSalary;

    res.status(200).json(new ApiResponse(200, "Single Employee Info", rows));
  }
);

export const addNewEmployee = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = employeeSchema.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const employeeDocsInfo = JSON.parse(
      req.body.employee_docs_info
    ) as TEmployeeDocs[];
    delete req.body.employee_docs_info;

    const sqlForEmployeeDocsInfo = `
      INSERT INTO employee_docs
      (employee_id, doc_id, doc_uri, doc_name)
      VALUES
      ${sqlPlaceholderCreator(4, employeeDocsInfo.length).placeholder}
      ON CONFLICT (employee_id, doc_id)
      DO UPDATE SET 
        doc_uri = EXCLUDED.doc_uri,
        doc_name = EXCLUDED.doc_name
    `;

    // const cl = req.body.cl;
    // const sl = req.body.sl;
    // const el = req.body.el;
    // const ml = req.body.ml;
    // delete req.body.cl;
    // delete req.body.sl;
    // delete req.body.el;
    // delete req.body.ml;
    const cl = 10;
    const sl = 10;
    const el = 0;
    const ml = 84;
    const { columns, params, values } = objectToSqlInsert(req.body);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      //for checking any hoi already exist of not if exist throw error if not continue
      const { rowCount, rows: hoiInfo } = await client.query(
        `SELECT name FROM employee WHERE authority = 'HOI' AND institute = $1 AND is_active = true`,
        [req.body.institute]
      );

      if ((rowCount || 0) > 0)
        throw new ErrorHandler(
          400,
          `${hoiInfo[0].name} Exist AS HOI, Choose Diffrent Authority Option`
        );

      // insert info into employee table
      const { rows } = await client.query(
        `INSERT INTO ${table_name} ${columns} VALUES ${params} RETURNING id`,
        values
      );

      //generate employee_id not database row id
      const employeeGeneratedId = rows[0].id;

      const { rows: employeeOrderCountInfo } = await client.query(
        `
          INSERT INTO generated_employee_each_day (date, count)
          VALUES ($1::DATE, 1)
          ON CONFLICT (date) DO UPDATE 
          SET count = COALESCE(generated_employee_each_day.count, 0) + 1
          RETURNING count;
        `,
        [req.body.joining_date]
      );

      //it's a bad thing to do don't do it. i don't want to run insert query mannualy.
      if (!req.body.login_email || req.body.login_email === "") {
        const employeeID = generateEmployeeId(
          req.body.joining_date,
          req.body.institute,
          String(employeeOrderCountInfo[0].count).padStart(2, "0")
        );
        await client.query(
          `UPDATE employee SET login_email = $1 WHERE id = $2`,
          [employeeID, employeeGeneratedId]
        );
      }

      if (employeeDocsInfo.length !== 0) {
        //if employee docs list is not empty
        const valuesForEmployeeDocsInfo: (string | null)[] = [];
        employeeDocsInfo.forEach((item) => {
          valuesForEmployeeDocsInfo.push(
            employeeGeneratedId,
            item.doc_id,
            item.doc_uri,
            item.doc_name
          );
        });

        await client.query(sqlForEmployeeDocsInfo, valuesForEmployeeDocsInfo);
      }

      await client.query(
        `
        INSERT INTO employee_leave (employee_id, cl, sl, el, ml) VALUES ($1, $2, $3, $4, $5)
        `,
        [employeeGeneratedId, cl, sl, el, ml]
      );

      await client.query("COMMIT");
      client.release();
    } catch (error: any) {
      await client.query("ROLLBACK");
      client.release();
      throw new ErrorHandler(400, error.message);
    }

    res
      .status(200)
      .json(new ApiResponse(200, "New employee added successfully"));
  }
);

export const updateEmployee = asyncErrorHandler(
  async (req: Request, res: Response) => {
    //i need to store two thing first employee/fackalty info and documents

    const { error } = employeeSchema.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    //this is the id of employee
    const id = (req.params.id as string) || null;
    if (!id) throw new ErrorHandler(400, "Employee Id Is Required", "id");

    let login_password = req.body.login_password;
    if (login_password != "********") {
      login_password = await bcrypt.hash(login_password, 10);
      req.body.login_password = login_password;
    } else {
      delete req.body.login_password;
    }

    const employeeDocsInfo = JSON.parse(
      req.body.employee_docs_info
    ) as TEmployeeDocs[];
    delete req.body.employee_docs_info;

    //it will generate employee id automatically if login_email not provided
    // let loginIDorEmail = req.body.login_email;
    // if (!loginIDorEmail || loginIDorEmail === "") {
    //   loginIDorEmail = generateEmployeeId(
    //     req.body.joining_date,
    //     req.body.institute,
    //     parseInt(id)
    //   );
    // }

    // const cl = req.body.cl;
    // const sl = req.body.sl;
    // const el = req.body.el;
    // const ml = req.body.ml;
    delete req.body.cl;
    delete req.body.sl;
    delete req.body.el;
    delete req.body.ml;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      //for checking any hoi already exist of not if exist throw error if not continue

      if (req.body.authority === "HOI") {
        const { rowCount, rows } = await client.query(
          `SELECT id, name FROM employee WHERE authority = 'HOI' AND institute = $1 AND is_active = true`,
          [req.body.institute]
        );

        if ((rowCount || 0) > 0 && rows[0].id !== parseInt(id)) {
          throw new ErrorHandler(
            400,
            `${rows[0].name} Exist AS HOI, Choose Diffrent Authority Option`
          );
        }
      }

      // if any document need to update
      if (employeeDocsInfo.length > 0) {
        await client.query(
          `
          INSERT INTO employee_docs
          (employee_id, doc_id, doc_uri, doc_name)
          VALUES
          ${sqlPlaceholderCreator(4, employeeDocsInfo.length).placeholder}
          ON CONFLICT (employee_id, doc_id)
          DO UPDATE SET 
            doc_uri = EXCLUDED.doc_uri,
            doc_name = EXCLUDED.doc_name
          `,
          employeeDocsInfo.flatMap((item) => [
            id,
            item.doc_id,
            item.doc_uri,
            item.doc_name,
          ])
        );
      }

      const {
        keys,
        values: valuesForEmployeeInfo,
        paramsNum,
      } = objectToSqlConverterUpdate({
        ...req.body,
      });

      valuesForEmployeeInfo.push(id as string);

      // update employee table
      await client.query(
        `UPDATE ${table_name} SET ${keys} WHERE id = $${paramsNum}`,
        valuesForEmployeeInfo
      );

      await client.query("COMMIT");
      client.release();
      res
        .status(200)
        .json(new ApiResponse(200, "Employee information updated"));
    } catch (error: any) {
      await client.query("ROLLBACK");
      client.release();
      throw new ErrorHandler(400, error.message);
    }
  }
);

export const removeEmployee = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const id = (req.params.id as string) || null;
    const employee_id = (req.params.id as string) || null;

    await pool.query(
      `DELETE FROM ${table_name} WHERE ${id ? "id = $1" : "employee_id = $1"}`,
      [id || employee_id]
    );

    res.status(200).json(new ApiResponse(200, "Employee removed successfully"));
  }
);

export const updateEmployeeActiveStatus = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = updateEmployeeStatusValidator.validate({
      ...req.body,
      ...req.params,
    });

    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(`UPDATE ${table_name} SET is_active = $1 WHERE id = $2`, [
      value.is_active,
      value.id,
    ]);

    res.status(200).json(new ApiResponse(200, "Employee Status Updated"));
  }
);

export const generateAllEmployeeExcelSheet = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rowCount, rows } = await pool.query(`SELECT * FROM ${table_name}`);

    if (rowCount === 0) throw new ErrorHandler(400, "No Employee Found");

    const excelSheetName = `Employee_Excel_Lists.xlsx`;

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    // worksheet["!rows"] = [{ hpt: 40 }];

    // const cellRef = XLSX.utils.encode_cell({ r: 0, c: 0 });
    // worksheet[cellRef].s = {
    //   font: { bold: true, sz : 18 },
    //   alignment: {
    //     horizontal: "center",
    //     vertical: "center",
    //     wrapText: false
    //   }
    // };
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

export const loginEmployee = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = employeeLoginValidator.validate(req.body);

    if (error) throw new ErrorHandler(400, error.message);

    const { rowCount, rows } = await pool.query(
      `SELECT login_email, id, institute, login_password, employee_role, name, profile_image, is_active FROM ${table_name} WHERE login_email = $1`,
      [value.login_email]
    );

    if (rowCount === 0) throw new ErrorHandler(404, "User doesn't found");

    if (!rows[0].is_active) throw new ErrorHandler(404, "Account Has Disabled");

    const isMatch = await bcrypt.compare(
      value.login_password,
      rows[0].login_password
    );

    if (!isMatch) {
      throw new ErrorHandler(400, "Wrong username or password");
    }

    const refreshToken = createToken(
      {
        employee_id: rows[0].id,
        login_email: rows[0].login_email,
        role: rows[0].employee_role,
        institute: rows[0].institute,
      },
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // sameSite: "lax", // "lax" works better for local development
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain:
        process.env.NODE_ENV === "production" ? process.env.DOMAIN : undefined,
    });

    res.status(200).json(
      new ApiResponse(200, "Login Successfully Completed", {
        token: refreshToken,
        profile_image: rows[0].profile_image,
        name: rows[0].name,
        employee_id: rows[0].id,
      })
    );
  }
);

export const employeeLogout = asyncErrorHandler(async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain: process.env.NODE_ENV === "production" ? process.env.DOMAIN : undefined,
  });
  res.status(200).json(new ApiResponse(200, "Successfully Logout"));
});

export const getMarketingTeam = asyncErrorHandler(
  async (req: Request, res: Response) => {
    let query = `
        SELECT 
            e.id AS employee_id,
            e.name
        FROM 
            employee e
        LEFT JOIN 
            department d 
            ON e.department_id = d.id
        WHERE is_active = true AND d.name = 'Sales & Marketing Department'
        ORDER BY 
            e.name;
    `;

    const { rows } = await pool.query(query);
    res.status(200).json(new ApiResponse(200, "Marketing Team Data", rows));
  }
);

export const getEmployeeDocuments = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = getEmployeeDocumentValidator.validate({
      ...req.params,
      employee_id:
        parseNullOrUndefined(req.params.employee_id) ||
        parseNullOrUndefined(res.locals.employee_id),
    });

    if (error) throw new ErrorHandler(400, error.message);

    const { rows } = await pool.query(
      `SELECT * FROM employee_docs WHERE employee_id = $1`,
      [value.employee_id]
    );

    res.status(200).json(new ApiResponse(200, "", rows));
  }
);
// export const getPayrollInfo = asyncErrorHandler(
//   async (req: Request, res: Response) => {
//     const sql = `SELECT name, profile_image, job_title, basic_salary, hra, other_allowances, provident_fund, professional_tax, income_tax FROM ${table_name}`;
//     const { rows } = await pool.query(sql);

//     rows[0]
//   }
// );

// export const generateAllEmployeeExcelSheet = asyncErrorHandler(
//   async (req: Request, res: Response) => {
//     // const client = new Client(dbConfig);

//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader("Content-Disposition", 'attachment; filename="data.xlsx"');

//     const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
//     const worksheet = workbook.addWorksheet("Data");

//     worksheet.columns = [
//       { header: "ID", key: "id", width: 10 },
//       { header: "Name", key: "name", width: 30 },
//       { header: "Join Date", key: "joining_date", width: 15 },
//     ];

//     const queryText = `SELECT id, name, joining_date FROM ${table_name}`;
//     const cursor = client.query(new Cursor(queryText));

//     function fetchNextBatch() {
//       cursor.read(50, async (err, rows) => {
//         console.log("Started")
//         console.log(err);
//         console.log(rows);
//         // Adjust the batch size as needed
//         if (err) {
//           console.error("Error reading data:", err);
//           cursor.close(() => client.end()); // Close cursor and client on error
//           res.end(); // End the response on error
//           return;
//         }

//         if (rows.length === 0) {
//           // await cursor.close();
//           // await client.end();

//           cursor.close(() => client.end());

//           await workbook.commit();
//           res.end(); // End the response
//           return;
//         }

//         // Stream the current batch of rows as JSON
//         rows.forEach((row) => worksheet.addRow(row).commit());

//         // Continue fetching the next batch
//         fetchNextBatch();
//       });
//     }

//     // Start fetching and streaming data
//     fetchNextBatch();
//   }
// );

export const getFacultyCourseSubject = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rows } = await pool.query(
      `SELECT 
       fwcs.*,
       c.course_name
      FROM faculty_with_course_subject fwcs
      LEFT JOIN courses AS c
        ON fwcs.course_id = c.course_id
      WHERE faculty_id = $1`,
      [req.params.faculty_id]
    );
    res.status(200).json(new ApiResponse(200, "", rows));
  }
);

export const assignFacultyCourseSubject = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = assignFacultyCourseSubjectValidator.validate(
      req.body
    );
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(
      `INSERT INTO faculty_with_course_subject (faculty_id, course_id, subject) 
        VALUES ($1, $2, $3)
        ON CONFLICT (faculty_id, course_id) 
        DO UPDATE SET subject = faculty_with_course_subject.subject || ',' || EXCLUDED.subject`,
      [value.faculty_id, value.course_id, value.subject]
    );

    res
      .status(201)
      .json(new ApiResponse(201, "Faculty Course Subject Assigned"));
  }
);

export const removeFacultyCourseSubject = asyncErrorHandler(
  async (req: Request, res: Response) => {
    await pool.query(
      `DELETE FROM faculty_with_course_subject WHERE faculty_id = $1 AND course_id = $2`,
      [req.params.faculty_id, req.params.course_id]
    );
    res
      .status(200)
      .json(new ApiResponse(200, "Faculty Course & Subject Removed"));
  }
);

//Appraisal
export const createAppraisal = asyncErrorHandler(async (req, res) => {
  const { error, value } = createAppraisalValidator.validate({
    ...req.body,
    employee_id: res.locals.employee_id,
  });
  if (error) throw new ErrorHandler(400, error.message);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    // find current employee info
    const { rows: employee1Info } = await client.query(
      `
      SELECT
        id,
        authority,
        department_id,
        institute,
        name
      FROM employee ce WHERE ce.id = $1 AND ce.is_active = true;
      `,
      [value.employee_id]
    );

    // check what is the name of current employee higher authority name ex : if HOD than HOI is higher
    const currentEmployeeAuthorityIndex = AUTHORITY.findIndex(
      (item) => item === employee1Info[0].authority
    );
    const highAuthorityName: string | undefined =
      AUTHORITY[currentEmployeeAuthorityIndex - 1];

    // add extra filter if higher authority is HOD than don't need to check department as it will got to HOI
    let extra_filter = "";
    const extra_filter_values: string[] = [];
    if (employee1Info[0].authority !== "HOD") {
      extra_filter = " AND ha.department_id = $3";
      extra_filter_values.push(employee1Info[0].department_id);
    }

    //find id form employee where authority is higher authority
    const { rows: highAuthorityInfo } = await client.query(
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
      [highAuthorityName, employee1Info[0].institute, ...extra_filter_values]
    );

    const { rows: appraisal } = await client.query(
      `INSERT INTO appraisal (employee_id, discipline, duties, targets, achievements, appraisal_options_employee) VALUES ($1, $2, $3, $4, $5, $6) RETURNING appraisal_id`,
      [
        value.employee_id,
        value.discipline,
        value.duties,
        value.targets,
        value.achievements,
        value.appraisal_options_employee,
      ]
    );

    await client.query(
      `INSERT INTO appraisal_and_employee (appraisal_id, from_employee_id, to_employee_id) VALUES ($1, $2, $3)`,
      [appraisal[0].appraisal_id, value.employee_id, highAuthorityInfo[0].id]
    );

    // await sendNotificationUtil({
    //   notification_type: "private",
    //   employee_ids: [highAuthorityInfo[0].id],
    //   notification_title: "Appraisal Request",
    //   notification_description: `An appraisal request has come from ${employee1Info[0].name}`,
    //   client: client,
    // });

    await client.query("COMMIT");
    client.release();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          `The appraisal form has been sent to ${highAuthorityInfo[0].name}`
        )
      );
  } catch (error: any) {
    client.release();
    await client.query("ROLLBACK");
    throw new ErrorHandler(400, error.message);
  }
});

export const getAppraisalList = asyncErrorHandler(async (req, res) => {
  const { error, value } = getAppraisalListValidator.validate({
    ...req.query,
    employee_id: res.locals.employee_id,
    role: res.locals.role,
  });
  if (error) throw new ErrorHandler(400, error.message);

  // value.type -> "own", "others"
  if (value.type === "own") {
    const { rows } = await pool.query(
      `
      SELECT 
        a.appraisal_id,
        a.created_at,
        JSON_AGG(JSON_OBJECT('name' : e.name, 'status' : aae.appraisal_status) ORDER BY aae.item_id ASC) as sended_to
      FROM appraisal AS a

      LEFT JOIN appraisal_and_employee AS aae
      ON a.appraisal_id = aae.appraisal_id

      LEFT JOIN employee AS e
      ON aae.to_employee_id = e.id

      WHERE a.employee_id = $1

      GROUP BY a.appraisal_id

      ORDER BY a.appraisal_id DESC
      `,
      [value.employee_id]
    );

    return res.status(200).json(new ApiResponse(200, "Your Appraisals", rows));
  }

  // const { rows : req1 } = await pool.query(
  //   `SELECT appraisal_id FROM appraisal_and_employee WHERE to_employee_id = $1`,
  //   [value.employee_id]
  // );

  // const appraisalID = req1[0].appraisal_id;

  // const {} = await pool.query(
  //   `
  //     SELECT
  //       aae.*
  //     FROM appraisal_and_employee aae
  //     WHERE aae.appraisal_id = $1
  //   `,
  //   [appraisalID]
  // )

  if (
    (value.type === "Admin" || value.type === "Hr") &&
    (value.role === "Admin" || value.role === "Hr")
  ) {
    const { rows } = await pool.query(
      `
       SELECT
        a.appraisal_id,
        a.created_at,
        a.employee_id AS appraisal_of_employee_id,
        e.name AS appraisal_of,
        e.profile_image,
        e.email_address
       FROM appraisal_and_employee aae
  
       LEFT JOIN appraisal AS a
       ON a.appraisal_id = aae.appraisal_id
  
       LEFT JOIN employee AS e
       ON e.id = a.employee_id

       ${value.institute ? "WHERE e.institute = $1" : ""}

       GROUP BY e.id, a.appraisal_id
      `,
      value.institute ? [value.institute] : []
    );

    return res.status(200).json(new ApiResponse(200, "Other Appraisals", rows));
  }

  const { rows } = await pool.query(
    `
     SELECT
      a.appraisal_id,
      a.created_at,
      a.employee_id AS appraisal_of_employee_id,
      e.name AS appraisal_of
     FROM appraisal_and_employee aae

     LEFT JOIN appraisal AS a
     ON a.appraisal_id = aae.appraisal_id

     LEFT JOIN employee AS e
     ON e.id = a.employee_id

     WHERE aae.to_employee_id = $1
    `,
    [value.employee_id]
  );

  // const { rows } = await pool.query(
  //   `
  //   SELECT
  //     a.appraisal_id,
  //     a.created_at,
  //     JSON_AGG(JSON_OBJECT('name' : e.name, 'status' : aae.appraisal_status)) as sended_to
  //   FROM appraisal_and_employee AS aae

  //   LEFT JOIN appraisal AS a
  //   ON aae.appraisal_id = a.appraisal_id

  //   LEFT JOIN employee AS e
  //   ON aae.from_employee_id = e.id

  //   WHERE aae.to_employee_id = $1

  //   GROUP BY a.appraisal_id

  //   ORDER BY a.appraisal_id DESC
  //   `,
  //   [value.employee_id]
  // );

  res.status(200).json(new ApiResponse(200, "Other Appraisals", rows));
});

export const getSingleAppraisal = asyncErrorHandler(async (req, res) => {
  const { error, value } = getSingleAppraisalValidator.validate(req.params);
  if (error) throw new ErrorHandler(400, error.message);

  const [singleAppraisalInfo, appraisalOfInfo] = await transaction([
    {
      sql: `
      SELECT 
        a.*,
        JSON_AGG(JSON_OBJECT('employee_id' : e.id, 'name' : e.name, 'remark' : aae.appraisal_remark, 'status' : aae.appraisal_status)) as sended_to
      FROM appraisal AS a

      LEFT JOIN appraisal_and_employee AS aae
      ON a.appraisal_id = aae.appraisal_id

      LEFT JOIN employee AS e
      ON aae.to_employee_id = e.id
      
      WHERE a.appraisal_id = $1

      GROUP BY a.appraisal_id
      `,
      values: [value.appraisal_id],
    },

    {
      sql: `

        SELECT
          e.name,
          e.profile_image,
          e.dob,
          e.joining_date
        FROM appraisal AS a

        LEFT JOIN employee AS e
        ON a.employee_id = e.id

        WHERE a.appraisal_id = $1
      `,
      values: [value.appraisal_id],
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Single Appraisal Info", {
      appraisal_info: singleAppraisalInfo.rows[0],
      appraisal_of_info: appraisalOfInfo.rows[0],
    })
  );
});

export const updateAppraisalReport = asyncErrorHandler(async (req, res) => {
  const { error, value } = updateAppraisalValidator.validate({
    ...req.params,
    ...req.body,
    employee_id: res.locals.employee_id,
  });

  if (error) throw new ErrorHandler(400, error.message);

  const client = await pool.connect();

  const { error: tryCatchErr } = await tryCatch(async () => {
    await client.query("BEGIN");

    // find current employee info like
    const { rows: employee1Info } = await client.query(
      `
          SELECT
            id,
            authority,
            department_id,
            institute,
            name
          FROM employee ce WHERE ce.id = $1 AND ce.is_active = true;
          `,
      [value.employee_id]
    );

    // check what is the name of current employee higher authority name ex : if HOD than HOI is higher
    const currentEmployeeAuthorityIndex = AUTHORITY.findIndex(
      (item) => item === employee1Info[0].authority
    );
    const highAuthorityName: string | undefined =
      AUTHORITY[currentEmployeeAuthorityIndex - 1];

    // if high authority name is not found then consider this form will not go beyond
    if (highAuthorityName !== undefined) {
      // add extra filter if higher authority is HOD than don't need to check department as it will got to HOI
      let extra_filter = "";
      const extra_filter_values: string[] = [];
      if (employee1Info[0].authority !== "HOD") {
        extra_filter = " AND ha.department_id = $3";
        extra_filter_values.push(employee1Info[0].department_id);
      }

      //find id form employee where authority is higher authority name
      const { rows: highAuthorityInfo } = await client.query(
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
        [highAuthorityName, employee1Info[0].institute, ...extra_filter_values]
      );

      await client.query(
        `
        INSERT INTO appraisal_and_employee 
          (appraisal_id, from_employee_id, to_employee_id) 
        VALUES 
          ($1, $2, $3)
        ON CONFLICT(appraisal_id, from_employee_id, to_employee_id) DO NOTHING;
  `,
        [value.appraisal_id, value.employee_id, highAuthorityInfo[0].id]
      );

      // await sendNotificationUtil({
      //   notification_type: "private",
      //   employee_ids: [highAuthorityInfo[0].id],
      //   notification_title: "Appraisal Request",
      //   notification_description: `An appraisal request has come from ${employee1Info[0].name}`,
      //   client: client,
      // });
    }

    const { keys, values, paramsNum } = objectToSqlConverterUpdate(req.body);
    await client.query(
      `UPDATE appraisal SET ${keys} WHERE appraisal_id = $${paramsNum}`,
      [...values, value.appraisal_id]
    );

    await client.query(
      `UPDATE appraisal_and_employee SET appraisal_status = 'Approved', approve_date = CURRENT_DATE WHERE appraisal_id = $1 AND to_employee_id = $2`,
      [value.appraisal_id, value.employee_id]
    );

    await client.query("COMMIT");
    client.release();
  });

  if (tryCatchErr) {
    client.release();
    await client.query("ROLLBACK");
    throw new ErrorHandler(400, tryCatchErr.message);
  }

  res.status(200).json(new ApiResponse(200, "Appraisal Status Has Updated"));
});

//Assign Assets
export const assignAssets = asyncErrorHandler(async (req, res) => {
  const { error, value } = assignAssetsValidator.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  await pool.query(
    `
    INSERT INTO assign_assets_employee 
      (to_employee_id, assets_name, issued_by, issue_date, return_date)
    VALUES
      ${sqlPlaceholderCreator(5, value.length).placeholder}
    `,

    value.flatMap((item) => [
      item.employee_id,
      item.assets_name,
      item.issued_by,
      item.issue_date,
      item.return_date || null,
    ])
  );

  res.status(201).json(new ApiResponse(201, "Assets Successfully Assigned"));
});

export const deleteAssignAssets = asyncErrorHandler(async (req, res) => {
  await pool.query("DELETE FROM assign_assets_employee WHERE assets_id = $1", [
    req.params.assets_id,
  ]);
  res.status(200).json(new ApiResponse(200, "Assigned Asset Deleted"));
});

export const getAssignedAssets = asyncErrorHandler(async (req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM assign_assets_employee WHERE to_employee_id = $1",
    [req.params.employee_id]
  );
  res.status(200).json(new ApiResponse(200, "", rows));
});

export const updateAssetReturnDate = asyncErrorHandler(async (req, res) => {
  const assets_id = req.params.assets_id;
  const return_date = req.body.return_date;

  await pool.query(
    `UPDATE assign_assets_employee SET return_date = $1 WHERE assets_id = $2`,
    [return_date, assets_id]
  );

  res.status(200).json(new ApiResponse(200, "Asset Return Date Updated"));
});

export const searchEmployeeName = asyncErrorHandler(async (req, res) => {
  const { LIMIT, OFFSET } = parsePagination(req, req.query.limit as any);
  const institute = req.query.institute || "Kolkata";

  const { rows } = await pool.query(
    `SELECT 
        name, 
        id, 
        employee_type 
     FROM employee WHERE name ILIKE '%' || $1 || '%' AND institute = $2
     LIMIT ${LIMIT} OFFSET ${OFFSET}
     `,
    [req.query.q, institute]
  );

  res.status(200).json(new ApiResponse(200, "", rows));
});

export const checkHoi = asyncErrorHandler(async (req, res) => {
  const { error, value } = checkHOIV.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);

  const { rows, rowCount } = await pool.query(
    `SELECT name FROM employee WHERE authority = 'HOI' AND institute = $1 AND is_active = true`,
    [value.institute]
  );

  res.status(200).json(
    new ApiResponse(200, "", {
      isExist: (rowCount || 0) > 0,
      hoi_name: rows[0] ? rows[0].name : null,
    })
  );
});

function getReferenceDate(joiningDate: string) {
  const currentDate = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

  if (joiningDate) {
    const joiningDateObj = new Date(joiningDate);
    return joiningDateObj > oneYearAgo ? joiningDateObj : oneYearAgo;
  }

  return oneYearAgo;
}

export const generateAppraisal = asyncErrorHandler(async (req, res) => {
  const { error, value } = getSingleAppraisalValidator.validate(req.params);
  if (error) throw new ErrorHandler(400, error.message);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const { rows: singleAppraisalInfo } = await client.query(
      `
        SELECT 
          a.*,
          JSON_AGG(JSON_OBJECT('employee_id' : e.id, 'name' : e.name, 'remark' : aae.appraisal_remark, 'status' : aae.appraisal_status, 'authority' : e.authority, 'approve_date' : aae.approve_date)) as sended_to
        FROM appraisal AS a

        LEFT JOIN appraisal_and_employee AS aae
        ON a.appraisal_id = aae.appraisal_id

        LEFT JOIN employee AS e
        ON aae.to_employee_id = e.id
        
        WHERE a.appraisal_id = $1

        GROUP BY a.appraisal_id
      `,
      [value.appraisal_id]
    );

    const { rows: appraisalOfInfo } = await client.query(
      `
      SELECT
          id,
          e.name,
          e.dob,
          e.joining_date,
          e.institute,
          e.employee_type
        FROM appraisal AS a

        LEFT JOIN employee AS e
        ON a.employee_id = e.id

        WHERE a.appraisal_id = $1
      `,
      [value.appraisal_id]
    );

    const from_date = beautifyDate(
      getReferenceDate(appraisalOfInfo[0].joining_date).toString()
    );
    const to_date = beautifyDate(new Date().toString());

    const { rows: totalAbsenceInfo } = await client.query(
      `
      SELECT 
        COUNT(employee_id) total_absence 
      FROM attendance
      WHERE employee_id = $1 AND date BETWEEN $2 AND $3 AND (status = 'Absent' OR status = 'Leave')
      `,
      [appraisalOfInfo[0].id, from_date, to_date]
    );

    const age = calculateAge(appraisalOfInfo[0].dob);

    const appraisalOptions = [
      {
        id: "option-1",
        text: "Accomplishment of planned work/work allotted as per subject allotted",
        group: 1,
      },
      { id: "option-2", text: "Quality of output", group: 1 },
      { id: "option-3", text: "Analytical ability", group: 1 },
      {
        id: "option-4",
        text: "Accomplishment of exceptional work / unforeseen tasks performed",
        group: 1,
      },
      { id: "option-5", text: "Overall grading on ‘work output’", group: 1 },

      { id: "option-6", text: "Attitude to work", group: 2 },
      { id: "option-7", text: "Sense of responsibility", group: 2 },
      { id: "option-8", text: "Maintenance of Discipline", group: 2 },
      { id: "option-9", text: "Communication skills", group: 2 },
      { id: "option-10", text: "Leadership Qualities", group: 2 },
      { id: "option-11", text: "Capacity to work in team spirit", group: 2 },
      {
        id: "option-12",
        text: "Capacity to adhere to time-schedule",
        group: 2,
      },
      { id: "option-13", text: "Inter personal relations", group: 2 },
      { id: "option-14", text: "Overall bearing and personality", group: 2 },
      {
        id: "option-15",
        text: "Overall Grading on ‘Personal Attributes’",
        group: 2,
      },

      {
        id: "option-16",
        text: "Knowledge of Rules / Regulations / procedures in the area of function and ability to apply them correctly",
        group: 3,
      },
      { id: "option-17", text: "Strategic Planning ability", group: 3 },
      { id: "option-18", text: "Decision making ability", group: 3 },
      { id: "option-19", text: "Coordination ability", group: 3 },
      {
        id: "option-20",
        text: "Ability to motivate and develop subordinates",
        group: 3,
      },
      { id: "option-21", text: "Initiative", group: 3 },
      {
        id: "option-22",
        text: "Overall Grading on Functional Competency",
        group: 3,
      },
    ];

    const parsedOptionObject = JSON.parse(
      singleAppraisalInfo[0].appraisal_options_hod || "{}"
    );

    const hoiInfo = singleAppraisalInfo[0].sended_to.find(
      (item: any) => item.authority === "HOI" && item.status === "Approved"
    );
    res.render("appraisal.ejs", {
      institute: appraisalOfInfo[0].institute,
      issue_number: value.appraisal_id,
      issue_date: beautifyDate(singleAppraisalInfo[0].created_at),
      employee_name: appraisalOfInfo[0].name,
      age,
      dob: beautifyDate(appraisalOfInfo[0].dob),
      discipline: singleAppraisalInfo[0].discipline,
      joining_date: beautifyDate(appraisalOfInfo[0].joining_date),
      duties: singleAppraisalInfo[0].duties,
      targets: singleAppraisalInfo[0].targets,
      state_of_health: singleAppraisalInfo[0].state_of_health,
      integrity: singleAppraisalInfo[0].integrity,
      employee_type:
        appraisalOfInfo[0].employee_type === "Office Staff"
          ? "Staff"
          : "Faculty",

      appraisal_options: appraisalOptions,
      option_values_obj: parsedOptionObject,
      hoi_name: hoiInfo?.name,
      approve_date_hoi: hoiInfo?.approve_date,

      from_date: from_date,
      to_date: to_date,
      total_absence: totalAbsenceInfo[0].total_absence,
    });

    await client.query("COMMIT");
    client.release();
  } catch (error: any) {
    await client.query("ROLLBACK");
    client.release();
    throw new ErrorHandler(400, error.message);
  }
});
