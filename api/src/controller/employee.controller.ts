import { Request, Response } from "express";
import XLSX from "xlsx-js-style";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { pool } from "../config/db";
import { ApiResponse } from "../utils/ApiResponse";
import { ErrorHandler } from "../utils/ErrorHandler";
import {
  employeeLoginValidator,
  employeeSchema,
  getEmployeeDocumentValidator,
  updateEmployeeStatusValidator,
} from "../validator/employee.validator";
import { getDate } from "../utils/getDate";
import bcrypt from "bcrypt";
import { createToken } from "../utils/token";
import {
  objectToSqlConverterUpdate,
  objectToSqlInsert,
} from "../utils/objectToSql";
import { reqFilesToKeyValue } from "../utils/reqFilesToKeyValue";
import { TEmployeeDocs } from "../types";
import { sqlPlaceholderCreator } from "../utils/sql/sqlPlaceholderCreator";
import { transaction } from "../utils/transaction";
import { tryCatch } from "../utils/tryCatch";

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

    const sql = `
      SELECT 
          COUNT(e.id) AS total_employees,
          COUNT(CASE WHEN e.is_active = 'true' THEN 1 END) AS active_employees,
          COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) AS employees_on_leave,
          COUNT(CASE WHEN lr.leave_status = 'pending' THEN 1 END) AS pending_leave_request
      FROM 
          employee e
      LEFT JOIN 
          attendance a 
          ON e.id = a.employee_id
          AND a.date = $1
      LEFT JOIN
          leave lr ON e.id = lr.employee_id;
    `;

    const { rows } = await pool.query(sql, [getDate(date)]);

    res.status(200).json(new ApiResponse(200, "HR Dashborad Info", rows[0]));
  }
);

export const getEmployee = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const employee_type = req.query.employee_type;

    let query = `
        SELECT 
            e.id AS employee_id,
            e.name,
            e.profile_image,
            e.job_title,
            d.name AS department_name,
            COALESCE(a.status, 'Pending') AS attendance_status
        FROM 
            employee e
        LEFT JOIN 
            attendance a 
            ON e.id = a.employee_id
            AND a.date = $1
        LEFT JOIN 
            department d 
            ON e.department_id = d.id
        ${employee_type !== undefined ? "WHERE employee_type = $2" : ""}
        ORDER BY 
            e.name;
    `;

    const queryValues = [getDate(date)];
    if (employee_type !== undefined) {
      queryValues.push(employee_type.toString());
    }

    const { rows } = await pool.query(query, queryValues);

    res.status(200).json(new ApiResponse(200, "All Employee Info", rows));
  }
);

export const getSingleEmployeeInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const employee_id = req.params.id || null;
    if (!employee_id) throw new ErrorHandler(400, "Employee Id Is Required");

    const query = `
        SELECT 
            e.*,
            '********' AS login_password,                             
            d.name AS department_name, 
            COALESCE(a.status, 'Pending') AS attendance_status
        FROM 
            employee e
        LEFT JOIN 
            attendance a 
            ON e.id = a.employee_id
            AND a.date = $1  -- Use the date passed as parameter
        LEFT JOIN 
            department d 
            ON e.department_id = d.id
        WHERE 
            e.id = $2
        ORDER BY 
            e.name;`;

    const { rows } = await pool.query(query, [getDate(date), employee_id]);
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

    const { columns, params, values } = objectToSqlInsert(req.body);
    const sql = `INSERT INTO ${table_name} ${columns} VALUES ${params} RETURNING id`;

    const client = await pool.connect();

    const { error: err } = await tryCatch(async () => {
      await client.query("BEGIN");

      const { rows } = await client.query(sql, values);
      const employeeGeneratedId = rows[0].id;

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

      await client.query("COMMIT");
      client.release();
    });

    if (err) {
      await client.query("ROLLBACK");
      client.release();
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

    const valuesForEmployeeDocsInfo: (string | null)[] = [];
    employeeDocsInfo.forEach((item) => {
      valuesForEmployeeDocsInfo.push(
        id,
        item.doc_id,
        item.doc_uri,
        item.doc_name
      );
    });

    const {
      keys,
      values: valuesForEmployeeInfo,
      paramsNum,
    } = objectToSqlConverterUpdate(req.body);

    const sql = `UPDATE ${table_name} SET ${keys} WHERE id = $${paramsNum}`;
    valuesForEmployeeInfo.push(id as string);

    const trnsationList: { sql: string; values: any[] }[] = [];
    trnsationList.push({
      sql: sql,
      values: valuesForEmployeeInfo,
    });
    if (valuesForEmployeeDocsInfo.length !== 0) {
      trnsationList.push({
        sql: sqlForEmployeeDocsInfo,
        values: valuesForEmployeeDocsInfo,
      });
    }

    await transaction(trnsationList);

    res.status(200).json(new ApiResponse(200, "Employee information updated"));
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
      `SELECT login_email, login_password, employee_role, name, profile_image FROM ${table_name} WHERE login_email = $1`,
      [value.login_email]
    );

    if (rowCount === 0) throw new ErrorHandler(404, "User doesn't found");

    const isMatch = await bcrypt.compare(
      value.login_password,
      rows[0].login_password
    );

    if (!isMatch) {
      throw new ErrorHandler(400, "Wrong username or password");
    }

    const accessToken = createToken(
      {
        login_email: value.login_email,
        role: rows[0].employee_role,
        institute: rows[0].institute,
      },
      { expiresIn: "7d" }
    );

    res.status(200).json(
      new ApiResponse(200, "Login Successfully Completed", {
        token: accessToken,
        profile_image: rows[0].profile_image,
        name: rows[0].name,
      })
    );
  }
);

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
        WHERE is_active = true
        ORDER BY 
            e.name;
    `;

    const { rows } = await pool.query(query);
    res.status(200).json(new ApiResponse(200, "Marketing Team Data", rows));
  }
);

export const getEmployeeDocuments = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = getEmployeeDocumentValidator.validate(req.params);
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
