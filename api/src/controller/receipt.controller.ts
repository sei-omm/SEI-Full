import { pool } from "../config/db";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { beautifyDate } from "../utils/beautifyDate";
import { ErrorHandler } from "../utils/ErrorHandler";
import { transaction } from "../utils/transaction";
import {
  admissionReceiptValidator,
  paymentReciptValidator,
} from "../validator/receipt.validator";

// export const getPaymentReceipt = asyncErrorHandler(async (req, res) => {
//   const { error, value } = paymentReciptValidator.validate(req.query);
//   if (error) throw new ErrorHandler(400, error.message);

//   const [studentsInfo, courseInfo] = await transaction([
//     {
//       sql: `
//       SELECT name AS student_name, indos_number, mobile_number, email FROM students WHERE student_id = $1
//       `,
//       values: [value.student_id],
//     },

//     {
//       sql: `
//       SELECT
//       p.payment_id,
//       cb.batch_id,
//       cb.start_date,
//       c.course_code,
//       c.course_name,
//       c.institute,
//       cb.batch_fee,
//       p.paid_amount,
//       p.remark,
//       p.misc_payment,
//       p.discount_amount,
//       p.created_at,
//       p.receipt_no,
//       p.payment_type
//       FROM payments AS p

//       LEFT JOIN course_batches AS cb
//       ON cb.batch_id = p.batch_id

//       LEFT JOIN courses AS c
//       ON c.course_id = cb.course_id

//       WHERE p.student_id = $1 AND p.form_id = $2
//       `,
//       values: [value.student_id, value.form_id],
//     },
//   ]);

//   if (studentsInfo.rowCount === 0) {
//     throw new ErrorHandler(404, "Student not found");
//   }

//   if (courseInfo.rowCount === 0) throw new ErrorHandler(404, "invalid Form id");

//   const courseInfoObj = {
//     course_fee: 0,
//     total_paid_till_now: 0,
//     misc_fee: 0,
//     due_amount: 0,
//     discount: 0,
//     course_codes: "",
//     batch_dates: "",

//     admission_fee: 0,
//     payment_remark: "",
//     misc_payment: 0,
//     payment_date: "",
//     institute: courseInfo.rows[0].institute,
//     payment_type: "",
//     receipt_no: "",
//   };
//   const avilablePaymentIds = new Map<string, boolean>();
//   const avilableBatchIds = new Map<number, boolean>();
//   courseInfo.rows.forEach((row: any) => {
//     courseInfoObj.total_paid_till_now += parseFloat(row.paid_amount);
//     courseInfoObj.discount += parseFloat(row.discount_amount);

//     if (!avilablePaymentIds.has(row.payment_id)) {
//       courseInfoObj.misc_fee = row.misc_payment;
//       avilablePaymentIds.set(row.payment_id, true);
//     }

//     if (!avilableBatchIds.has(row.batch_id)) {
//       courseInfoObj.course_codes += row.course_code + ", ";
//       courseInfoObj.batch_dates += beautifyDate(row.start_date) + ", ";
//       courseInfoObj.course_fee += row.batch_fee;

//       avilableBatchIds.set(row.batch_id, true);
//     }

//     if (value.payment_id === row.payment_id) {
//       courseInfoObj.admission_fee += parseFloat(row.paid_amount);
//       courseInfoObj.payment_remark = row.remark;
//       courseInfoObj.misc_payment += parseFloat(row.misc_payment);
//       courseInfoObj.payment_date = beautifyDate(row.created_at);
//       courseInfoObj.payment_type = row.payment_type;
//       courseInfoObj.receipt_no = row.receipt_no;
//     }
//   });

//   courseInfoObj.due_amount =
//     courseInfoObj.course_fee - courseInfoObj.total_paid_till_now;

//   res.render("payment_recipt", {
//     student_name: studentsInfo.rows[0].student_name,
//     indos_number: studentsInfo.rows[0].indos_number,
//     mobile_number: studentsInfo.rows[0].mobile_number,
//     email: studentsInfo.rows[0].email,

//     ...courseInfoObj,
//   });
// });

export const getPaymentReceipt = asyncErrorHandler(async (req, res) => {
  const { error, value } = paymentReciptValidator.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: extraInfo } = await client.query(
      `
      SELECT
        s.name AS student_name,
        s.indos_number,
        s.email,
        s.mobile_number,
        STRING_AGG(TO_CHAR(cb.start_date, 'DD Mon YYYY')::TEXT, ', ') as batch_dates,
        STRING_AGG(c.course_code, ', ') as course_codes,
        STRING_AGG(DISTINCT c.institute, ', ') as institute,
        SUM(p.paid_amount) as admission_fee,
        STRING_AGG(DISTINCT p.remark, ', ') as payment_remark,
        STRING_AGG(cb.batch_id::TEXT, ', ') as batch_ids,
        STRING_AGG(DISTINCT p.created_at::TEXT, ', ') as payment_date,
        STRING_AGG(DISTINCT p.receipt_no::TEXT, ', ') as receipt_no,
        STRING_AGG(DISTINCT p.payment_type, ', ') as payment_type,
        SUM(p.misc_payment) AS misc_payment,
        STRING_AGG(DISTINCT p.misc_remark, ', ') as misc_remark
      FROM payments p

      LEFT JOIN students s
      ON s.student_id = p.student_id

      LEFT JOIN course_batches cb
      ON cb.batch_id = p.batch_id

      LEFT JOIN courses c
      ON c.course_id = cb.course_id

      WHERE p.form_id = $1 AND p.student_id = $2 AND p.payment_id = $3

      GROUP BY s.name, s.indos_number, s.email, s.mobile_number
      `,
      [value.form_id, value.student_id, value.payment_id]
    );

    const { rows: totalFeesInfo } = await client.query(
      `
      SELECT
        SUM(cb.batch_fee) as course_fee
      FROM course_batches cb

      WHERE cb.batch_id IN (SELECT batch_id FROM enrolled_batches_courses WHERE form_id = $1)
      `,
      [value.form_id]
    );

    const onePaymentDate = extraInfo[0].payment_date.split(",")[0].trim();

    const { rows: totalPaidTillNowInfo } = await client.query(
      `
      SELECT 
        SUM(paid_amount) as total_paid_till_now 
      FROM payments WHERE form_id = $1 AND created_at <= $2::TIMESTAMP
      `,
      [value.form_id, onePaymentDate]
    );

    const { rows: discountInfo } = await client.query(
      `
      SELECT
        SUM(p.discount_amount) AS total_discount
      FROM payments p
      WHERE p.form_id = $1 AND p.student_id = $2 AND p.created_at <= $3::TIMESTAMP
      `,
      [value.form_id, value.student_id, onePaymentDate]
    );

    const course_fee =
      totalFeesInfo[0].course_fee - discountInfo[0].total_discount;
    const dueAmount = course_fee - totalPaidTillNowInfo[0].total_paid_till_now;

    res.render("payment_recipt", {
      receipt_no: extraInfo[0].receipt_no,
      payment_date: beautifyDate(onePaymentDate),
      institute: extraInfo[0].institute,
      student_name: extraInfo[0].student_name,
      indos_number: extraInfo[0].indos_number,
      mobile_number: extraInfo[0].mobile_number,
      email: extraInfo[0].email,
      batch_dates: extraInfo[0].batch_dates,
      course_codes: extraInfo[0].course_codes,
      payment_type: extraInfo[0].payment_type,
      admission_fee: extraInfo[0].admission_fee,
      misc_payment: extraInfo[0].misc_payment,
      misc_remark : extraInfo[0].misc_remark,
      payment_remark: extraInfo[0].payment_remark,

      course_fee: course_fee.toFixed(2),
      discount: parseFloat(discountInfo[0].total_discount).toFixed(2),
      total_paid_till_now: parseFloat(
        totalPaidTillNowInfo[0].total_paid_till_now
      ).toFixed(2),
      due_amount: dueAmount < 0 ? 0.0 : dueAmount.toFixed(2),
      total: (
        parseFloat(extraInfo[0].admission_fee) +
        parseFloat(extraInfo[0].misc_payment)
      ).toFixed(2),
    });

    await client.query("COMMIT");
    client.release();
  } catch (error: any) {
    await client.query("ROLLBACK");
    client.release();
    throw new ErrorHandler(400, error.message);
  }
});

export const getAdmissionFormReceipt = asyncErrorHandler(async (req, res) => {
  const { error, value } = admissionReceiptValidator.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);

  const { rows } = await pool.query(
    `
      SELECT
          s.*,
          '********' AS password,
          ff.form_status,
          ff.form_id,
          STRING_AGG(c.course_name, ', ') AS enrolled_courses

      FROM fillup_forms AS ff
      LEFT JOIN students AS s
          ON s.student_id = ff.student_id
      LEFT JOIN enrolled_batches_courses AS ebc
          ON ebc.form_id = ff.form_id
      LEFT JOIN courses AS c
          ON c.course_id = ebc.course_id

      WHERE ff.form_id = $1
      GROUP BY s.student_id, ff.form_status, ff.form_id
  `,
    [value.form_id]
  );

  // console.log(rows)

  res.render("admission_form_recipt", {
    ...rows[0],
    dob: beautifyDate(rows[0].dob),
  });
  // res.status(200).json(new ApiResponse(200, "", rows));
});
