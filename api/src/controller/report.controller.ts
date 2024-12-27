import e, { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import {
  admissionReportValidator,
  courseTrendReportValidator,
  dgsIndosReportValidator,
  occupancyReportValidator,
  receiptReportValidator,
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

// const sqlForAdmissionReport = `
//         SELECT
//             EC.created_at,
//             C.course_name,
//             C.course_fee,
//             (C.course_fee - SUM(PAY.paid_amount)) AS due_amount_for_course,
//             STU.name,
//             STU.profile_image,
//             C.course_type,
//             STU.email,
//             STU.mobile_number,
//             SUM(PAY.paid_amount) AS paid_amount_for_course, -- it for total paid for course
//             SUM(PAY.misc_payment) AS total_misc_amount,
//             (SUM(PAY.paid_amount) + SUM(PAY.misc_payment)) AS total_paid
//         FROM enrolled_batches_courses AS EC
//         LEFT JOIN students AS STU
//             ON EC.student_id = STU.student_id
//         LEFT JOIN courses AS C
//             ON EC.course_id = C.course_id
//         LEFT JOIN payments AS PAY
//             ON EC.course_id = PAY.course_id AND EC.student_id = PAY.student_id
//         WHERE C.institute = $1 AND DATE(EC.created_at) BETWEEN $2 AND $3
//         GROUP BY
//             EC.created_at,
//             C.course_name,
//             C.course_fee,
//             C.course_type,
//             STU.student_id,
//             STU.name,
//             STU.profile_image,
//             STU.email,
//             STU.mobile_number
//     `;

export const createAdmissionReport = asyncErrorHandler(
  async (req: Request, res: Response) => {
    /* I need three thing from the user
      1) Institute name
      2) From Date
      3) To Date
     */

    const sqlForAdmissionReport = `
        SELECT 
            EC.created_at,
            C.course_name,
            CB.batch_fee AS course_batch_fee,
            (CB.batch_fee - SUM(PAY.paid_amount)) AS due_amount_for_course,
            -- C.course_fee,
            -- (C.course_fee - SUM(PAY.paid_amount)) AS due_amount_for_course,
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
        LEFT JOIN course_batches AS CB
            ON CB.batch_id = EC.batch_id
        WHERE C.institute = $1 AND DATE(EC.created_at) BETWEEN $2 AND $3
        GROUP BY 
            EC.created_at,
            C.course_name,
            CB.batch_fee,
            -- C.course_fee,
            C.course_type,
            STU.student_id, 
            STU.name,
            STU.profile_image,
            STU.email,
            STU.mobile_number
    `;

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

    const sqlForAdmissionReport = `
        SELECT 
            row_number() OVER () AS sr_no,
            EC.created_at,
            C.course_name,
            CB.batch_fee AS course_batch_fee,
            (CB.batch_fee - SUM(PAY.paid_amount)) AS due_amount_for_course,
            -- C.course_fee,
            -- (C.course_fee - SUM(PAY.paid_amount)) AS due_amount_for_course,
            STU.name,
           -- STU.profile_image,
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
        LEFT JOIN course_batches AS CB
            ON CB.batch_id = EC.batch_id
        WHERE C.institute = $1 AND DATE(EC.created_at) BETWEEN $2 AND $3
        GROUP BY 
            EC.created_at,
            C.course_name,
            CB.batch_fee,
            -- C.course_fee,
            C.course_type,
            STU.student_id, 
            STU.name,
            STU.profile_image,
            STU.email,
            STU.mobile_number
    `;

    const { rows, rowCount } = await pool.query(sqlForAdmissionReport, [
      value.institute,
      value.from_date,
      value.to_date,
    ]);

    if (rowCount === 0) throw new ErrorHandler(400, "No Report Found");

    const excelSheetName = `Admission_Report.xlsx`;

    const data = [
      [`Admission Report (${value.institute})`], // Main header
      [
        "Sr No",
        "Date",
        "Course Name",
        "Course Batch Fee",
        "Student Due Amount",
        "Student Name",
        "Course Type",
        "Email",
        "Mobile Number",
        "Paid Amount For Batch",
        "Total Misc Amount",
        "Total Paid",
      ], // Sub-header
      ...rows.map((row) => [
        row.sr_no,
        row.batch,
        row.start,
        row.end,
        row.no_of_students,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Styles for the main header
    worksheet["A1"].s = {
      font: { bold: true, color: { rgb: "000000" }, sz: 22 },
      fill: { fgColor: { rgb: "FFFF00" } },
      alignment: { horizontal: "center", vertical: "center" },
    };

    // Merge cells for the main header
    worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];

    worksheet["!rows"] = [{ hpt: 40 }];
    worksheet["!cols"] = [];

    for (let col = 0; col < 19; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 1, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "000000" }, sz: 12 },
          fill: { fgColor: { rgb: "F4A460" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    }

    const workbook = XLSX.utils.book_new();
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

// export const generateAdmissionExcelReport = asyncErrorHandler(
//   async (req: Request, res: Response) => {
//     const { error, value } = admissionReportValidator.validate(req.query);
//     if (error) throw new ErrorHandler(400, error.message);

//     const { rows, rowCount } = await pool.query(sqlForAdmissionReport, [
//       value.institute,
//       value.from_date,
//       value.to_date,
//     ]);

//     if (rowCount === 0) throw new ErrorHandler(400, "No Report Found");

//     const excelSheetName = `Admission_Report.xlsx`;

//     const workbook = XLSX.utils.book_new();
//     const worksheet = XLSX.utils.json_to_sheet(rows);

//     worksheet["!rows"] = [{ hpt: 40 }];
//     worksheet["!cols"] = [];

//     const headingsLengths = Object.keys(rows[0]).length;
//     //for convarting headings bold
//     for (let i = 0; i < headingsLengths; i++) {
//       worksheet["!cols"].push({ width: 40 });
//       const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
//       worksheet[cellRef].s = {
//         font: {
//           bold: true,
//           sz: 14,
//           color: { rgb: i === 3 ? "ff0000" : "000000" },
//         },
//         alignment: {
//           horizontal: "center",
//           vertical: "center",
//           wrapText: false,
//         },
//       };
//     }

//     XLSX.utils.book_append_sheet(workbook, worksheet, "Admission_Report");

//     // Write the workbook to a buffer
//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "buffer",
//     });

//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=${excelSheetName}`
//     );
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );

//     res.send(excelBuffer);
//   }
// );

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

export const getDgsIndosReport = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = dgsIndosReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

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

    const { rows } = await pool.query(sqlForDgsReport, [
      value.course_id,
      value.course_type,
      value.institute,
      value.batch_date,
    ]);

    res.status(200).json(new ApiResponse(200, "", rows));
  }
);

// export const getDgsIndosExcelReport = asyncErrorHandler(
//   async (req: Request, res: Response) => {
//     const { error, value } = dgsIndosReportValidator.validate(req.query);
//     if (error) throw new ErrorHandler(400, error.message);

//     const { rows, rowCount } = await pool.query(sqlForDgsReport, [
//       value.course_id,
//       value.course_type,
//       value.institute,
//       value.batch_date,
//     ]);

//     if (rowCount === 0) throw new ErrorHandler(400, "No Report Found");

//     const excelSheetName = `Dgs_And_Indos_Report.xlsx`;

//     const workbook = XLSX.utils.book_new();
//     const worksheet = XLSX.utils.json_to_sheet(rows);

//     worksheet["!rows"] = [{ hpt: 40 }];
//     worksheet["!cols"] = [];

//     const headingsLengths = Object.keys(rows[0]).length;
//     //for convarting headings bold
//     for (let i = 0; i < headingsLengths; i++) {
//       worksheet["!cols"].push({ width: 40 });
//       const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
//       worksheet[cellRef].s = {
//         font: {
//           bold: true,
//           sz: 14,
//         },
//         alignment: {
//           horizontal: "center",
//           vertical: "center",
//           wrapText: false,
//         },
//       };
//     }

//     XLSX.utils.book_append_sheet(workbook, worksheet, "Dgs_And_Indos_Report");

//     // Write the workbook to a buffer
//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "buffer",
//     });

//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=${excelSheetName}`
//     );
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );

//     res.send(excelBuffer);
//   }
// );

export const getDgsIndosExcelReport = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = dgsIndosReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    const sqlForDgsReport = `
        SELECT 
          row_number() OVER () AS sr_no,
          s.name,
          s.dob,
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

    const { rows, rowCount } = await pool.query(sqlForDgsReport, [
      value.course_id,
      value.course_type,
      value.institute,
      value.batch_date,
    ]);

    if (rowCount === 0) throw new ErrorHandler(400, "No Report Found");

    const excelSheetName = `Dgs_And_Indos_Report.xlsx`;

    const data = [
      ["DGSIndos Report", "", "", "", "", "", "", "", ""], // Main header
      [
        rows.map((item) => item.indos_number).join(","),
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
      [
        "Sr No",
        "Candidate Name",
        "Date of Birth",
        "CDC No",
        "Passport No",
        "INDoS No",
        "COC No",
        "Certificate No - Part 1",
        "Certificate No - Part 2",
      ], // Sub-header
      ...rows.map((row) => [
        row.sr_no,
        row.name,
        row.dob,
        "NA",
        "NA",
        row.indos_number,
        "NA",
        "NA",
        "NA",
      ]),
    ];

    // const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Styles for the main header
    worksheet["A1"].s = {
      font: { bold: true, color: { rgb: "000000" }, sz: 22 },
      fill: { fgColor: { rgb: "FFFF00" } },
      alignment: { horizontal: "center", vertical: "center" },
    };

    // Styles for the Secound main header
    worksheet["A2"].s = {
      font: { bold: true, color: { rgb: "000000" }, sz: 12 },
      fill: { fgColor: { rgb: "FFFF00" } },
      alignment: { horizontal: "center", vertical: "center" },
    };

    // Merge cells for the main header
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    ];

    // Styles for sub-header
    for (let col = 0; col < 9; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 2, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "000000" }, sz: 12 },
          fill: { fgColor: { rgb: "F4A460" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DGS_Indos_Report");

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

export const getCourseTrendReport = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = courseTrendReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    const courseTrendReportSql = `
        SELECT
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
      WHERE c.course_id = $1 AND c.course_type = $2 AND c.institute = $3 AND cb.start_date = $4
      GROUP BY cb.batch_id
      ORDER BY cb.start_date DESC
      -- LIMIT $4`;

    const { rows } = await pool.query(courseTrendReportSql, [
      value.course_id,
      value.course_type,
      value.institute,
      value.batch_date,
    ]);
    res.status(200).json(new ApiResponse(200, "", rows));
  }
);

// export const getCourseTrendExcelReport = asyncErrorHandler(
//   async (req: Request, res: Response) => {
//     const { error, value } = courseTrendReportValidator.validate(req.query);
//     if (error) throw new ErrorHandler(400, error.message);

//     const { rows, rowCount } = await pool.query(courseTrendReportSql, [
//       value.course_id,
//       value.course_type,
//       value.institute,
//       value.last_no_of_batches,
//     ]);

//     if (rowCount === 0) throw new ErrorHandler(400, "No Report Found");

//     const excelSheetName = `Course_Trend_Report.xlsx`;

//     const workbook = XLSX.utils.book_new();
//     const worksheet = XLSX.utils.json_to_sheet(rows);

//     worksheet["!rows"] = [{ hpt: 40 }];
//     worksheet["!cols"] = [];

//     const headingsLengths = Object.keys(rows[0]).length;
//     //for convarting headings bold
//     for (let i = 0; i < headingsLengths; i++) {
//       worksheet["!cols"].push({ width: 40 });
//       const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
//       worksheet[cellRef].s = {
//         font: {
//           bold: true,
//           sz: 14,
//         },
//         alignment: {
//           horizontal: "center",
//           vertical: "center",
//           wrapText: false,
//         },
//       };
//     }

//     XLSX.utils.book_append_sheet(workbook, worksheet, "Course_Trend_Report");

//     // Write the workbook to a buffer
//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "buffer",
//     });

//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=${excelSheetName}`
//     );
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );

//     res.send(excelBuffer);
//   }
// );

export const getCourseTrendExcelReport = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = courseTrendReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    const courseTrendReportSql = `
          SELECT
          row_number() OVER () AS sr_no,
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
        WHERE c.course_id = $1 AND c.course_type = $2 AND c.institute = $3 AND cb.start_date = $4
        GROUP BY cb.batch_id
        ORDER BY cb.start_date DESC
        -- LIMIT $4`;

    const { rows, rowCount } = await pool.query(courseTrendReportSql, [
      value.course_id,
      value.course_type,
      value.institute,
      value.batch_date,
    ]);

    if (rowCount === 0) throw new ErrorHandler(400, "No Report Found");

    const excelSheetName = `Course_Trend_Report.xlsx`;

    const data = [
      [`Batch Trend Report (${value.institute})`, "", "", "", ""], // Main header
      [
        "Sr No",
        "Start",
        "End",
        "Total Enrollment",
        "Total Approved Enrollment",
      ], // Sub-header
      ...rows.map((row) => [
        row.sr_no,
        row.start_date,
        row.end_date,
        row.total_enrollment,
        row.total_approved_enrollment,
      ]),
    ];

    // const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Styles for the main header
    worksheet["A1"].s = {
      font: { bold: true, color: { rgb: "000000" }, sz: 22 },
      fill: { fgColor: { rgb: "FFFF00" } },
      alignment: { horizontal: "center", vertical: "center" },
    };

    // Merge cells for the main header
    worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];

    // Styles for sub-header
    for (let col = 0; col < 5; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 1, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "000000" }, sz: 12 },
          fill: { fgColor: { rgb: "F4A460" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    }

    const workbook = XLSX.utils.book_new();
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

// SELECT
// ff.form_id,
// s.name,
// cb.batch_fee,
// s.indos_number,
// s.mobile_number,
// s.email
// FROM enrolled_batches_courses AS ebc

// LEFT JOIN courses AS c
//         ON c.course_id = ebc.course_id
// LEFT JOIN fillup_forms AS ff
//         ON ff.form_id = ebc.form_id
// LEFT JOIN students AS s
//         ON s.student_id = ebc.student_id
// LEFT JOIN course_batches as cb
//         ON cb.batch_id = ebc.batch_id
// LEFT JOIN payments as p
//         ON p.form_id = ff.form_id
// WHERE
//   ebc.course_id = $1
//   AND c.course_type = $2
//   -- AND ff.form_status = 'Approve'
//   AND c.institute = $3
//   AND cb.start_date = $4

export const getBatchReport = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = dgsIndosReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows } = await pool.query(
      `
        SELECT 
          ebc.form_id,
          s.name,
          cb.batch_fee,
          SUM(p.paid_amount) AS total_paid,
          (cb.batch_fee - SUM(p.paid_amount)) AS total_due,
          SUM(p.misc_payment) AS total_misc_payment,
          ff.form_status,
          s.indos_number,
          s.mobile_number,
          s.email,
          STRING_AGG(p.payment_type, ', ') AS payment_types,
          STRING_AGG(p.mode, ', ') AS payment_modes,
          STRING_AGG(p.payment_id, ', ') AS payment_ids,
          STRING_AGG(p.remark, ', ') AS remarks
        FROM enrolled_batches_courses AS ebc

        LEFT JOIN students AS s
            ON s.student_id = ebc.student_id
        LEFT JOIN course_batches AS cb
            ON cb.batch_id = ebc.batch_id
        RIGHT JOIN payments AS p
            ON p.batch_id = ebc.batch_id
        LEFT JOIN fillup_forms AS ff
            ON ff.form_id = ebc.form_id
        LEFT JOIN courses AS c
            ON c.course_id = ebc.course_id

        WHERE ebc.course_id = $1
              AND cb.start_date = $2
              AND c.institute = $3
              AND c.course_type = $4
                      
        GROUP BY p.student_id, ebc.form_id, s.name, cb.batch_fee, ff.form_status, s.indos_number, s.mobile_number, s.email
      `,
      [value.course_id, value.batch_date, value.institute, value.course_type]
    );

    res.status(200).json(new ApiResponse(200, "Batch Report", rows));
  }
);

export const getBatchReportExcel = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = dgsIndosReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows, rowCount } = await pool.query(
      `
        SELECT 
          row_number() OVER () AS sr_no,
          ebc.form_id,
          ff.form_status,
          ff.created_at AS form_application_date,
          s.name,
          s.dob,
          s.indos_number,
          '' AS passport_number,
          '' AS cdc_number,
          cb.start_date AS course_joining_date,
          '' AS rank,
          s.mobile_number,
          s.email,
          STRING_AGG(p.mode, ', ') AS payment_modes,
          STRING_AGG(p.remark, ', ') AS remarks,
          SUM(p.misc_payment) AS total_misc_payment,
          cb.batch_fee,
          SUM(p.paid_amount) AS total_paid,
          (cb.batch_fee - SUM(p.paid_amount)) AS total_due,
          STRING_AGG(p.payment_type, ', ') AS payment_types,
          STRING_AGG(p.payment_id, ', ') AS payment_ids
        FROM enrolled_batches_courses AS ebc

        LEFT JOIN students AS s
            ON s.student_id = ebc.student_id
        LEFT JOIN course_batches AS cb
            ON cb.batch_id = ebc.batch_id
        RIGHT JOIN payments AS p
            ON p.batch_id = ebc.batch_id
        LEFT JOIN fillup_forms AS ff
            ON ff.form_id = ebc.form_id
        LEFT JOIN courses AS c
            ON c.course_id = ebc.course_id

        WHERE ebc.course_id = $1
              AND cb.start_date = $2
              AND c.institute = $3
              AND c.course_type = $4
                      
        GROUP BY p.student_id, ebc.form_id, s.name, cb.batch_fee, ff.form_status, s.indos_number, s.mobile_number, s.email, ff.created_at, s.dob, cb.start_date
      `,
      [value.course_id, value.batch_date, value.institute, value.course_type]
    );

    if (rowCount === 0) throw new ErrorHandler(400, "No Report Found");

    const excelSheetName = `Course_Batch_Report.xlsx`;

    const data = [
      [`Course Batch Report (${value.institute})`], // Main header
      [`Batch Date : ${value.batch_date}`], // Sub-header
      [
        "Sr No",
        "Form ID",
        "Form Status",
        "Form Application Date",
        "Candidate Name",
        "Date of Birth",
        "INDoS No",
        "Passport No",
        "CDC No",
        "Data of Joining / Course date",
        "Rank",
        "Contact No",
        "Email",
        "Payment Modes",
        "Remarks",
        "Total Misc Payments",
        "Batch Fee",
        "Total Paid",
        "Total Due",
        "Payment Types",
        "Payment Ids",
      ],
      ...rows.map((row) => [
        row.sr_no,
        row.form_id,
        row.form_status,
        row.form_application_date,
        row.name,
        row.dob,
        row.indos_number,
        row.passport_number,
        row.cdc_number,
        row.course_joining_date,
        row.rank,
        row.mobile_number,
        row.email,
        row.payment_modes,
        row.remarks,
        row.total_misc_payment,
        row.batch_fee,
        row.total_paid,
        row.total_due,
        row.payment_types,
        row.payment_ids,
      ]),
    ];

    // const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Styles for the main header
    worksheet["A1"].s = {
      font: { bold: true, color: { rgb: "000000" }, sz: 22 },
      fill: { fgColor: { rgb: "FFFF00" } },
      alignment: { horizontal: "center", vertical: "center" },
      // border : {bottom : { style: "medium", color: "000000" }}
    };

    // Styles for the Secound main header
    worksheet["A2"].s = {
      font: { bold: true, color: { rgb: "000000" }, sz: 12 },
      fill: { fgColor: { rgb: "FFFF00" } },
      alignment: { horizontal: "center", vertical: "center" },
    };

    // Merge cells for the main header
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 20 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 20 } },
    ];

    // Styles for sub-header
    for (let col = 0; col < 21; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 2, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "000000" }, sz: 12 },
          fill: { fgColor: { rgb: "F4A460" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        };
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Course_Batch_Report");

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

export const getReceiptReport = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = receiptReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows } = await pool.query(`
      SELECT
      s.name,
      s.indos_number,
      s.mobile_number,
      s.email,
      p.payment_type,
      p.mode AS payment_mode,
      p.paid_amount,
      p.payment_id,
      p.remark AS payment_remark,
      p.misc_payment,
      p.misc_remark
      FROM payments AS p

      LEFT JOIN course_batches AS cb
      ON cb.batch_id = p.batch_id

      LEFT JOIN students AS s
      ON s.student_id = p.student_id

      LEFT JOIN courses AS c
      ON c.course_id = p.course_id
      
      WHERE c.institute = $1 AND DATE(p.created_at) BETWEEN $2 AND $3
    `, [value.institute, value.from_date, value.to_date]);
    res.status(200).json(new ApiResponse(200, "", rows));
  }
);

export const getReceiptReportExcel = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = receiptReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows } = await pool.query(
      `
      SELECT

      row_number() OVER () AS sr_no,
      p.form_id,
      p.created_at,
      s.name,
      s.indos_number,
      s.dob,
      c.course_code,
      s.mobile_number,
      s.email,
      p.payment_type,
      p.mode AS payment_mode,
      p.paid_amount,
      p.payment_id,
      p.remark AS payment_remark,
      p.misc_payment,
      p.misc_remark

      FROM payments AS p

      LEFT JOIN course_batches AS cb
      ON cb.batch_id = p.batch_id

      LEFT JOIN students AS s
      ON s.student_id = p.student_id

      LEFT JOIN courses AS c
      ON c.course_id = p.course_id

      WHERE c.institute = $1 AND DATE(p.created_at) BETWEEN $2 AND $3
    `,
      [value.institute, value.from_date, value.to_date]
    );
    res.status(200).json(new ApiResponse(200, "", rows));
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
            cursor.close(() => client.query("COMMIT")); // Commit the transaction
            client.release(); // Release the client
            return;
          }

          // Process the rows
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

export const getOccupancyReport = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = occupancyReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows } = await pool.query(`
      SELECT
        c.course_id,
        c.course_name,
        c.course_code,
        c.institute,
        COUNT(cb.batch_id) AS total_batch_conducted,
        SUM(cb.batch_total_seats) AS total_candidate_strength,
        COUNT(ebc.batch_id) AS occupency,
        mb.max_batch AS max_batch_per_month,
        ROUND((COUNT(ebc.batch_id)::DECIMAL / NULLIF(mb.max_batch * SUM(cb.batch_total_seats), 0) * 100), 2) AS occupency_percentage
      FROM courses AS c

      LEFT JOIN course_batches AS cb
      ON cb.course_id = c.course_id

      LEFT JOIN enrolled_batches_courses AS ebc
      ON ebc.batch_id = cb.batch_id AND ebc.enrollment_status = 'Approve'

      LEFT JOIN fillup_forms AS ff
      ON ff.form_id = ebc.form_id

      LEFT JOIN (
        SELECT DISTINCT ON (course_id) course_id, max_batch
        FROM course_with_max_batch_per_month
        ORDER BY course_id, created_month DESC
      ) mb ON c.course_id = mb.course_id

      WHERE cb.end_date BETWEEN $1 AND $2 AND c.institute = $3

      GROUP BY c.course_id, c.course_name, c.course_code, mb.max_batch
    `, [value.start_date, value.end_date, value.institute]);

    res.status(200).json(new ApiResponse(200, "Occupancy Report", rows));
  }
);
