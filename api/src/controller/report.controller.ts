import e, { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import {
  admissionReportValidator,
  courseTrendReportValidator,
  dgsIndosReportValidator,
  inventoryReportValidator,
  occupancyReportValidator,
  receiptReportValidator,
  refundReportValidator,
  studentBirthdateReportValidator,
  studentBirthdateWishValidator,
  VTimeTableReport,
} from "../validator/report.validator";
import { ErrorHandler } from "../utils/ErrorHandler";
import { pool } from "../config/db";
import { ApiResponse } from "../utils/ApiResponse";
import XLSX from "xlsx-js-style";
import { sendEmail } from "../utils/sendEmail";
import Cursor from "pg-cursor";
import { Readable } from "node:stream";
import { parsePagination } from "../utils/parsePagination";
import { VTimeTable } from "../validator/course.validator";
import { pmsReportV } from "../validator/inventory.validator";

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

    const { error, value } = admissionReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);
    const { LIMIT, OFFSET } = parsePagination(req);

    // let FILTER =
    //   "WHERE C.institute = $1 AND EC.enrollment_status = 'Approve' AND DATE(EC.created_at) BETWEEN $2 AND $3";
    // let FILTER_VALUES: any[] = [
    //   value.institute,
    //   value.from_date,
    //   value.to_date,
    // ];

    // if (req.query.form_id) {
    //   FILTER = "WHERE ff.form_id = $1";
    //   FILTER_VALUES = [req.query.form_id as string];
    // } else if (req.query.indos_number) {
    //   FILTER = "WHERE s.indos_number = $1";
    //   FILTER_VALUES = [req.query.indos_number as string];
    // } else if (req.query.cdc_num) {
    //   FILTER = "WHERE s.cdc_num = $1";
    //   FILTER_VALUES = [req.query.cdc_num as string];
    // } else if (req.query.passport_num) {
    //   FILTER = "WHERE s.passport_num = $1";
    //   FILTER_VALUES = [req.query.passport_num as string];
    // }

    // const sqlForAdmissionReport = `
    //     SELECT
    //         EC.created_at,
    //         C.course_name,
    //         CB.batch_fee AS course_batch_fee,
    //         (CB.batch_fee - SUM(PAY.paid_amount)) AS due_amount_for_course,
    //         -- C.course_fee,
    //         -- (C.course_fee - SUM(PAY.paid_amount)) AS due_amount_for_course,
    //         STU.name,
    //         STU.profile_image,
    //         C.course_type,
    //         STU.email,
    //         STU.mobile_number,
    //         SUM(PAY.paid_amount) AS paid_amount_for_course, -- it for total paid for course
    //         SUM(PAY.misc_payment) AS total_misc_amount,
    //         (SUM(PAY.paid_amount) + SUM(PAY.misc_payment)) AS total_paid
    //     FROM enrolled_batches_courses AS EC
    //     LEFT JOIN students AS STU
    //         ON EC.student_id = STU.student_id
    //     LEFT JOIN courses AS C
    //         ON EC.course_id = C.course_id
    //     LEFT JOIN payments AS PAY
    //         ON EC.course_id = PAY.course_id AND EC.student_id = PAY.student_id
    //     LEFT JOIN course_batches AS CB
    //         ON CB.batch_id = EC.batch_id
    //     ${FILTER}
    //     GROUP BY
    //         EC.created_at,
    //         C.course_name,
    //         CB.batch_fee,
    //         C.course_type,
    //         STU.student_id,
    //         STU.name,
    //         STU.profile_image,
    //         STU.email,
    //         STU.mobile_number
    //     LIMIT ${LIMIT} OFFSET ${OFFSET}
    // `;

    let placeholder = 3;
    let FILTER =
      "WHERE c.institute = $1 AND ebc.enrollment_status = 'Approve' AND DATE(ebc.created_at) BETWEEN $2 AND $3";
    let FILTER_VALUES: any[] = [
      value.institute,
      value.from_date,
      value.to_date,
    ];

    if (req.query.rank && req.query.rank !== "All") {
      placeholder += 1;
      FILTER += ` AND s.rank = $${placeholder}`;
      FILTER_VALUES.push(value.rank);
    }

    if (req.query.course_id && req.query.course_id !== "0") {
      placeholder += 1;
      FILTER += ` AND c.course_id = $${placeholder}`;
      FILTER_VALUES.push(value.course_id);
    }

    if (req.query.form_id) {
      FILTER = "WHERE ebc.form_id = $1";
      FILTER_VALUES = [req.query.form_id as string];
    } else if (req.query.indos_number) {
      FILTER = "WHERE s.indos_number = $1";
      FILTER_VALUES = [req.query.indos_number as string];
    } else if (req.query.cdc_num) {
      FILTER = "WHERE s.cdc_num = $1";
      FILTER_VALUES = [req.query.cdc_num as string];
    } else if (req.query.passport_num) {
      FILTER = "WHERE s.passport_num = $1";
      FILTER_VALUES = [req.query.passport_num as string];
    }

    const sqlForAdmissionReport = `
        SELECT
          s.profile_image,
          s.name,
          cb.start_date AS created_at,
          c.course_name,
          cb.batch_fee AS course_batch_fee,
          GREATEST((cb.batch_fee - SUM(p.discount_amount)) - SUM(p.paid_amount), 0) as due_amount_for_course,
          c.course_type,
          s.email,
          s.mobile_number,
          SUM(p.paid_amount) paid_amount_for_course,
          SUM(p.misc_payment) as total_misc_amount,
          SUM(p.paid_amount) + SUM(p.misc_payment) as total_paid,
          SUM(p.discount_amount) as total_discount
        FROM enrolled_batches_courses ebc

        INNER JOIN courses c
        ON c.course_id = ebc.course_id

        INNER JOIN course_batches cb
        ON cb.batch_id = ebc.batch_id

        INNER JOIN students s
        ON s.student_id = ebc.student_id

        INNER JOIN payments p
        ON p.batch_id = ebc.batch_id AND p.student_id = s.student_id

        ${FILTER}

        GROUP BY 
        c.course_name, cb.start_date, cb.batch_fee, s.name, s.profile_image, c.course_type, s.email, s.mobile_number

        LIMIT ${LIMIT} OFFSET ${OFFSET}
    `;

    const { rows } = await pool.query(sqlForAdmissionReport, FILTER_VALUES);
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

    await sendEmail(value.student_email, "BIRTHDATE_WISH", {
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
    const { LIMIT, OFFSET } = parsePagination(req);

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
      LIMIT ${LIMIT} OFFSET ${OFFSET}
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
    // const { LIMIT, OFFSET } = parsePagination(req);

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
      WHERE c.course_id = $1 AND c.course_type = $2 AND c.institute = $3 -- AND cb.start_date -- cb.start_date = $4
      GROUP BY cb.batch_id
      ORDER BY cb.start_date DESC
      LIMIT $4`;

    // LIMIT ${LIMIT} OFFSET ${OFFSET};
    const { rows } = await pool.query(courseTrendReportSql, [
      value.course_id,
      value.course_type,
      value.institute,
      // value.batch_date,
      value.last_no_of_batches,
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
        WHERE c.course_id = $1 AND c.course_type = $2 AND c.institute = $3 -- AND cb.start_date = $4
        GROUP BY cb.batch_id
        ORDER BY cb.start_date DESC
        LIMIT $4`;

    const { rows, rowCount } = await pool.query(courseTrendReportSql, [
      value.course_id,
      value.course_type,
      value.institute,
      // value.batch_date,
      value.last_no_of_batches,
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

    const { LIMIT, OFFSET } = parsePagination(req);

    const { rows } = await pool.query(
      `
       SELECT
          s.name,
          ebc.form_id,
          cb.start_date,
          cb.batch_fee,
          SUM(p.paid_amount) AS total_paid,
          GREATEST(((cb.batch_fee - SUM(p.discount_amount)) - SUM(p.paid_amount)), 0) AS total_due,
          SUM(p.misc_payment) AS total_misc_payment,
          SUM(p.discount_amount) AS discount_amount,
          ff.form_status,
          s.indos_number,
          s.mobile_number,
          s.email,
          STRING_AGG(p.payment_type, ', ') AS payment_types,
          STRING_AGG(p.mode, ', ') AS payment_modes,
          STRING_AGG(p.payment_id, ', ') AS payment_ids,
          STRING_AGG(p.remark, ', ') AS remarks
      FROM course_batches cb

      LEFT JOIN courses c
      ON c.course_id = cb.course_id

      LEFT JOIN enrolled_batches_courses ebc
      ON ebc.batch_id = cb.batch_id

      LEFT JOIN students s
      ON s.student_id = ebc.student_id

      LEFT JOIN fillup_forms ff
      ON ff.form_id = ebc.form_id

      LEFT JOIN payments AS p
      ON p.batch_id = cb.batch_id AND p.student_id = s.student_id

      WHERE cb.course_id = $1
          AND cb.start_date = $2
          AND c.institute = $3
          AND c.course_type = $4
                      
        GROUP BY s.name, ebc.form_id, cb.start_date, cb.batch_fee, ff.form_status, s.indos_number, s.mobile_number, s.email
        LIMIT ${LIMIT} OFFSET ${OFFSET};
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

    const { LIMIT, OFFSET } = parsePagination(req);

    const { rows } = await pool.query(
      `
      SELECT
      s.name,
      -- cb.batch_fee - COALESCE(SUM(p.paid_amount) OVER (PARTITION BY cb.batch_id, s.student_id), 0) AS due_amount,
      GREATEST((cb.batch_fee - COALESCE(SUM(p.discount_amount) OVER (PARTITION BY cb.batch_id, s.student_id), 0)) - COALESCE(SUM(p.paid_amount) OVER (PARTITION BY cb.batch_id, s.student_id), 0), 0.00) AS due_amount,
      s.indos_number,
      s.mobile_number,
      s.email,
      p.payment_type,
      p.mode AS payment_mode,
      p.paid_amount,
      p.payment_id,
      p.remark AS payment_remark,
      p.misc_payment,
      p.misc_remark,
      p.receipt_no,
      p.discount_amount,
      p.discount_remark,
      p.bank_transaction_id
      FROM payments AS p

      LEFT JOIN course_batches AS cb
      ON cb.batch_id = p.batch_id

      LEFT JOIN students AS s
      ON s.student_id = p.student_id

      LEFT JOIN courses AS c
      ON c.course_id = p.course_id
      
      WHERE c.institute = $1 AND DATE(p.created_at) BETWEEN $2 AND $3
      GROUP BY 
      s.student_id,
      cb.batch_id,
      s.name, cb.batch_fee,
      s.indos_number, s.mobile_number, 
      s.email, p.payment_type, p.mode, 
      p.paid_amount, p.payment_id, p.remark, p.misc_payment, p.misc_remark, p.receipt_no
      LIMIT ${LIMIT} OFFSET ${OFFSET};
    `,
      [value.institute, value.from_date, value.to_date]
    );
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
      p.misc_remark,
      p.bank_transaction_id

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

    // const { LIMIT, OFFSET } = parsePagination(req);

    // const { rows } = await pool.query(
    //   `
    //   SELECT
    //     c.course_id,
    //     c.course_name,
    //     c.course_code,
    //     c.institute,
    //     COUNT(cb.batch_id) AS total_batch_conducted,
    //     SUM(cb.batch_total_seats) AS total_candidate_strength,
    //     COUNT(ebc.batch_id) AS occupency,
    //     mb.max_batch AS max_batch_per_month,
    //     ROUND((COUNT(ebc.batch_id)::DECIMAL / NULLIF(mb.max_batch * SUM(cb.batch_total_seats), 0) * 100), 2) AS occupency_percentage
    //   FROM courses AS c

    //   LEFT JOIN course_batches AS cb
    //   ON cb.course_id = c.course_id

    //   LEFT JOIN enrolled_batches_courses AS ebc
    //   ON ebc.batch_id = cb.batch_id AND ebc.enrollment_status = 'Approve'

    //   LEFT JOIN fillup_forms AS ff
    //   ON ff.form_id = ebc.form_id

    //   LEFT JOIN (
    //     SELECT DISTINCT ON (course_id) course_id, max_batch
    //     FROM course_with_max_batch_per_month
    //     ORDER BY course_id, created_month DESC
    //   ) mb ON c.course_id = mb.course_id

    //   WHERE cb.end_date BETWEEN $1 AND $2 AND c.institute = $3

    //   GROUP BY c.course_id, c.course_name, c.course_code, mb.max_batch
    //   LIMIT ${LIMIT} OFFSET ${OFFSET};
    // `,
    //   [value.start_date, value.end_date, value.institute]
    // );

    const { rows } = await pool.query(
      `
      WITH EnrolledData AS (
          SELECT 
            course_id,
            COUNT(enroll_id) AS occupancy
          FROM 
            enrolled_batches_courses
          WHERE 
            enrollment_status = 'Approve'
          GROUP BY 
            course_id
        ),
        PaymentsData AS (
          SELECT 
            p.course_id,
            SUM(p.paid_amount) AS total_fee_collection,
            SUM(p.paid_amount) - SUM(discount_amount) AS after_discount_fee_collection
          FROM 
            payments p
          INNER JOIN 
            enrolled_batches_courses ebc ON p.course_id = ebc.course_id
          WHERE 
            ebc.enrollment_status = 'Approve'
          GROUP BY 
            p.course_id
        ),
        BatchData AS (
          SELECT 
            course_id,
            COUNT(batch_id) AS batch_conducted
          FROM 
            course_batches
          GROUP BY 
            course_id
        )
        SELECT 
          c.course_id,
          c.course_code,
          c.course_name,
          c.total_seats AS student_capacity,
          e.name AS executive_name,
          (SELECT max_batch FROM course_with_max_batch_per_month WHERE course_id = c.course_id ORDER BY created_date DESC LIMIT 1) as max_batch_per_month,
          bd.batch_conducted,
          COALESCE(ed.occupancy, 0) as occupancy,
          COALESCE(pd.total_fee_collection, 0) as total_fee_collection,
          COALESCE(pd.after_discount_fee_collection, 0) as after_discount_fee_collection,
          COALESCE(
            ROUND((ed.occupancy / (
            (SELECT max_batch FROM course_with_max_batch_per_month WHERE course_id = c.course_id ORDER BY created_date DESC LIMIT 1) 
            * c.total_seats)::DECIMAL * 100), 2)
          , 0) as occupancy_percentage
        FROM 
          courses c
        LEFT JOIN 
          BatchData bd ON bd.course_id = c.course_id
        LEFT JOIN 
          EnrolledData ed ON ed.course_id = c.course_id
        LEFT JOIN 
          PaymentsData pd ON pd.course_id = c.course_id
        LEFT JOIN 
          employee e ON e.id = c.concern_marketing_executive_id
        LEFT JOIN course_batches AS cb
          ON cb.course_id = c.course_id
        WHERE 
          c.institute = $1 AND cb.start_date BETWEEN $2 AND $3
        GROUP BY 
          c.course_id, c.course_name, c.total_seats, e.name, bd.batch_conducted, ed.occupancy, pd.total_fee_collection, pd.after_discount_fee_collection;
    `,
      [value.institute, value.start_date, value.end_date]
    );

    res.status(200).json(new ApiResponse(200, "Occupancy Report", rows));
  }
);

export const getRefundReport = asyncErrorHandler(async (req, res) => {
  const { error, value } = refundReportValidator.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);

  delete req.query.month_year;

  const { LIMIT, OFFSET } = parsePagination(req);

  const filters = value.start_date
    ? "WHERE c.institute = $1 AND c.course_type = $2 AND p.paid_amount > 0 AND r.created_at BETWEEN $3::timestamp AND $4::timestamp + INTERVAL '1 day' - INTERVAL '1 second'"
    : "WHERE c.institute = $1 AND c.course_type = $2 AND p.paid_amount > 0 AND r.course_id = $3 AND cb.start_date = $4";

  const filtersValues = value.start_date
    ? [value.institute, value.course_type, value.start_date, value.end_date]
    : [value.institute, value.course_type, value.course_id, value.batch_date];

  const { rows } = await pool.query(
    `
        SELECT
        s.name, 
        c.course_name,
        cb.start_date,
        STRING_AGG(p.remark, ', ') AS payment_details,
        SUM(p.paid_amount) AS total_amount,
        STRING_AGG(p.order_id, ', ') AS order_ids,
        STRING_AGG(TO_CHAR(p.created_at, 'YYYY-MM-DD'), ', ') AS payment_dates,
        STRING_AGG(p.receipt_no, ', ') AS receipt_nos,
        STRING_AGG(p.payment_type, ', ') AS payment_types,
        r.refund_amount,
        r.refund_reason,
        r.bank_details,
        r.created_at,
        r.executive_name,
        r.refund_id,
        STRING_AGG(DISTINCT p.form_id, ', ') AS form_id,
        STRING_AGG(DISTINCT p.bank_transaction_id, ', ') AS bank_transaction_id
        FROM refund_details AS r

        LEFT JOIN courses AS c
        ON c.course_id = r.course_id

        LEFT JOIN students AS s
        ON s.student_id = r.student_id

        LEFT JOIN course_batches AS cb
        ON cb.batch_id = r.batch_id

        LEFT JOIN payments AS p
        ON p.batch_id = r.batch_id AND p.course_id = r.course_id AND p.student_id = r.student_id

        ${filters}

        GROUP BY s.name, c.course_name, cb.start_date, r.refund_amount, r.refund_reason, r.bank_details, r.created_at, r.executive_name, r.refund_id
        LIMIT ${LIMIT} OFFSET ${OFFSET};
        `,
    filtersValues
  );

  res.status(200).json(new ApiResponse(200, "Refund Report", rows));
});

export const inventoryReport = asyncErrorHandler(async (req, res) => {
  const { error, value } = inventoryReportValidator.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);

  const { LIMIT, OFFSET } = parsePagination(req);

  const { rows } = await pool.query(
    `
    SELECT
        isi.purchase_date,
        iii.item_id,
        iii.item_name,
        iii.minimum_quantity,
        iii.vendor_id,
        v.vendor_name,
        iii.opening_stock,
        iii.closing_stock,
        STRING_AGG(isi.stock::TEXT, ' + ') AS added_stocks,
        STRING_AGG(isi.cost_per_unit::TEXT, ' + ') AS each_stock_cpu,
        STRING_AGG(isi.status, ' + ') AS stock_added_status,
        STRING_AGG(isi.total_value::TEXT, ' + ') AS each_stock_total_value,
        STRING_AGG(iic.consume_stock::TEXT, ' + ') AS consumed_stock,
        STRING_AGG(iic.remark, ' + ') AS consumed_stock_remark
      FROM inventory_item_info iii

      LEFT JOIN vendor v
      ON v.vendor_id = iii.vendor_id

      LEFT JOIN inventory_stock_info isi
      ON isi.item_id = iii.item_id

      LEFT JOIN inventory_item_consume iic
      ON iic.item_id = iii.item_id

      WHERE iii.institute = $1 AND isi.purchase_date BETWEEN $2 AND $3

      GROUP BY iii.item_id, v.vendor_name, isi.purchase_date

      LIMIT ${LIMIT} OFFSET ${OFFSET}
    `,
    [value.institute, value.from_date, value.to_date]
  );

  res.status(200).json(new ApiResponse(200, "Inventory Report", rows));
});

export const generateTimeTableReport = asyncErrorHandler(async (req, res) => {
  const { error, value } = VTimeTableReport.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);
  const { LIMIT, OFFSET } = parsePagination(req);
  const { institute, from_date, to_date } = value;

  const { rows } = await pool.query(
    `
    SELECT
    *,
    TO_CHAR(date, 'YYYY-MM-DD') AS at_date
    FROM
      time_table
    WHERE 
        institute = $1 AND date BETWEEN $2 AND $3

    ORDER BY date DESC

    LIMIT ${LIMIT} OFFSET ${OFFSET}

    `,
    [institute, from_date, to_date]
  );

  res.status(200).json(new ApiResponse(200, "Time Table Report", rows));
});

export const pmsReport = asyncErrorHandler(async (req, res) => {
  const { error, value } = pmsReportV.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);

  const { LIMIT, OFFSET } = parsePagination(req);

  const { rows } = await pool.query(
    `
    SELECT
      COALESCE(iii.item_name, pms.custom_item) as item_name,
      ph.*
    FROM planned_maintenance_system pms

    LEFT JOIN inventory_item_info iii
    ON iii.item_id = pms.item_id

    INNER JOIN pms_history ph
    ON ph.planned_maintenance_system_id = pms.planned_maintenance_system_id

    WHERE ph.${value.filter_by} BETWEEN $1 AND $2 AND pms.institute = $3

    LIMIT ${LIMIT} OFFSET ${OFFSET}
    `,
    [value.from_date, value.to_date, value.institute]
  );

  res.status(200).json(new ApiResponse(200, "", rows));
});
