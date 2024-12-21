import { pool } from "../config/db";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import QueryStream from "pg-query-stream";
import ExcelJS from "exceljs";
import {
  admissionReportValidator,
  courseTrendReportValidator,
  dgsIndosReportValidator,
  receiptReportValidator,
} from "../validator/report.validator";
import { ErrorHandler } from "../utils/ErrorHandler";

export const streamMaintenceRecordExcelReport = asyncErrorHandler(
  async (req, res) => {
    //filters if any
    let filterQuery = "WHERE";
    const filterValues: string[] = [];

    if (req.query.institute) {
      filterQuery += " mr.institute = $1";
      filterValues.push(req.query.institute as string);
    }

    if (req.query.from_date && req.query.to_date) {
      if (filterQuery === "WHERE") {
        filterQuery += " mr.created_at BETWEEN $1 AND $2";
      } else {
        filterQuery += " AND mr.created_at BETWEEN $2 AND $3";
      }

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
      iii.item_name,
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
      "Sr Number",
      "Batch Start Date",
      "Batch End Date",
      "Total Enrollment",
      "Total Approved Enrollment",
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
        WHERE c.course_id = $1 AND c.course_type = $2 AND c.institute = $3 AND cb.start_date = $4
        GROUP BY cb.batch_id
        ORDER BY cb.start_date DESC
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

  worksheet.mergeCells("A1:O1");
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
  worksheet.mergeCells("A2:O2");
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
    "Batch Fee",
    "Due Amount",
    "Total Paid",
    "Total Misc Payment",
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
      font: { bold: true, size: 14, color: { argb: cellNumber === 5 ? "FFFFFF" : "000000" } },
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
  const query = new QueryStream(
    `
       SELECT 
          row_number() OVER () AS sr_no,
          ebc.form_id,
          s.name,
          cb.batch_fee,
          (cb.batch_fee - SUM(p.paid_amount)) AS total_due,
          SUM(p.paid_amount) AS total_paid,
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
                      
        GROUP BY p.student_id, ebc.form_id, s.name, cb.batch_fee, ff.form_status, s.indos_number, s.mobile_number, s.email, ff.created_at, s.dob, cb.start_date
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
      cell.style = {
        font: {
          size: 12,
          bold: cellNumber === 5,
          color: { argb: cellNumber === 5 ? "DC2626" : "000000" },
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

  worksheet.mergeCells("A1:P1");
  worksheet.getCell("A1").value = `Receipt Report (${value.institute})`;
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

    worksheet.mergeCells("A1:L1");
    worksheet.getCell("A1").value = `Admission Report (${value.institute})`;
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
    const query = new QueryStream(
      `
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
        cell.style = {
          font: {
            size: 12,
            bold: cellNumber === 5,
            color: { argb: cellNumber === 5 ? "DC2626" : "000000" },
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