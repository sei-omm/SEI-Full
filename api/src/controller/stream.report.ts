import { pool } from "../config/db";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import QueryStream from "pg-query-stream";
import ExcelJS from "exceljs";
import {
  admissionReportValidator,
  courseTrendReportValidator,
  dgsIndosReportValidator,
  inventoryReportValidator,
  occupancyExcelReportValidator,
  receiptReportValidator,
  refundReportValidator,
  VTimeTableReport,
} from "../validator/report.validator";
import { ErrorHandler } from "../utils/ErrorHandler";
import { beautifyDate } from "../utils/beautifyDate";
import { inventoryCatList, inventorySubCatList, TIME_PERIOD } from "../constant";
import { bookListReportV } from "../validator/library.validator";
import { pmsReportV } from "../validator/inventory.validator";
import { filterToSql } from "../utils/filterToSql";
import { generateEmployeeAttendance } from "../service/attendance.service";

export const streamMaintenceRecordExcelReport = asyncErrorHandler(
  async (req, res) => {
    //filters if any
    let filterQuery = "WHERE";
    const filterValues: string[] = [];
    let paramsNumber = 1;

    if (req.query.institute) {
      filterQuery += ` mr.institute = $${paramsNumber}`;
      filterValues.push(req.query.institute as string);
      paramsNumber++;
    }

    if (req.query.from_date && req.query.to_date) {
      const filter_by = req.query.filter_by === "maintenance_date" ? "mr.maintence_date::DATE" : "mr.completed_date::DATE"
      if (filterQuery === "WHERE") {
        filterQuery += ` ${filter_by} BETWEEN $${paramsNumber} AND $${paramsNumber + 1}`;
      } else {
        filterQuery +=` AND ${filter_by} BETWEEN $${paramsNumber} AND $${paramsNumber + 1}`;
      }
      paramsNumber++;
      paramsNumber++;

      filterValues.push(req.query.from_date as string);
      filterValues.push(req.query.to_date as string);
    }

    if (filterQuery === "WHERE") {
      filterQuery = "";
    }

    // Set response headers for streaming
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Maintence-Record-Report.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: res,
      useStyles: true,
    });
    const worksheet = workbook.addWorksheet("Report");

    worksheet.mergeCells("A1:L1");
    worksheet.getCell(
      "A1"
    ).value = `Maintenance Report (${req.query.institute})`;
    worksheet.getCell("A1").font = {
      size: 20,
      bold: true,
      color: { argb: "000000" },
    };
    worksheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    worksheet.getRow(1).height = 30;
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.addRow([
      "Sr Number",
      "Item Name",
      "Maintenance Date",
      "Work Station",
      "Description Of Work",
      "Department",
      "Assigned Person",
      "Approved By",
      "Cost",
      "Status",
      "Completed Date",
      "Remark",
    ]);

    // Row styling (header row)
    worksheet.getRow(2).eachCell((cell) => {
      cell.style = {
        font: { bold: true, size: 14, color: { argb: "000000" } },
        alignment: { horizontal: "center", vertical: "middle" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F4A460" },
        }, // Red background
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        },
      };
    });

    const client = await pool.connect();
    const query = new QueryStream(
      `
    SELECT
      row_number() OVER () AS sr_no,
      COALESCE(iii.item_name, mr.custom_item) AS item_name,
      mr.maintence_date,
      mr.work_station,
      mr.description_of_work,
      mr.department,
      mr.assigned_person,
      mr.approved_by,
      mr.cost,
      mr.status,
      mr.completed_date,
      mr.remark
    FROM maintence_record AS mr

    LEFT JOIN inventory_item_info AS iii
    ON iii.item_id = mr.item_id

    ${filterQuery}
    `,
      filterValues,
      {
        batchSize: 10,
      }
    );

    const pgStream = client.query(query);

    // Process PostgreSQL stream data and append to Excel sheet
    pgStream.on("data", (data) => {
      const excelRow = worksheet.addRow(Object.values(data));
      // Style the data rows
      excelRow.eachCell((cell) => {
        cell.style = {
          font: { size: 12 },
          alignment: { horizontal: "center" },
          border: {
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            bottom: { style: "thin" },
          },
        };
      });
    });

    pgStream.on("end", () => {
      workbook.commit();
      client.release(); // Release the client when done
    });

    pgStream.on("error", (err) => {
      client.release();
    });
  }
);

export const streamDgsIndosExcelReport = asyncErrorHandler(async (req, res) => {
  const { error, value } = dgsIndosReportValidator.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);

  // Set response headers for streaming
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="Dgs_And_Indos_Report.xlsx"'
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: res,
    useStyles: true,
  });
  const worksheet = workbook.addWorksheet("DGSIndos Report");

  worksheet.mergeCells("A1:F1");
  worksheet.getCell("A1").value = `DGS Indos Report (${value.institute})`;
  worksheet.getCell("A1").font = {
    size: 20,
    bold: true,
    color: { argb: "000000" },
  };
  worksheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF00" },
  };
  worksheet.getRow(1).height = 30;
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.addRow([
    "Sr Number",
    "Candidate Name",
    "Date of Birth",
    "INDoS No",
    "Mobile Number",
    "Email Address",
  ]);

  // Row styling (header row)
  worksheet.getRow(2).eachCell((cell) => {
    cell.style = {
      font: { bold: true, size: 14, color: { argb: "000000" } },
      alignment: { horizontal: "center", vertical: "middle" },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F4A460" },
      }, // Red background
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      },
    };
  });

  const client = await pool.connect();
  const query = new QueryStream(
    `
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
    `,
    [value.course_id, value.course_type, value.institute, value.batch_date],
    {
      batchSize: 10,
    }
  );

  const pgStream = client.query(query);

  // Process PostgreSQL stream data and append to Excel sheet
  pgStream.on("data", (data) => {
    const excelRow = worksheet.addRow(Object.values(data));
    // Style the data rows
    excelRow.eachCell((cell) => {
      cell.style = {
        font: { size: 12 },
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        },
      };
    });
  });

  pgStream.on("end", () => {
    workbook.commit();
    client.release(); // Release the client when done
  });

  pgStream.on("error", (err) => {
    client.release();
  });
});

export const streamCourseTrendExcelReport = asyncErrorHandler(
  async (req, res) => {
    const { error, value } = courseTrendReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    // Set response headers for streaming
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Course_Batch_Trend_Report.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: res,
      useStyles: true,
    });
    const worksheet = workbook.addWorksheet("Course Trend Report");

    worksheet.mergeCells("A1:E1");
    worksheet.getCell("A1").value = `Course Trend Report (${value.institute})`;
    worksheet.getCell("A1").font = {
      size: 20,
      bold: true,
      color: { argb: "000000" },
    };
    worksheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    worksheet.getRow(1).height = 30;
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    //row where to show the course name
    const { rows } = await pool.query(
      `SELECT course_name FROM courses WHERE course_id = $1`,
      [value.course_id]
    );
    worksheet.mergeCells("A2:E2");
    worksheet.getCell("A2").value = `Course Name : ${rows[0].course_name}`;
    worksheet.getCell("A2").font = {
      size: 18,
      bold: true,
      color: { argb: "000000" },
    };
    worksheet.getCell("A2").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    worksheet.getRow(1).height = 30;
    worksheet.getCell("A2").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.addRow([
      "SL. No",
      "Start Date",
      "End Date",
      "Number of Applied Students",
      "Number of Approved Students",
    ]);

    // Row styling (header row)
    worksheet.getRow(3).eachCell((cell) => {
      cell.style = {
        font: { bold: true, size: 14, color: { argb: "000000" } },
        alignment: { horizontal: "center", vertical: "middle" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F4A460" },
        }, // Red background
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        },
      };
    });

    const client = await pool.connect();
    const query = new QueryStream(
      `
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
        LIMIT $4
    `,
      [
        value.course_id,
        value.course_type,
        value.institute,
        // value.batch_date
        value.last_no_of_batches,
      ],
      {
        batchSize: 10,
      }
    );

    const pgStream = client.query(query);

    // Process PostgreSQL stream data and append to Excel sheet
    pgStream.on("data", (data) => {
      const excelRow = worksheet.addRow(Object.values(data));
      // Style the data rows
      excelRow.eachCell((cell) => {
        cell.style = {
          font: { size: 12 },
          alignment: { horizontal: "center" },
          border: {
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            bottom: { style: "thin" },
          },
        };
      });
    });

    pgStream.on("end", () => {
      workbook.commit();
      client.release(); // Release the client when done
    });

    pgStream.on("error", (err) => {
      client.release();
    });
  }
);

export const streamBatchExcelReport = asyncErrorHandler(async (req, res) => {
  const { error, value } = dgsIndosReportValidator.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);

  // Set response headers for streaming
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="Course_Batch_Report.xlsx"'
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: res,
    useStyles: true,
  });
  const worksheet = workbook.addWorksheet("Course Batch Report");

  worksheet.mergeCells("A1:Q1");
  worksheet.getCell("A1").value = `Course Batch Report (${value.institute})`;
  worksheet.getCell("A1").font = {
    size: 20,
    bold: true,
    color: { argb: "000000" },
  };
  worksheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF00" },
  };
  worksheet.getRow(1).height = 30;
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  //row where to show the course name
  const { rows } = await pool.query(
    `SELECT course_name FROM courses WHERE course_id = $1`,
    [value.course_id]
  );
  worksheet.mergeCells("A2:Q2");
  worksheet.getCell("A2").value = `Course Name : ${rows[0].course_name}`;
  worksheet.getCell("A2").font = {
    size: 18,
    bold: true,
    color: { argb: "000000" },
  };
  worksheet.getCell("A2").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF00" },
  };
  worksheet.getRow(1).height = 30;
  worksheet.getCell("A2").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.addRow([
    "Sr Number",
    "Form ID",
    "Student Name",
    "Batch Date",
    "Batch Fee",
    "Due Amount",
    "Amount Paid",
    "Total Misc Payment",
    "Discount",
    "Admission Form Status",
    "Indos Number",
    "Mobile Number",
    "Email",
    "Payment Type",
    "Payment Mode",
    "Payment Id",
    "Remark",
  ]);

  // Row styling (header row)
  worksheet.getRow(3).eachCell((cell, cellNumber) => {
    cell.style = {
      font: {
        bold: true,
        size: 14,
        color: { argb: cellNumber === 6 ? "FFFFFF" : "000000" },
      },
      alignment: { horizontal: "center", vertical: "middle" },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: cellNumber === 6 ? "DC2626" : "F4A460" },
      },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      },
    };
  });

  const client = await pool.connect();
  // const query = new QueryStream(
  //   `
  //      SELECT
  //         row_number() OVER () AS sr_no,
  //         ebc.form_id,
  //         s.name,
  //         cb.start_date,
  //         cb.batch_fee,
  //         (cb.batch_fee - SUM(p.paid_amount)) AS total_due,
  //         SUM(p.paid_amount) AS total_paid,
  //         SUM(p.misc_payment) AS total_misc_payment,
  //         ff.form_status,
  //         s.indos_number,
  //         s.mobile_number,
  //         s.email,
  //         STRING_AGG(p.payment_type, ', ') AS payment_types,
  //         STRING_AGG(p.mode, ', ') AS payment_modes,
  //         STRING_AGG(p.payment_id, ', ') AS payment_ids,
  //         STRING_AGG(p.remark, ', ') AS remarks
  //       FROM enrolled_batches_courses AS ebc

  //       LEFT JOIN students AS s
  //           ON s.student_id = ebc.student_id
  //       LEFT JOIN course_batches AS cb
  //           ON cb.batch_id = ebc.batch_id
  //       RIGHT JOIN payments AS p
  //           ON p.batch_id = ebc.batch_id
  //       LEFT JOIN fillup_forms AS ff
  //           ON ff.form_id = ebc.form_id
  //       LEFT JOIN courses AS c
  //           ON c.course_id = ebc.course_id

  //       WHERE ebc.course_id = $1
  //             AND cb.start_date = $2
  //             AND c.institute = $3
  //             AND c.course_type = $4

  //       GROUP BY p.student_id, ebc.form_id, s.name, cb.start_date, cb.batch_fee, ff.form_status, s.indos_number, s.mobile_number, s.email, ff.created_at, s.dob, cb.start_date
  //   `,
  //   [value.course_id, value.batch_date, value.institute, value.course_type],
  //   {
  //     batchSize: 10,
  //   }
  // );

  const query = new QueryStream(
    `
       SELECT
          row_number() OVER () AS sr_no,
          ebc.form_id,
          s.name,
          cb.start_date,
          cb.batch_fee,
          GREATEST(((cb.batch_fee - SUM(p.discount_amount)) - SUM(p.paid_amount)), 0) AS total_due,
          SUM(p.paid_amount) AS total_paid,
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
      `,
    [value.course_id, value.batch_date, value.institute, value.course_type],
    {
      batchSize: 10,
    }
  );

  const pgStream = client.query(query);

  // Process PostgreSQL stream data and append to Excel sheet
  pgStream.on("data", (data) => {
    const excelRow = worksheet.addRow(Object.values(data));
    // Style the data rows
    excelRow.eachCell((cell, cellNumber) => {
      const values = Object.values(data);
      cell.style = {
        font: {
          size: 12,
          bold: cellNumber === 6,
          color: {
            argb:
              cellNumber === 6 && parseInt(values[cellNumber - 1] as any) > 0
                ? "DC2626"
                : "000000",
          },
        },
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        },
      };
    });
  });

  pgStream.on("end", () => {
    workbook.commit();
    client.release(); // Release the client when done
  });

  pgStream.on("error", (err) => {
    client.release();
  });
});

export const streamReceiptExcelReport = asyncErrorHandler(async (req, res) => {
  const { error, value } = receiptReportValidator.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);

  // Set response headers for streaming
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="Receipt_Report.xlsx"'
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: res,
    useStyles: true,
  });
  const worksheet = workbook.addWorksheet("Receipt Report");

  worksheet.mergeCells("A1:U1");
  worksheet.getCell(
    "A1"
  ).value = `Receipt Report (${value.institute}) ${value.from_date} -> ${value.to_date}`;
  worksheet.getCell("A1").font = {
    size: 20,
    bold: true,
    color: { argb: "000000" },
  };
  worksheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF00" },
  };
  worksheet.getRow(1).height = 30;
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.addRow([
    "Sr Number",
    "Form Id",
    "Admission Date",
    "Student Name",
    "Due Amount",
    "Indos Number",
    "Date Of Birth",
    "Course Code",
    "Mobile Number",
    "Email",
    "Payment Type",
    "Payment Mode",
    "Paid Amount",
    "Payment Id",
    "Payment Remark",
    "Misc Payment",
    "Misc Remark",
    "Receipt Number",
    "Discount Amount",
    "Discount Remark",
    "Bank Transaction ID",
  ]);

  // Row styling (header row)
  worksheet.getRow(2).eachCell((cell, cellNumber) => {
    cell.style = {
      font: {
        bold: true,
        size: 14,
        color: { argb: cellNumber === 5 ? "FFFFFF" : "000000" },
      },
      alignment: { horizontal: "center", vertical: "middle" },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: cellNumber === 5 ? "DC2626" : "F4A460" },
      }, // Red background
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      },
    };
  });

  const client = await pool.connect();
  const query = new QueryStream(
    `
      SELECT

      row_number() OVER () AS sr_no,
      p.form_id,
      p.created_at,
      s.name,
      -- cb.batch_fee - COALESCE(SUM(p.paid_amount) OVER (PARTITION BY cb.batch_id, s.student_id), 0) AS due_amount,
      GREATEST((cb.batch_fee - COALESCE(SUM(p.discount_amount) OVER (PARTITION BY cb.batch_id, s.student_id), 0)) - COALESCE(SUM(p.paid_amount) OVER (PARTITION BY cb.batch_id, s.student_id), 0), 0.00) AS due_amount,
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

      WHERE c.institute = $1 AND p.payment_type != 'Discount' AND DATE(p.created_at) BETWEEN $2 AND $3

      GROUP BY 
       s.student_id,
       cb.batch_id,
       p.form_id, 
       cb.batch_fee,
       p.created_at, 
       s.name, 
       s.indos_number, 
       s.dob, 
       c.course_code,
       s.mobile_number, 
       s.email, 
       p.payment_type, 
       p.mode, 
       p.paid_amount, 
       p.payment_id, 
       p.remark, p.misc_payment, p.misc_remark, p.receipt_no
    `,
    [value.institute, value.from_date, value.to_date],
    {
      batchSize: 10,
    }
  );

  const pgStream = client.query(query);

  // Process PostgreSQL stream data and append to Excel sheet
  pgStream.on("data", (data) => {
    const excelRow = worksheet.addRow(Object.values(data));
    // Style the data rows
    excelRow.eachCell((cell, cellNumber) => {
      const values = Object.values(data);
      cell.style = {
        font: {
          size: 12,
          bold: cellNumber === 5,
          color: {
            argb:
              cellNumber === 5 && parseInt(values[cellNumber - 1] as any) > 0
                ? "DC2626"
                : "000000",
          },
        },
        alignment: { horizontal: "center" },

        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        },
      };
    });
  });

  pgStream.on("end", () => {
    workbook.commit();
    client.release(); // Release the client when done
  });

  pgStream.on("error", (err) => {
    client.release();
  });
});

export const streamAdmissionExcelReport = asyncErrorHandler(
  async (req, res) => {
    const { error, value } = admissionReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    // Set response headers for streaming
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Admission_Report.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: res,
      useStyles: true,
    });
    const worksheet = workbook.addWorksheet("Admission Report");

    worksheet.mergeCells("A1:M1");
    worksheet.getCell("A1").value = `Admission Report (${
      value.institute
    }) ${beautifyDate(value.from_date)} -> ${beautifyDate(value.to_date)}`;
    worksheet.getCell("A1").font = {
      size: 20,
      bold: true,
      color: { argb: "000000" },
    };
    worksheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    worksheet.getRow(1).height = 30;
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.addRow([
      "Sr Number",
      "Admission Date",
      "Course Name",
      "Course Batch Fee",
      "Due Amount",
      "Student Name",
      "Course Type",
      "Email",
      "Mobile Number",
      "Paid Amount",
      "Misc Payment",
      "Total Paid",
      "Discount",
    ]);

    // Row styling (header row)
    worksheet.getRow(2).eachCell((cell, cellNumber) => {
      cell.style = {
        font: {
          bold: true,
          size: 14,
          color: { argb: cellNumber === 5 ? "FFFFFF" : "000000" },
        },
        alignment: { horizontal: "center", vertical: "middle" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: cellNumber === 5 ? "DC2626" : "F4A460" },
        },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        },
      };
    });

    const client = await pool.connect();
    // const query = new QueryStream(
    //   `
    //   SELECT
    //         row_number() OVER () AS sr_no,
    //         EC.created_at,
    //         C.course_name,
    //         CB.batch_fee AS course_batch_fee,
    //         (CB.batch_fee - SUM(PAY.paid_amount)) AS due_amount_for_course,
    //         -- C.course_fee,
    //         -- (C.course_fee - SUM(PAY.paid_amount)) AS due_amount_for_course,
    //         STU.name,
    //        -- STU.profile_image,
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
    //     WHERE C.institute = $1 AND EC.enrollment_status = 'Approve' AND DATE(EC.created_at) BETWEEN $2 AND $3
    //     GROUP BY
    //         EC.created_at,
    //         C.course_name,
    //         CB.batch_fee,
    //         -- C.course_fee,
    //         C.course_type,
    //         STU.student_id,
    //         STU.name,
    //         STU.profile_image,
    //         STU.email,
    //         STU.mobile_number
    // `,

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

    const query = new QueryStream(
      `
      SELECT
          row_number() OVER () AS sr_no,
          cb.start_date AS created_at,
          c.course_name,
          cb.batch_fee AS course_batch_fee,
          GREATEST((cb.batch_fee - SUM(p.discount_amount)) - SUM(p.paid_amount), 0) as due_amount_for_course,
          s.name,
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
      `,
      FILTER_VALUES,
      {
        batchSize: 10,
      }
    );

    const pgStream = client.query(query);

    // Process PostgreSQL stream data and append to Excel sheet
    pgStream.on("data", (data) => {
      const values = Object.values(data);
      const excelRow = worksheet.addRow(values);
      // Style the data rows
      excelRow.eachCell((cell, cellNumber) => {
        cell.style = {
          font: {
            size: 12,
            bold: cellNumber === 5,
            color: {
              argb:
                cellNumber === 5 && parseInt(values[cellNumber - 1] as any) > 0
                  ? "DC2626"
                  : "000000",
            },
          },
          alignment: { horizontal: "center" },
          border: {
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            bottom: { style: "thin" },
          },
        };
      });
    });

    pgStream.on("end", () => {
      workbook.commit();
      client.release(); // Release the client when done
    });

    pgStream.on("error", (err) => {
      client.release();
    });
  }
);

// export const streamOccupancyExcelReport = asyncErrorHandler(
//   async (req, res) => {
//     const { error, value } = occupancyExcelReportValidator.validate(req.query);
//     if (error) throw new ErrorHandler(400, error.message);

//     // Set response headers for streaming
//     res.setHeader(
//       "Content-Disposition",
//       'attachment; filename="Occupancy_Report.xlsx"'
//     );
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );

//     const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
//       stream: res,
//       useStyles: true,
//     });
//     const worksheet = workbook.addWorksheet("Occupancy Report");

//     const date = new Date(value.end_date);
//     const formattedDate = new Intl.DateTimeFormat("en-GB", {
//       month: "short",
//       year: "numeric",
//     }).format(date);

//     //first heading
//     worksheet.mergeCells("A1:K1");
//     worksheet.getCell("A1").value = `${formattedDate} - Occupancy Report`;
//     worksheet.getCell("A1").font = {
//       size: 16,
//       bold: true,
//       color: { argb: "000000" },
//     };
//     worksheet.getCell("A1").fill = {
//       type: "pattern",
//       pattern: "solid",
//       fgColor: { argb: "FFFF00" },
//     };
//     worksheet.getRow(1).height = 30;
//     worksheet.getCell("A1").alignment = {
//       horizontal: "center",
//       vertical: "middle",
//     };

//     //secound heading kolkata
//     worksheet.mergeCells("A2:F2");
//     worksheet.getCell("A2").value = "SEIET, KOLKATA";
//     worksheet.getCell("A2").font = {
//       size: 11,
//       bold: true,
//       color: { argb: "000000" },
//     };
//     worksheet.getCell("A2").fill = {
//       type: "pattern",
//       pattern: "solid",
//       // fgColor: { argb: "FFFF00" },
//       fgColor: { argb: "C3D0CF" },
//     };
//     worksheet.getRow(1).height = 20;
//     worksheet.getCell("A2").alignment = {
//       horizontal: "center",
//       vertical: "middle",
//     };
//     worksheet.getCell("A2").border = {
//       right: { style: "medium", color: { argb: "000000" } },
//     };

//     //secound heading faridabad
//     worksheet.mergeCells("G2:K2");
//     worksheet.getCell("G2").value = "SEIET, FARIDABAD";
//     worksheet.getCell("G2").font = {
//       size: 11,
//       bold: true,
//       color: { argb: "000000" },
//     };
//     worksheet.getCell("G2").fill = {
//       type: "pattern",
//       pattern: "solid",
//       // fgColor: { argb: "FFFF00" },
//       fgColor: { argb: "C3D0CF" },
//     };
//     worksheet.getRow(1).height = 20;
//     worksheet.getCell("G2").alignment = {
//       horizontal: "center",
//       vertical: "middle",
//     };

//     worksheet.addRow([
//       "COURSE",
//       "MAXIMUM BATCHES/MONTH",
//       "CANDIDATE STRENGTH",
//       "BATCH CONDUCTED",
//       "OCCUPENCY",
//       "% OF OCCUPENCY",

//       "MAXIMUM BATCHES/MONTH",
//       "CANDIDATE STRENGTH",
//       "BATCH CONDUCTED",
//       "OCCUPENCY",
//       "% OF OCCUPENCY",
//     ]);

//     // Row styling (header row)
//     worksheet.getRow(3).eachCell((cell, cellNumber) => {
//       cell.style = {
//         font: {
//           size: 9,
//           color: { argb: "DC2626" },
//         },
//         alignment: { horizontal: "center", vertical: "middle" },
//         border: {
//           top: { style: "thin" },
//           left: { style: "thin" },
//           right: { style: cellNumber === 6 ? "medium" : "thin" },
//           bottom: { style: "thin" },
//         },
//       };
//     });

//     const client = await pool.connect();
//     const query = new QueryStream(
//       `
//         SELECT
//             c.course_id,
//             c.course_name,
//             c.course_code,
//             c.institute,
//             COUNT(cb.batch_id) AS total_batch_conducted,
//             SUM(cb.batch_total_seats) AS total_candidate_strength,
//             COUNT(ebc.batch_id) AS occupency,
//             mb.max_batch AS max_batch_per_month,
//             ROUND((COUNT(ebc.batch_id)::DECIMAL / NULLIF(mb.max_batch * SUM(cb.batch_total_seats), 0) * 100), 2) AS occupency_percentage
//           FROM courses AS c

//           -- LEFT JOIN course_batches AS cb
//           -- ON cb.course_id = c.course_id
//           LEFT JOIN (SELECT * FROM course_batches WHERE end_date BETWEEN $1 AND $2) AS cb ON cb.course_id = c.course_id

//           LEFT JOIN enrolled_batches_courses AS ebc
//           ON ebc.batch_id = cb.batch_id AND ebc.enrollment_status = 'Approve'

//           LEFT JOIN fillup_forms AS ff
//           ON ff.form_id = ebc.form_id

//           LEFT JOIN (
//             SELECT DISTINCT ON (course_id) course_id, max_batch
//             FROM course_with_max_batch_per_month
//             ORDER BY course_id, created_month DESC
//           ) mb ON c.course_id = mb.course_id

//           GROUP BY c.course_id, c.course_name, c.course_code, mb.max_batch
//     `,
//       [value.start_date, value.end_date],
//       {
//         batchSize: 10,
//       }
//     );

//     const pgStream = client.query(query);

//     // Process PostgreSQL stream data and append to Excel sheet
//     pgStream.on("data", (data) => {
//       const excelRow = worksheet.addRow([
//         data.course_code,
//         data.institute === "Kolkata" && data.max_batch_per_month
//           ? data.max_batch_per_month
//           : "x",
//         data.institute === "Kolkata" && data.total_candidate_strength
//           ? data.total_candidate_strength
//           : "x",
//         data.institute === "Kolkata" && data.total_batch_conducted
//           ? data.total_batch_conducted
//           : "x",
//         data.institute === "Kolkata" && data.occupency ? data.occupency : "x",
//         data.institute === "Kolkata" && data.occupency_percentage
//           ? data.occupency_percentage + "%"
//           : "x",

//         data.institute === "Faridabad" && data.max_batch_per_month
//           ? data.max_batch_per_month
//           : "x",
//         data.institute === "Faridabad" && data.total_candidate_strength
//           ? data.total_candidate_strength
//           : "x",
//         data.institute === "Faridabad" && data.total_batch_conducted
//           ? data.total_batch_conducted
//           : "x",
//         data.institute === "Faridabad" && data.occupency ? data.occupency : "x",
//         data.institute === "Faridabad" && data.occupency_percentage
//           ? data.occupency_percentage + "%"
//           : "x",
//       ]);
//       // Style the data rows
//       excelRow.eachCell((cell, cellNumber) => {
//         cell.style = {
//           font: {
//             size: 9,
//             color: { argb: "000000" },
//           },
//           alignment: { horizontal: "center" },
//           border: {
//             top: { style: "thin" },
//             left: { style: "thin" },
//             right: { style: cellNumber === 6 ? "medium" : "thin" },
//             bottom: { style: "thin" },
//           },
//         };
//       });
//     });

//     pgStream.on("end", () => {
//       workbook.commit();
//       client.release(); // Release the client when done
//     });

//     pgStream.on("error", (err) => {
//       client.release();
//     });
//   }
// );

export const streamOccupancyExcelReport = asyncErrorHandler(
  async (req, res) => {
    const { error, value } = occupancyExcelReportValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    // Set response headers for streaming
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Occupancy_Report.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: res,
      useStyles: true,
    });
    const worksheet = workbook.addWorksheet("Occupancy Report");

    worksheet.mergeCells("A1:J1");
    worksheet.getCell("A1").value = `Occupancy Report (${
      value.institute
    }) ${beautifyDate(value.start_date)} -> ${beautifyDate(value.end_date)}`;
    worksheet.getCell("A1").font = {
      size: 20,
      bold: true,
      color: { argb: "000000" },
    };
    worksheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    worksheet.getRow(1).height = 30;
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.addRow([
      "Course Name",
      "Course Code",
      "Maximum Batch This Month",
      "Batch Conducted This Month",
      "Candidate Strength",
      "Occupency",
      "% Of Occupency",
      "Executive Name",
      "Fee Collection",
      "Fee Collection After Discount",
    ]);

    // Row styling (header row)
    worksheet.getRow(2).eachCell((cell) => {
      cell.style = {
        font: {
          bold: true,
          size: 14,
          color: { argb: "000000" },
        },
        alignment: { horizontal: "center", vertical: "middle" },
        fill: {
          type: "pattern",
          pattern: "solid",
          // fgColor: { argb: cellNumber === 5 ? "DC2626" : "F4A460" },
          fgColor: { argb: "F4A460" },
        },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        },
      };
    });

    const client = await pool.connect();
    const query = new QueryStream(
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
          -- c.course_id,
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
      [value.institute, value.start_date, value.end_date],
      {
        batchSize: 10,
      }
    );

    const pgStream = client.query(query);

    // Process PostgreSQL stream data and append to Excel sheet
    pgStream.on("data", (data) => {
      const excelRow = worksheet.addRow([
        data.course_name,
        data.course_code,
        data.max_batch_per_month,
        data.batch_conducted,
        data.student_capacity,
        data.occupancy,
        `${data.occupancy_percentage}%`,
        data.executive_name,
        data.total_fee_collection,
        data.after_discount_fee_collection,
      ]);
      // Style the data rows
      excelRow.eachCell((cell, cellNumber) => {
        cell.style = {
          font: {
            size: 12,
            color: {
              argb: "000000",
            },
          },
          alignment: { horizontal: "center" },
          border: {
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            bottom: { style: "thin" },
          },
        };
      });
    });

    pgStream.on("end", () => {
      workbook.commit();
      client.release(); // Release the client when done
    });

    pgStream.on("error", (err) => {
      client.release();
    });
  }
);

export const streamRefundExcelReport = asyncErrorHandler(async (req, res) => {
  const { error, value } = refundReportValidator.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);

  // Set response headers for streaming
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="Refund_Report.xlsx"'
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: res,
    useStyles: true,
  });
  const worksheet = workbook.addWorksheet("Refund Report");

  worksheet.mergeCells("A1:R1");
  worksheet.getCell("A1").value = `Refund Report (${value.institute})`;
  worksheet.getCell("A1").font = {
    size: 20,
    bold: true,
    color: { argb: "000000" },
  };
  worksheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF00" },
  };
  worksheet.getRow(1).height = 30;
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.addRow([
    "SR NUMBER",
    "CANDIDATE NAME",
    "COURSE",
    "BATCH DATE",
    "PAYMENT DETAILS",
    "TOTAL AMOUNT",
    "ORDER ID",
    "PAYMENT DATE",
    "RECEIPT NO",
    "PAYMENT TYPE",
    "REFUND AMOUNT",
    "REASON",
    "BANK DETAILS",
    "REFUND DATE",
    "EXECUTIVE NAME",
    "REFUND ID",
    "FORM ID",
    "BANK TRANSACTION ID",
  ]);

  // Row styling (header row)
  worksheet.getRow(2).eachCell((cell) => {
    cell.style = {
      font: {
        bold: true,
        size: 12,
        color: { argb: "000000" },
      },
      alignment: { horizontal: "center", vertical: "middle" },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F4A460" },
      },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      },
    };
  });

  const filters = value.start_date
    ? "WHERE c.institute = $1 AND c.course_type = $2 AND p.paid_amount > 0 AND r.created_at BETWEEN $3::timestamp AND $4::timestamp + INTERVAL '1 day' - INTERVAL '1 second'"
    : "WHERE c.institute = $1 AND c.course_type = $2 AND p.paid_amount > 0 AND r.course_id = $3 AND cb.start_date = $4";

  const filtersValues = value.start_date
    ? [value.institute, value.course_type, value.start_date, value.end_date]
    : [value.institute, value.course_type, value.course_id, value.batch_date];

  const client = await pool.connect();
  const query = new QueryStream(
    `
        SELECT
        row_number() OVER () AS sr_no,
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
    `,
    filtersValues,
    {
      batchSize: 10,
    }
  );

  const pgStream = client.query(query);

  // Process PostgreSQL stream data and append to Excel sheet
  pgStream.on("data", (data) => {
    const excelRow = worksheet.addRow(Object.values(data));
    // Style the data rows
    excelRow.eachCell((cell) => {
      cell.style = {
        font: { size: 11 },
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        },
      };
    });
  });

  pgStream.on("end", () => {
    workbook.commit();
    client.release(); // Release the client when done
  });

  pgStream.on("error", (err) => {
    client.release();
  });
});

// export const streamInventoryReport = asyncErrorHandler(async (req, res) => {
//   const { error, value } = inventoryReportValidator.validate(req.query);
//   if (error) throw new ErrorHandler(400, error.message);

//   // Set response headers for streaming
//   res.setHeader(
//     "Content-Disposition",
//     'attachment; filename="Inventory_Report.xlsx"'
//   );
//   res.setHeader(
//     "Content-Type",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   );

//   const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
//     stream: res,
//     useStyles: true,
//   });
//   const worksheet = workbook.addWorksheet("Inventory Report");

//   worksheet.mergeCells("A1:K1");
//   worksheet.getCell("A1").value = `Inventory Report (${
//     value.institute
//   }) ${beautifyDate(value.from_date)} - ${beautifyDate(value.to_date)}`;
//   worksheet.getCell("A1").font = {
//     size: 20,
//     bold: true,
//     color: { argb: "000000" },
//   };
//   worksheet.getCell("A1").fill = {
//     type: "pattern",
//     pattern: "solid",
//     fgColor: { argb: "FFFF00" },
//   };
//   worksheet.getRow(1).height = 30;
//   worksheet.getCell("A1").alignment = {
//     horizontal: "center",
//     vertical: "middle",
//   };

//   worksheet.addRow([
//     "SR NUMBER",
//     "DATE",
//     "ITEM NAME",
//     "MINIMUM STOCK",
//     "SUPPLIER",
//     "STOCKS ADDED",
//     "EACH STOCK CPU",
//     "EACH STOCK STATUS",
//     "EACH STOCK TOTAL VALUE",
//     "CONSUMED STOCK",
//     "CONSUMED STOCK REMARK"
//   ]);

//   // Row styling (header row)
//   worksheet.getRow(2).eachCell((cell) => {
//     cell.style = {
//       font: {
//         bold: true,
//         size: 12,
//         color: { argb: "000000" },
//       },
//       alignment: { horizontal: "center", vertical: "middle" },
//       fill: {
//         type: "pattern",
//         pattern: "solid",
//         fgColor: { argb: "F4A460" },
//       },
//       border: {
//         top: { style: "thin" },
//         left: { style: "thin" },
//         right: { style: "thin" },
//         bottom: { style: "thin" },
//       },
//     };
//   });

//   const client = await pool.connect();
//   const query = new QueryStream(
//     `
//       SELECT
//         row_number() OVER () AS sr_no,
//         isi.purchase_date,
//         iii.item_name,
//         iii.minimum_quantity,
//         v.vendor_name,
//         STRING_AGG(isi.stock::TEXT, ' + ') AS added_stocks,
//         STRING_AGG(isi.cost_per_unit::TEXT, ' + ') AS each_stock_cpu,
//         STRING_AGG(isi.status, ' + ') AS stock_added_status,
//         STRING_AGG(isi.total_value::TEXT, ' + ') AS each_stock_total_value,
// 		    -- (SELECT SUM(consume_stock) FROM inventory_item_consume WHERE item_id = iii.item_id AND consumed_date = isi.purchase_date) AS consumed_stock
//         STRING_AGG(iic.consume_stock::TEXT, ' + ') AS consumed_stock,
//         STRING_AGG(iic.remark, ' + ') AS consumed_stock_remark
//       FROM inventory_item_info iii

//       LEFT JOIN vendor v
//       ON v.vendor_id = iii.vendor_id

//       LEFT JOIN inventory_stock_info isi
//       ON isi.item_id = iii.item_id

//       LEFT JOIN inventory_item_consume iic
//       ON iic.item_id = iii.item_id

//       WHERE iii.institute = $1 AND isi.purchase_date BETWEEN $2 AND $3

//       GROUP BY iii.item_id, v.vendor_name, isi.purchase_date
//     `,
//     [value.institute, value.from_date, value.to_date],
//     {
//       batchSize: 10,
//     }
//   );

//   const pgStream = client.query(query);

//   // Process PostgreSQL stream data and append to Excel sheet
//   pgStream.on("data", (data) => {
//     const excelRow = worksheet.addRow(Object.values(data));
//     // Style the data rows
//     excelRow.eachCell((cell) => {
//       cell.style = {
//         font: { size: 11 },
//         alignment: { horizontal: "center" },
//         border: {
//           top: { style: "thin" },
//           left: { style: "thin" },
//           right: { style: "thin" },
//           bottom: { style: "thin" },
//         },
//       };
//     });
//   });

//   pgStream.on("end", () => {
//     workbook.commit();
//     client.release(); // Release the client when done
//   });

//   pgStream.on("error", (err) => {
//     client.release();
//   });
// });

export const streamInventoryReport = asyncErrorHandler(async (req, res) => {
  const { error, value } = inventoryReportValidator.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);

  // Set response headers for streaming
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="Inventory_Report.xlsx"'
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: res,
    useStyles: true,
  });
  const worksheet = workbook.addWorksheet("Inventory Report");

  worksheet.mergeCells("A1:G1");
  worksheet.getCell("A1").value = `Inventory Report (${
    value.institute
  }) ${beautifyDate(value.from_date)} - ${beautifyDate(value.to_date)}`;
  worksheet.getCell("A1").font = {
    size: 20,
    bold: true,
    color: { argb: "000000" },
  };
  worksheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF00" },
  };
  worksheet.getRow(1).height = 30;
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.addRow([
    "SR NUMBER",
    "DATE",
    "ITEM NAME",
    "MINIMUM STOCK",
    "OPENING STOCK",
    "CLOSING STOCK",
    "SUPPLIER",
  ]);

  // Row styling (header row)
  worksheet.getRow(2).eachCell((cell) => {
    cell.style = {
      font: {
        bold: true,
        size: 12,
        color: { argb: "000000" },
      },
      alignment: { horizontal: "center", vertical: "middle" },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F4A460" },
      },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      },
    };
  });

  const client = await pool.connect();
  const query = new QueryStream(
    `
	  SELECT
        row_number() OVER () AS sr_no,
        isi.purchase_date,
        iii.item_name,
        iii.minimum_quantity,
        iii.opening_stock,
        iii.closing_stock,
        v.vendor_name,
		    JSON_AGG(isi.*) AS added_stock_info,
        JSON_AGG(iic.*) AS consume_stock_info
      FROM inventory_item_info iii

      LEFT JOIN vendor v
      ON v.vendor_id = iii.vendor_id

      LEFT JOIN inventory_stock_info isi
      ON isi.item_id = iii.item_id

      LEFT JOIN inventory_item_consume iic
      ON iic.item_id = iii.item_id

      WHERE iii.institute = $1 AND isi.purchase_date BETWEEN $2 AND $3

      GROUP BY iii.item_id, v.vendor_name, isi.purchase_date
    `,
    [value.institute, value.from_date, value.to_date],
    {
      batchSize: 10,
    }
  );

  const pgStream = client.query(query);

  // Process PostgreSQL stream data and append to Excel sheet
  pgStream.on("data", (data) => {
    const excelRow = worksheet.addRow([
      data.sr_no,
      data.purchase_date,
      data.item_name,
      data.minimum_quantity,
      data.opening_stock,
      data.closing_stock,
      data.vendor_name,
    ]);

    // Style the data rows
    excelRow.eachCell((cell) => {
      cell.style = {
        font: { size: 11 },
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        },
      };
    });

    const addedStockRow = worksheet.addRow(["", "Added Stock Info"]);
    // worksheet.mergeCells(`B${headingRow1.number}:E${headingRow1.number}`);

    addedStockRow.eachCell((cell) => {
      cell.style = {
        font: { size: 11, bold: true },
      };
    });

    data.added_stock_info.forEach((item: any) => {
      const innerRow = worksheet.addRow([
        "",
        `Stock Added : ${item.stock}`,
        `Cost Per Unit : ${item.cost_per_unit}`,
        `Purchased At : ${beautifyDate(item.purchase_date)}`,
      ]);
      innerRow.eachCell((cell) => {
        cell.style = {
          font: { size: 11 },
        };
      });
    });

    const consumeStockRow = worksheet.addRow(["", "Consumed Stock Info"]);
    consumeStockRow.eachCell((cell) => {
      cell.style = {
        font: {
          size: 11,
          bold: true,
          // color: { argb: "D1001F" }
        },
      };
    });

    data.consume_stock_info.forEach((item: any) => {
      const innerRow = worksheet.addRow([
        "",
        `Stock Consumed : ${item.consume_stock}`,
        `Consumed Date : ${beautifyDate(item.consumed_date)}`,
        `Remark : ${item.remark}`,
      ]);
      innerRow.eachCell((cell) => {
        cell.style = {
          font: { size: 11 },
        };
      });
    });
  });

  pgStream.on("end", () => {
    workbook.commit();
    client.release(); // Release the client when done
  });

  pgStream.on("error", (err) => {
    client.release();
  });
});

export type TTimeTableParseData = {
  course_name: string;
  subjects: string[];
  faculty: {
    faculty_name: string;
    profile_image: string;
  }[];
};
export const stramTimeTableReport = asyncErrorHandler(async (req, res) => {
  const { error, value } = VTimeTableReport.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);

  // Set response headers for streaming
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="Time_Table_Report.xlsx"'
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: res,
    useStyles: true,
  });
  const worksheet = workbook.addWorksheet("Time Table Report");

  worksheet.mergeCells("A1:I1");
  worksheet.getCell("A1").value = `Time Table (${
    value.institute
  }) ${beautifyDate(value.from_date)} - ${beautifyDate(value.to_date)}`;
  worksheet.getCell("A1").font = {
    size: 20,
    bold: true,
    color: { argb: "000000" },
  };
  worksheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF00" },
  };
  worksheet.getRow(1).height = 30;
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.addRow([
    "COURSE NAME",
    // "09:30 AM - 10:30 AM",
    // "10:30 AM - 11:30 AM",
    // "11:45 AM - 12:45 PM",
    // "01:15 PM - 02:15 PM",
    // "02:15 PM - 03:15 PM",
    // "03:30 PM - 04:30 PM",
    // "04:30 PM - 05:30 PM",
    // "05:30 PM - 06:30 PM",
    ...TIME_PERIOD,
  ]);

  // Row styling (header row)
  worksheet.getRow(2).eachCell((cell) => {
    cell.style = {
      font: {
        bold: true,
        size: 12,
        color: { argb: "000000" },
      },
      alignment: { horizontal: "center", vertical: "middle" },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F4A460" },
      },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      },
    };
  });

  const client = await pool.connect();
  const query = new QueryStream(
    `
      SELECT
        *,
        TO_CHAR(date, 'YYYY-MM-DD') AS at_date
      FROM
        time_table
      WHERE 
          institute = $1 AND date BETWEEN $2 AND $3

      ORDER BY date DESC
    `,
    [value.institute, value.from_date, value.to_date],
    {
      batchSize: 10,
    }
  );

  const pgStream = client.query(query);

  // Process PostgreSQL stream data and append to Excel sheet
  pgStream.on("data", (data) => {
    const excelRow = worksheet.addRow([beautifyDate(data.date)]);

    const parseTimeTable = JSON.parse(
      data.time_table_data
    ) as TTimeTableParseData[];

    worksheet.mergeCells(`A${excelRow.number}:I${excelRow.number}`);

    parseTimeTable.forEach((item) => {
      const combineSubAndFac: string[] = [];
      item.subjects.forEach((subject, subIndex) => {
        combineSubAndFac.push(
          `${subject}\n${item.faculty[subIndex].faculty_name}`
        );
      });

      const innerRow = worksheet.addRow([
        item.course_name,
        ...combineSubAndFac,
      ]);

      innerRow.height = combineSubAndFac.length * 10;

      innerRow.eachCell((cell, colNumber) => {
        cell.style = {
          font: { size: 11, bold: colNumber === 1 },
          alignment: {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          },
          border: {
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            bottom: { style: "thin" },
          },
        };
      });
    });

    // Style the data rows
    excelRow.eachCell((cell) => {
      cell.style = {
        font: { size: 18, bold: true },
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        },
      };
    });
  });

  pgStream.on("end", () => {
    workbook.commit();
    client.release(); // Release the client when done
  });

  pgStream.on("error", (err) => {
    client.release();
  });
});

export const stramPhyLibBookReport = asyncErrorHandler(async (req, res) => {
  const { error } = bookListReportV.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);

  const { book_name, institute } = req.query;

  // Set response headers for streaming
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="Physical_Library_Book_Report.xlsx"'
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: res,
    useStyles: true,
  });
  const worksheet = workbook.addWorksheet("Physical Library Book Report");

  worksheet.mergeCells("A1:E1");
  worksheet.getCell("A1").value = `Physical Library Book Report (${institute})`;
  worksheet.getCell("A1").font = {
    size: 20,
    bold: true,
    color: { argb: "000000" },
  };
  worksheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF00" },
  };
  worksheet.getRow(1).height = 30;
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.addRow(["BOOKS NAME", "EDITION/VOL", "AUTHOR", "ROW NO.", "SHELF"]);

  // Row styling (header row)
  worksheet.getRow(2).eachCell((cell) => {
    cell.style = {
      font: {
        bold: true,
        size: 12,
        color: { argb: "000000" },
      },
      alignment: { horizontal: "center", vertical: "middle" },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F4A460" },
      },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      },
    };
  });

  let filter = "WHERE";
  const filterValues: any[] = [];
  let placeholdernum = 1;

  if (book_name) {
    filter += ` book_name ILIKE '%' || $${placeholdernum} || '%'`;
    filterValues.push(book_name);
    placeholdernum++;
  }

  if (institute) {
    if (filter === "WHERE") {
      filter += ` institute = $${placeholdernum}`;
    } else {
      filter += ` AND institute = $${placeholdernum}`;
    }
    placeholdernum++;
    filterValues.push(institute);
  }

  if (filter === "WHERE") {
    filter = "";
  }

  const client = await pool.connect();
  const query = new QueryStream(
    `
      SELECT book_name, edition, author, row_number, shelf FROM phy_lib_books
      ${filter}
      ORDER BY phy_lib_books DESC`,
    filterValues,
    {
      batchSize: 10,
    }
  );

  const pgStream = client.query(query);

  // Process PostgreSQL stream data and append to Excel sheet
  pgStream.on("data", (data) => {
    const excelRow = worksheet.addRow(Object.values(data));
    // Style the data rows
    excelRow.eachCell((cell) => {
      cell.style = {
        font: { size: 11 },
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        },
      };
    });
  });

  pgStream.on("end", () => {
    workbook.commit();
    client.release(); // Release the client when done
  });

  pgStream.on("error", (err) => {
    client.release();
  });
});

export const stramPhyLibBookIssueReport = asyncErrorHandler(
  async (req, res) => {
    const { institute, from_date, to_date, search_by, search_keyword } =
      req.query;

    // Set response headers for streaming
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Physical_Library_Book_Issue_Report.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: res,
      useStyles: true,
    });
    const worksheet = workbook.addWorksheet(
      "Physical Library Book Issue Report"
    );

    worksheet.mergeCells("A1:H1");
    worksheet.getCell("A1").value = `SEI Educational Trust, (${institute})`;
    worksheet.getCell("A1").font = {
      size: 20,
      bold: true,
      color: { argb: "000000" },
    };
    worksheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    worksheet.getRow(1).height = 30;
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.mergeCells("A2:H2");
    worksheet.getCell("A2").value = `Book Issue Details`;
    worksheet.getCell("A2").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.addRow([
      "S.No",
      "ISSUED TO",
      "INDOS NO.",
      "COURSE NAME",
      "BOOKS NAME",
      "EDITION/VOL",
      "ISSUE DATE",
      "RECEIVED DATE",
    ]);

    // Row styling (header row)
    worksheet.getRow(3).eachCell((cell) => {
      cell.style = {
        font: {
          bold: true,
          size: 12,
          color: { argb: "000000" },
        },
        alignment: { horizontal: "center", vertical: "middle" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F4A460" },
        },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        },
      };
    });

    let filter = "WHERE";
    const filterValues: string[] = [];
    let placeholdernum = 1;

    //these are for filtering -- START
    if (institute) {
      filter += ` plbi.institute = $${placeholdernum}`;
      placeholdernum++;
      filterValues.push(institute as string);
    }

    if (from_date && to_date) {
      const search_by =
        req.query.search_by === "received_date" ? "return_date" : "issue_date";

      if (filter === "WHERE") {
        filter += ` plbi.${search_by} BETWEEN $${placeholdernum}`;
        placeholdernum++;
        filter += ` AND $${placeholdernum}`;
      } else {
        filter += ` AND plbi.${search_by} BETWEEN $${placeholdernum}`;
        placeholdernum++;
        filter += ` AND $${placeholdernum}`;
      }
      placeholdernum++;
      filterValues.push(from_date as string);
      filterValues.push(to_date as string);
    }
    //these are for filtering -- END

    //these are for searching -- START
    if (
      search_by &&
      search_keyword &&
      search_by === "indos_number" &&
      institute
    ) {
      placeholdernum = 1;
      filterValues.length = 0;
      filter = `WHERE s.indos_number = $${placeholdernum} AND plbi.institute = $${
        placeholdernum + 1
      }`;
      filterValues.push(search_keyword as string);
      filterValues.push(institute as string);
    }

    if (
      search_by &&
      search_keyword &&
      search_by === "course_name" &&
      institute
    ) {
      placeholdernum = 1;
      filterValues.length = 0;
      filter = `WHERE c.course_name ILIKE '%' || $${placeholdernum} || '%' AND plbi.institute = $${
        placeholdernum + 1
      }`;
      filterValues.push(search_keyword as string);
      filterValues.push(institute as string);
    }

    if (
      search_by &&
      search_keyword &&
      search_by === "student_name" &&
      institute
    ) {
      placeholdernum = 1;
      filterValues.length = 0;
      filter = `WHERE s.name ILIKE '%' || $${placeholdernum} || '%' AND plbi.institute = $${
        placeholdernum + 1
      }`;
      filterValues.push(search_keyword as string);
      filterValues.push(institute as string);
    }

    if (
      search_by &&
      search_keyword &&
      search_by === "faculty_name" &&
      institute
    ) {
      placeholdernum = 1;
      filterValues.length = 0;
      filter = `WHERE e.name ILIKE '%' || $${placeholdernum} || '%' AND plbi.institute = $${
        placeholdernum + 1
      }`;
      filterValues.push(search_keyword as string);
      filterValues.push(institute as string);
    }

    if (search_by && search_keyword && search_by === "book_name" && institute) {
      placeholdernum = 1;
      filterValues.length = 0;
      filter = `WHERE plb.book_name ILIKE '%' || $${placeholdernum} || '%' AND plbi.institute = $${
        placeholdernum + 1
      }`;
      filterValues.push(search_keyword as string);
      filterValues.push(institute as string);
    }
    //these are for searching -- END

    if (filter === "WHERE") filter = "";

    const client = await pool.connect();
    const query = new QueryStream(
      `
        SELECT
         row_number() OVER () AS sr_no,
          COALESCE(s.name, e.name) AS student_name,
          s.indos_number,
          c.course_name,
          plb.book_name,
          plb.edition,
          plbi.issue_date,
          plbi.return_date
        FROM phy_lib_book_issue plbi

        LEFT JOIN students s
        ON s.student_id = plbi.student_id

        LEFT JOIN courses c
        ON c.course_id = plbi.course_id

        LEFT JOIN employee e
        ON e.id = plbi.employee_id

        LEFT JOIN phy_lib_books plb
        ON plb.phy_lib_book_id = plbi.phy_lib_book_id

        ${filter}
        `,
      filterValues,
      {
        batchSize: 10,
      }
    );

    const pgStream = client.query(query);

    // Process PostgreSQL stream data and append to Excel sheet
    pgStream.on("data", (data) => {
      const excelRow = worksheet.addRow(Object.values(data));
      // Style the data rows
      excelRow.eachCell((cell) => {
        cell.style = {
          font: { size: 11 },
          alignment: { horizontal: "center" },
          border: {
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            bottom: { style: "thin" },
          },
        };
      });
    });

    pgStream.on("end", () => {
      workbook.commit();
      client.release(); // Release the client when done
    });

    pgStream.on("error", (err) => {
      client.release();
    });
  }
);

export const streamPmsExcelReport = asyncErrorHandler(async (req, res) => {
  const { error, value } = pmsReportV.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);

  // Set response headers for streaming
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="PMS_Report.xlsx"'
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: res,
    useStyles: true,
  });
  const worksheet = workbook.addWorksheet("Pms Report");

  worksheet.mergeCells("A1:G1");
  worksheet.getCell("A1").value = `PMS Report (${value.institute})`;
  worksheet.getCell("A1").font = {
    size: 20,
    bold: true,
    color: { argb: "000000" },
  };
  worksheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF00" },
  };
  worksheet.getRow(1).height = 30;
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.addRow([
    "SR NUMBER",
    "ITEM NAME",
    "CHECKS / MAINTENANCE REQUIRED",
    "FREQUENCY",
    "LAST DONE DATE",
    "NEXT DUE DATE",
    "REMARK",
  ]);

  // Row styling (header row)
  worksheet.getRow(2).eachCell((cell) => {
    cell.style = {
      font: {
        bold: true,
        size: 12,
        color: { argb: "000000" },
      },
      alignment: { horizontal: "center", vertical: "middle" },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F4A460" },
      },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      },
    };
  });

  const client = await pool.connect();
  const query = new QueryStream(
    `
    SELECT
      row_number() OVER () AS sr_no,
      COALESCE(iii.item_name, pms.custom_item) as item_name,
      ph.*
    FROM planned_maintenance_system pms

    LEFT JOIN inventory_item_info iii
    ON iii.item_id = pms.item_id

    INNER JOIN pms_history ph
    ON ph.planned_maintenance_system_id = pms.planned_maintenance_system_id

    WHERE ph.${value.filter_by} BETWEEN $1 AND $2 AND pms.institute = $3
    `,
    [value.from_date, value.to_date, value.institute],
    {
      batchSize: 10,
    }
  );

  const pgStream = client.query(query);

  worksheet.getColumn(3).width = 20

  // Process PostgreSQL stream data and append to Excel sheet
  pgStream.on("data", (data) => {
    const excelRow = worksheet.addRow([
      data.sr_no,
      data.item_name,
      data.description,
      data.frequency,
      beautifyDate(data.last_done),
      beautifyDate(data.next_due),
      data.remark,
    ]);

    // Style the data rows
    excelRow.eachCell((cell) => {
      cell.style = {
        font: { size: 11 },
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        },
      };

    
    });
  });

  pgStream.on("end", () => {
    workbook.commit();
    client.release(); // Release the client when done
  });

  pgStream.on("error", (err) => {
    client.release();
  });
});

export const streamEmployeeReport = asyncErrorHandler(async (req, res) => {
  const institute = req.query.institute;
  const employee_type = req.query.employee_type || "Employee And Faculty";

  const { filterQuery, filterValues } = filterToSql(req.query, "e");

  // Set response headers for streaming
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="Employee_Dashboard.xlsx"`
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: res,
    useStyles: true,
  });
  const worksheet = workbook.addWorksheet(`${employee_type} Dashboard`);

  worksheet.mergeCells("A1:AS1");
  worksheet.getCell("A1").value = `${employee_type} Dashboard Report (${
    institute || "ALL"
  })`;
  worksheet.getCell("A1").font = {
    size: 20,
    bold: true,
    color: { argb: "000000" },
  };
  worksheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF00" },
  };
  worksheet.getRow(1).height = 30;
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.addRow([
    "SR NUMBER",
    "EMPLOYEE NAME",
    "EMPLOYEE ID",
    "JOINING DATE",
    "DEPARTMENT",
    "FIN NUMBER",
    "INDOS NUMBER",
    "CDC NUMBER",
    "GRADE",
    "QUALIFICATION",
    "ADDITIONAL QUALIFICATION",
    "SAILING EXPERIENCE",
    "TEACHING EXPERIENCE",
    "CONTACT NUMBER",
    "EMAIL ADDRESS",
    "LIVING ADDRESS",
    "DOB",
    "GENDER",
    "MARITAL STATUS",
    "BANK NAME",
    "BANK ACCOUNT NUMBER",
    "ACCOUNT HOLDER NAME",
    "IFSC CODE",
    "BASIC SALARY",
    "HRA",
    "OTHER ALLOWANCES",
    "PROVIDENT FUND",
    "PROFESSIONAL TAX",
    "ESIC",
    "INCOME TAX",
    "IS ACTIVE",
    "MAX TEACHING HOURS / WEEK",
    "INSTITUTE",
    "EMPLOYEE TYPE",
    "DESIGNATION",
    "PERMANENT ADDRESS",
    "EMERGENCY CONTACT NUMBER",
    "CONTACT PERSON NAME",
    "CONTACT PERSON RELATION",
    "PAYSCALE",
    "PAYSCALE YEAR",
    "NEXT TO KIN",
    "RELATION TO SELF",
    "FACULTY CURRENT WORKING HOURS",
    "AUTHORITY",
  ]);

  // Row styling (header row)
  worksheet.getRow(2).eachCell((cell) => {
    cell.style = {
      font: {
        bold: true,
        size: 12,
        color: { argb: "000000" },
      },
      alignment: { horizontal: "center", vertical: "middle" },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F4A460" },
      },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      },
    };
  });

  const client = await pool.connect();
  const query = new QueryStream(
    `
    SELECT
      row_number() OVER () AS sr_no,
      e.name,
      e.login_email,
      e.joining_date,
      d.name as department_name,
      e.fin_number,
      e.indos_number,
      e.cdc_number,
      e.grade,
      e.qualification,
      e.additional_qualification,
      e.selling_experience,
      e.teaching_experience,
      e.contact_number,
      e.email_address,
      e.living_address,
      e.dob,
      e.gender,
      e.marital_status,
      e.bank_name,
      e.bank_account_no,
      e.account_holder_name,
      e.ifsc_code,
      e.basic_salary,
      e.hra,
      e.other_allowances,
      e.provident_fund,
      e.professional_tax,
      e.esic,
      e.income_tax,
      e.is_active,
      e.max_teaching_hrs_per_week,
      e.institute,
      e.employee_type,
      e.designation,
      e.permanent_address,
      e.emergency_contact_number,
      e.contact_person_name,
      e.contact_person_relation,
      e.payscale_label,
      e.payscale_year,
      e.next_to_kin,
      e.relation_to_self,
      e.faculty_current_working_hours,
      e.authority
    FROM employee e

    LEFT JOIN department d ON e.department_id = d.id

    ${filterQuery}
    `,
    filterValues,
    {
      batchSize: 10,
    }
  );

  const pgStream = client.query(query);

  // Process PostgreSQL stream data and append to Excel sheet
  pgStream.on("data", (data) => {
    const excelRow = worksheet.addRow(Object.values(data));
    // Style the data rows
    excelRow.eachCell((cell) => {
      cell.style = {
        font: { size: 11 },
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        },
      };
    });
  });

  pgStream.on("end", () => {
    workbook.commit();
    client.release(); // Release the client when done
  });

  pgStream.on("error", (err) => {
    client.release();
  });
});

export const streamAttendanceExcelReport = asyncErrorHandler(
  async (req, res) => {
    // Set response headers for streaming
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Attendance_Report.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: res,
      useStyles: true,
    });
    const worksheet = workbook.addWorksheet("Attendance Report");

    const rows = await generateEmployeeAttendance(req);

    worksheet.mergeCells("A1:AD1");
    worksheet.getCell("A1").value = `Attendance Report`;
    worksheet.getCell("A1").font = {
      size: 20,
      bold: true,
      color: { argb: "000000" },
    };
    worksheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    worksheet.getRow(1).height = 30;
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.addRow([
      "SR NUMBER",
      "ITEM NAME",
      "CHECKS / MAINTENANCE REQUIRED",
      "FREQUENCY",
      "LAST DONE DATE",
      "NEXT DUE DATE",
      "REMARK",
    ]);

    // Row styling (header row)
    worksheet.getRow(2).eachCell((cell) => {
      cell.style = {
        font: {
          bold: true,
          size: 12,
          color: { argb: "000000" },
        },
        alignment: { horizontal: "center", vertical: "middle" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F4A460" },
        },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        },
      };
    });

    const client = await pool.connect();
    const query = new QueryStream(
      `
    SELECT
      row_number() OVER () AS sr_no,
      COALESCE(iii.item_name, pms.custom_item) as item_name,
      ph.*
    FROM planned_maintenance_system pms

    LEFT JOIN inventory_item_info iii
    ON iii.item_id = pms.item_id

    INNER JOIN pms_history ph
    ON ph.planned_maintenance_system_id = pms.planned_maintenance_system_id

    WHERE ph.last_done BETWEEN $1 AND $2 AND pms.institute = $3
    `,
      [],
      {
        batchSize: 10,
      }
    );

    const pgStream = client.query(query);

    // Process PostgreSQL stream data and append to Excel sheet
    pgStream.on("data", (data) => {
      const excelRow = worksheet.addRow([
        data.sr_no,
        data.item_name,
        data.description,
        data.frequency,
        beautifyDate(data.last_done),
        beautifyDate(data.next_due),
        data.remark,
      ]);
      // Style the data rows
      excelRow.eachCell((cell) => {
        cell.style = {
          font: { size: 11 },
          alignment: { horizontal: "center" },
          border: {
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            bottom: { style: "thin" },
          },
        };
      });
    });

    pgStream.on("end", () => {
      workbook.commit();
      client.release(); // Release the client when done
    });

    pgStream.on("error", (err) => {
      client.release();
    });
  }
);

export const streamNewInventoryReport = asyncErrorHandler(async (req, res) => {

  const { institute, category } = req.query;

  // Set response headers for streaming
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="Inventory_Report.xlsx"'
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: res,
    useStyles: true,
  });
  const worksheet = workbook.addWorksheet("Inventory Report");

  worksheet.mergeCells("A1:R1");
  worksheet.getCell("A1").value = `Inventory Report (${institute || "All"})`;
  worksheet.getCell("A1").font = {
    size: 20,
    bold: true,
    color: { argb: "000000" },
  };
  worksheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFF00" },
  };
  worksheet.getRow(1).height = 30;
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.addRow([
    "SR NUMBER",
    "Category",
    "Sub Category 1",
    "Name of Item",
    "Description",
    "WHERE TO BE USED",
    "Used By",
    "Opening Stock",
    "Minimum Quantity to maintain",
    "Item Consumed",
    "Closing Stock",
    "Status",
    "Last Purchased Date",
    "Supplier",
    "Cost per Unit (Current Cost)",
    "Cost per Unit (Previous Cost)",
    "Total Value",
    "Remarks"
  ]);

  // Row styling (header row)
  worksheet.getRow(2).eachCell((cell) => {
    cell.style = {
      font: {
        bold: true,
        size: 12,
        color: { argb: "000000" },
      },
      alignment: { horizontal: "center", vertical: "middle" },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F4A460" },
      },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      },
    };
  });

  let filter = "WHERE";
  const filter_values : string[] = [];
  let paramsNum = 1;

  if(institute) {
    filter += ` iii.institute = $${paramsNum}`;
    filter_values.push(institute as string);
    paramsNum++;
  }

  if(category) {
    if(filter === "WHERE") {
      filter += ` iii.category = $${paramsNum}`;
    } else {
      filter += ` AND iii.category = $${paramsNum}`;
    }
    filter_values.push(category as string)
    paramsNum++;
  }

  if(filter === "WHERE") {
    filter = "";
  }

  const client = await pool.connect();
  const query = new QueryStream(
    `
    SELECT
      row_number() OVER () AS sr_no,
      iii.category,
      iii.sub_category,
      iii.item_name,
      iii.description,
      iii.where_to_use,
      iii.used_by,
      iii.opening_stock,
      iii.minimum_quantity,
      iii.item_consumed,
      iii.closing_stock,
      iii.current_status,
      iii.current_purchase_date,
      v.vendor_name,
      iii.cost_per_unit_current,
      iii.cost_per_unit_previous,
      iii.total_value,
      (SELECT remark FROM inventory_stock_info WHERE item_id = iii.item_id ORDER BY purchase_date DESC LIMIT 1)
    FROM inventory_item_info iii

    LEFT JOIN vendor v
    ON v.vendor_id = iii.vendor_id

    ${filter}

    `,
    filter_values,
    {
      batchSize: 10,
    }
  );

  const pgStream = client.query(query);

  // Process PostgreSQL stream data and append to Excel sheet
  pgStream.on("data", (data) => {
    const valueArr = Object.values(data);
    valueArr[1] = inventoryCatList.find(item => item.category_id === data.category)?.category_name;
    valueArr[2] = inventorySubCatList.find(item => item.sub_category_id === data.category)?.sub_category_name;
    const excelRow = worksheet.addRow(valueArr);

    // Style the data rows
    excelRow.eachCell((cell) => {
      cell.style = {
        font: { size: 11 },
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        },
      };
    });
  });

  pgStream.on("end", () => {
    workbook.commit();
    client.release(); // Release the client when done
  });

  pgStream.on("error", (err) => {
    client.release();
  });
});
