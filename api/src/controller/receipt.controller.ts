import { pool } from "../config/db";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { beautifyDate } from "../utils/beautifyDate";
import { ErrorHandler } from "../utils/ErrorHandler";
import { sendEmail } from "../utils/sendEmail";
import {
  admissionReceiptValidator,
  paymentReciptValidator,
} from "../validator/receipt.validator";

export const paymentReceipt = asyncErrorHandler(async (req, res) => {
  const { error, value } = paymentReciptValidator.validate(
    req.method === "GET" ? req.query : req.body
  );
  if (error) throw new ErrorHandler(400, error.message);

  const { rows } = await pool.query(
    `
    SELECT
      s.name AS student_name,
      s.indos_number,
      s.email,
      s.mobile_number,
      cb.start_date,
      c.course_code,
      c.institute,
      cb.batch_id,
      cb.batch_fee,
      p.paid_amount,
      p.payment_id,
      p.remark,
      p.created_at as payment_date,
      p.receipt_no as receipt_no,
      p.payment_type,
      p.misc_payment,
      p.misc_remark,
      p.discount_amount
    FROM payments p

    LEFT JOIN students s
    ON s.student_id = p.student_id

    LEFT JOIN course_batches cb
    ON cb.batch_id = p.batch_id

    LEFT JOIN courses c
    ON c.course_id = cb.course_id

    WHERE p.form_id = $1 AND p.student_id = $2

    ORDER BY p.created_at ASC
    `,
    [value.form_id, value.student_id]
  );

  const objectToSend = {
    receipt_no: "",
    payment_date: "",
    institute: "",
    student_name: "",
    indos_number: "",
    mobile_number: "",
    email: "",
    batch_dates: "",
    course_codes: "",
    payment_type: "",

    admission_fee: 0.0,
    misc_payment: 0.0,

    misc_remark: "",
    payment_remark: "",

    course_fee: 0.0,
    discount: 0.0,

    total_paid_till_now: 0.0,
    total_course_fee_paid_till_now: 0.0,
    total_misc_payment: 0.0,

    due_amount: 0.0,
    total: 0.0,
  };

  let current_payment_id = -1;
  for (const row of rows) {
    if (current_payment_id !== -1 && current_payment_id !== row.payment_id) {
      break;
    }

    objectToSend.institute = row.institute;
    objectToSend.student_name = row.student_name;
    objectToSend.indos_number = row.indos_number;
    objectToSend.mobile_number = row.mobile_number;
    objectToSend.email = row.email;

    objectToSend.total_misc_payment += parseFloat(row.misc_payment);
    objectToSend.discount += parseFloat(row.discount_amount);

    objectToSend.total_paid_till_now += parseFloat(row.paid_amount);
    objectToSend.total_paid_till_now += parseFloat(row.misc_payment);

    objectToSend.total_course_fee_paid_till_now += parseFloat(row.paid_amount);

    if (row.payment_id === value.payment_id) {
      current_payment_id = row.payment_id;
      objectToSend.receipt_no = row.receipt_no;
      objectToSend.payment_date = beautifyDate(row.payment_date);

      objectToSend.batch_dates += beautifyDate(row.start_date) + ", ";
      objectToSend.course_codes += row.course_code + ", ";

      objectToSend.payment_type = row.payment_type;
      objectToSend.admission_fee += parseFloat(row.paid_amount);
      objectToSend.misc_payment += parseFloat(row.misc_payment);
      objectToSend.course_fee += row.batch_fee;

      objectToSend.payment_remark = row.remark;
      objectToSend.misc_remark = row.misc_remark;

      objectToSend.total +=
        parseFloat(row.paid_amount) + parseFloat(row.misc_payment);
    }
  }

  const dueCalcluction =
    objectToSend.course_fee -
    objectToSend.discount -
    objectToSend.total_course_fee_paid_till_now;
  if (dueCalcluction < 0) {
    objectToSend.due_amount = 0.0;
  } else {
    objectToSend.due_amount = dueCalcluction;
  }

  objectToSend.course_fee -= objectToSend.discount;

  if (req.method === "GET") {
    res.render("payment_recipt", objectToSend);
  } else {
    await sendEmail(rows[0].email, "SEND_PAYMENT_RECEIPT", objectToSend);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Payment receipt has been sent to the student's email."
        )
      );
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
