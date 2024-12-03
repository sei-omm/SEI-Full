import e, { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import {
  admissionReportValidator,
  courseTrendReportValidator,
  dgsIndosReportValidator,
  studentBirthdateReportValidator,
  studentBirthdateWishValidator,
} from "../validator/report.validator";
import { ErrorHandler } from "../utils/ErrorHandler";
import { pool } from "../config/db";
import { ApiResponse } from "../utils/ApiResponse";
import XLSX from "xlsx-js-style";
import { sendEmail } from "../utils/sendEmail";
import Cursor from "pg-cursor";
import { Readable } from "node:stream";

const sqlForAdmissionReport = `
        SELECT 
            EC.created_at,
            C.course_name,
            C.course_fee,
            (C.course_fee - SUM(PAY.paid_amount)) AS due_amount_for_course,
            STU.name,
            STU.profile_image,
            C.course_type,
            STU.email,
            STU.mobile_number,
            SUM(PAY.paid_amount) AS paid_amount_for_course, -- it for total paid for course
            SUM(PAY.misc_payment) AS total_misc_amount,
            (SUM(PAY.paid_amount) + SUM(PAY.misc_payment)) AS total_paid
        FROM enrolled_batches_courses AS EC
        LEFT JOIN students AS STU
            ON EC.student_id = STU.student_id
        LEFT JOIN courses AS C
            ON EC.course_id = C.course_id
        LEFT JOIN payments AS PAY
            ON EC.course_id = PAY.course_id AND EC.student_id = PAY.student_id
        WHERE C.institute = $1 AND DATE(EC.created_at) BETWEEN $2 AND $3
        GROUP BY 
            EC.created_at,
            C.course_name,
            C.course_fee,
            C.course_type,
            STU.student_id, 
            STU.name,
            STU.profile_image,
            STU.email,
            STU.mobile_number
    `;

export const createAdmissionReport = asyncErrorHandler(
  async (req: Request, res: Response) => {
    /* I need three thing from the user
      1) Institute name
      2) From Date
      3) To Date
     */

    const { error, value } = admissionReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows } = await pool.query(sqlForAdmissionReport, [
      value.institute,
      value.from_date,
      value.to_date,
    ]);
    res.status(200).json(new ApiResponse(200, "Admission Reports", rows));
  }
);

export const generateAdmissionExcelReport = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = admissionReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows, rowCount } = await pool.query(sqlForAdmissionReport, [
      value.institute,
      value.from_date,
      value.to_date,
    ]);

    if (rowCount === 0) throw new ErrorHandler(400, "No Report Found");

    const excelSheetName = `Admission_Report.xlsx`;

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet["!rows"] = [{ hpt: 40 }];
    worksheet["!cols"] = [];

    const headingsLengths = Object.keys(rows[0]).length;
    //for convarting headings bold
    for (let i = 0; i < headingsLengths; i++) {
      worksheet["!cols"].push({ width: 40 });
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
      worksheet[cellRef].s = {
        font: {
          bold: true,
          sz: 14,
          color: { rgb: i === 3 ? "ff0000" : "000000" },
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
          wrapText: false,
        },
      };
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, "Admission_Report");

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

export const getStudentsBirthDateReport = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = studentBirthdateReportValidator.validate(
      req.query
    );
    if (error) throw new ErrorHandler(400, error.message);

    const { rows } = await pool.query(
      `
       SELECT name, dob, email, profile_image, mobile_number
       FROM students 
       WHERE TO_CHAR(dob, 'MM-DD') = TO_CHAR($1::DATE, 'MM-DD');
     `,
      [value.birth_date]
    );

    res.status(200).json(new ApiResponse(200, "Students Data", rows));
  }
);

export const generateDobExcelReport = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = studentBirthdateReportValidator.validate(
      req.query
    );
    if (error) throw new ErrorHandler(400, error.message);

    const { rows, rowCount } = await pool.query(
      `
       SELECT name, dob, email, profile_image, mobile_number
       FROM students 
       WHERE TO_CHAR(dob, 'MM-DD') = TO_CHAR($1::DATE, 'MM-DD');
     `,
      [value.birth_date]
    );

    if (rowCount === 0) throw new ErrorHandler(400, "No Report Found");

    const excelSheetName = `Date_Of_Birth_Report.xlsx`;

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Date_Of_Birth_Report");

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

export const sendBirthdateWish = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = studentBirthdateWishValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    sendEmail(value.student_email, "BIRTHDATE_WISH", {
      student_name: value.student_name,
    });

    res
      .status(200)
      .json(new ApiResponse(200, "Birthdate Wish Email Has Sended"));
  }
);

const sqlForDgsReport = `
      SELECT 
        s.name,
        s.indos_number,
        s.mobile_number,
        s.email
      FROM enrolled_batches_courses AS ebc

      LEFT JOIN courses AS c
                ON c.course_id = ebc.course_id
      LEFT JOIN fillup_forms AS ff
                ON ff.form_id = ebc.form_id
      LEFT JOIN students AS s
                ON s.student_id = ebc.student_id
      LEFT JOIN course_batches as cb
                ON cb.batch_id = ebc.batch_id
      WHERE 
          ebc.course_id = $1
          AND c.course_type = $2
          AND ff.form_status = 'Approve'
          AND c.institute = $3
          AND cb.start_date = $4
    `;

export const getDgsIndosReport = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = dgsIndosReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows } = await pool.query(sqlForDgsReport, [
      value.course_id,
      value.course_type,
      value.institute,
      value.batch_date,
    ]);

    res.status(200).json(new ApiResponse(200, "", rows));
  }
);

export const getDgsIndosExcelReport = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = dgsIndosReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows, rowCount } = await pool.query(sqlForDgsReport, [
      value.course_id,
      value.course_type,
      value.institute,
      value.batch_date,
    ]);

    if (rowCount === 0) throw new ErrorHandler(400, "No Report Found");

    const excelSheetName = `Dgs_And_Indos_Report.xlsx`;

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet["!rows"] = [{ hpt: 40 }];
    worksheet["!cols"] = [];

    const headingsLengths = Object.keys(rows[0]).length;
    //for convarting headings bold
    for (let i = 0; i < headingsLengths; i++) {
      worksheet["!cols"].push({ width: 40 });
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
      worksheet[cellRef].s = {
        font: {
          bold: true,
          sz: 14,
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
          wrapText: false,
        },
      };
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, "Dgs_And_Indos_Report");

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

const courseTrendReportSql = `SELECT
        cb.start_date,
        cb.end_date,
        COUNT(DISTINCT ebc.student_id) AS total_enrollment,
        COUNT(DISTINCT CASE WHEN ff.form_status = 'Approve' THEN ebc.student_id END) AS total_approved_enrollment
      FROM course_batches AS cb
      LEFT JOIN courses AS c
            ON c.course_id = cb.course_id
      LEFT JOIN enrolled_batches_courses AS ebc
            ON ebc.batch_id = cb.batch_id
      LEFT JOIN fillup_forms AS ff
            ON ff.form_id = ebc.form_id
      WHERE c.course_id = $1 AND c.course_type = $2 AND c.institute = $3
      GROUP BY cb.batch_id
      ORDER BY cb.start_date DESC
      LIMIT $4;`;

export const getCourseTrendReport = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = courseTrendReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows } = await pool.query(courseTrendReportSql, [
      value.course_id,
      value.course_type,
      value.institute,
      value.last_no_of_batches,
    ]);
    res.status(200).json(new ApiResponse(200, "", rows));
  }
);

export const getCourseTrendExcelReport = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = courseTrendReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows, rowCount } = await pool.query(courseTrendReportSql, [
      value.course_id,
      value.course_type,
      value.institute,
      value.last_no_of_batches,
    ]);

    if (rowCount === 0) throw new ErrorHandler(400, "No Report Found");

    const excelSheetName = `Course_Trend_Report.xlsx`;

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet["!rows"] = [{ hpt: 40 }];
    worksheet["!cols"] = [];

    const headingsLengths = Object.keys(rows[0]).length;
    //for convarting headings bold
    for (let i = 0; i < headingsLengths; i++) {
      worksheet["!cols"].push({ width: 40 });
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
      worksheet[cellRef].s = {
        font: {
          bold: true,
          sz: 14,
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
          wrapText: false,
        },
      };
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, "Course_Trend_Report");

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

export const getBatchReport = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = dgsIndosReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows } = await pool.query(
      `
        SELECT 
            ff.form_id,
            s.name,
            cb.batch_fee,
            s.indos_number,
            s.mobile_number,
            s.email
          FROM enrolled_batches_courses AS ebc

          LEFT JOIN courses AS c
                    ON c.course_id = ebc.course_id
          LEFT JOIN fillup_forms AS ff
                    ON ff.form_id = ebc.form_id
          LEFT JOIN students AS s
                    ON s.student_id = ebc.student_id
          LEFT JOIN course_batches as cb
                    ON cb.batch_id = ebc.batch_id
          LEFT JOIN payments as p
                    ON p.form_id = ff.form_id
          WHERE 
              ebc.course_id = $1
              AND c.course_type = $2
              AND ff.form_status = 'Approve'
              AND c.institute = $3
              AND cb.start_date = $4
    `,
      [
        value.course_id,
        value.course_type,
        value.institute,
        value.batch_date,
      ]
    );
    res.status(200).json(new ApiResponse(200, "Batch Report", rows));
  }
);

export const testController = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const client = await pool.connect();

    const jsonStream = new Readable({
      read() {},
    });

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Transfer-Encoding", "chunked");

    jsonStream.push("[");

    try {
      // Start a transaction
      await client.query("BEGIN");

      // Create a cursor for your query
      const query = "SELECT * FROM payments";
      const cursor = client.query(new Cursor(query));

      // Read rows in chunks
      const fetchSize = 1; // Number of rows to fetch per read
      const readRows = () => {
        cursor.read(fetchSize, (err, rows) => {
          if (err) {
            jsonStream.push(null);
            console.error("Error reading rows:", err);
            cursor.close(() => client.query("ROLLBACK")); // Rollback on error
            return;
          }

          if (rows.length === 0) {
            jsonStream.push("]");
            jsonStream.push(null);
            console.log("No more rows to read");
            cursor.close(() => client.query("COMMIT")); // Commit the transaction
            client.release(); // Release the client
            return;
          }

          // Process the rows
          // console.log("Fetched rows:", rows);
          jsonStream.push(JSON.stringify(rows[0]));
          jsonStream.push(",");

          // Continue reading the next chunk
          readRows();
        });
      };

      readRows(); // Start reading rows
    } catch (error) {
      console.error("Error during cursor operation:", error);
      await client.query("ROLLBACK");
      client.release();
      jsonStream.push(null);
    }

    jsonStream.pipe(res);

    // res.status(200).json(new ApiResponse(200, "All Payments"));
  }
);
