import { pool } from "../config/db";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { beautifyDate } from "../utils/beautifyDate";
import { ErrorHandler } from "../utils/ErrorHandler";
import { transaction } from "../utils/transaction";
import {
  admissionReceiptValidator,
  paymentReciptValidator,
} from "../validator/receipt.validator";

export const getPaymentReceipt = asyncErrorHandler(async (req, res) => {
  const { error, value } = paymentReciptValidator.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);

  const [studentsInfo, courseInfo] = await transaction([
    {
      sql: `
      SELECT name AS student_name, indos_number, mobile_number, email FROM students WHERE student_id = $1
      `,
      values: [value.student_id],
    },

    {
      sql: `
      SELECT
      p.payment_id,
      cb.batch_id,
      cb.start_date,
      c.course_code,
      c.course_name,
      c.institute,
      cb.batch_fee,
      p.paid_amount,
      p.remark,
      p.misc_payment,
      p.discount_amount,
      p.created_at,
      p.receipt_no,
      p.payment_type
      FROM payments AS p

      LEFT JOIN course_batches AS cb
      ON cb.batch_id = p.batch_id

      LEFT JOIN courses AS c
      ON c.course_id = cb.course_id

      WHERE p.student_id = $1 AND p.form_id = $2
      `,
      values: [value.student_id, value.form_id],
    },
  ]);

  if (studentsInfo.rowCount === 0) {
    throw new ErrorHandler(404, "Student not found");
  }

  if (courseInfo.rowCount === 0) throw new ErrorHandler(404, "invalid Form id");

  const courseInfoObj = {
    course_fee: 0,
    total_paid_till_now: 0,
    misc_fee: 0,
    due_amount: 0,
    discount: 0,
    course_codes: "",
    batch_dates: "",

    admission_fee: 0,
    payment_remark: "",
    misc_payment: 0,
    payment_date: "",
    institute: courseInfo.rows[0].institute,
    payment_type: "",
    receipt_no: "",
  };
  const avilablePaymentIds = new Map<string, boolean>();
  const avilableBatchIds = new Map<number, boolean>();
  courseInfo.rows.forEach((row: any) => {
    courseInfoObj.total_paid_till_now += parseFloat(row.paid_amount);
    courseInfoObj.discount += parseFloat(row.discount_amount);

    if (!avilablePaymentIds.has(row.payment_id)) {
      courseInfoObj.misc_fee = row.misc_payment;
      avilablePaymentIds.set(row.payment_id, true);
    }

    if (!avilableBatchIds.has(row.batch_id)) {
      courseInfoObj.course_codes += row.course_code + ", ";
      courseInfoObj.batch_dates += beautifyDate(row.start_date) + ", ";
      courseInfoObj.course_fee += row.batch_fee;

      avilableBatchIds.set(row.batch_id, true);
    }

    if (value.payment_id === row.payment_id) {
      courseInfoObj.admission_fee += parseFloat(row.paid_amount);
      courseInfoObj.payment_remark = row.remark;
      courseInfoObj.misc_payment += parseFloat(row.misc_payment);
      courseInfoObj.payment_date = beautifyDate(row.created_at);
      courseInfoObj.payment_type = row.payment_type;
      courseInfoObj.receipt_no = row.receipt_no;
    }
  });

  courseInfoObj.due_amount =
    courseInfoObj.course_fee - courseInfoObj.total_paid_till_now;

  res.render("payment_recipt", {
    student_name: studentsInfo.rows[0].student_name,
    indos_number: studentsInfo.rows[0].indos_number,
    mobile_number: studentsInfo.rows[0].mobile_number,
    email: studentsInfo.rows[0].email,

    ...courseInfoObj,
  });
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

  res.render("admission_form_recipt", {...rows[0], dob : beautifyDate(rows[0].dob)});
  // res.status(200).json(new ApiResponse(200, "", rows));
});
