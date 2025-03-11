import { pool } from "../config/db";
import { TEnrollCourseData } from "../types";
import { ErrorHandler } from "../utils/ErrorHandler";
import { sqlPlaceholderCreator } from "../utils/sql/sqlPlaceholderCreator";
import { verifyToken } from "../utils/token";
import { tryCatch } from "../utils/tryCatch";
import { fetchAnOrderInfo } from "./razorpay.service";


export const verifyPayment = async (token: string, payment_id?: string) => {
  const { data: jwtData, error: jwtError } =
    await verifyToken<TEnrollCourseData>(token);
  if (jwtError || !jwtData)
    throw new ErrorHandler(400, "Invalid Token Please Contact Us");

  const date = new Date();

  //get order details form request
  const orderId = jwtData.order_id;
  const batchIds = jwtData.batch_ids.split(",") as string[];
  const courseIds = jwtData.course_ids.split(",") as string[];
  const isInWaitingListArray = jwtData.is_in_waiting_list.split(
    ","
  ) as string[];
  const institutes = jwtData.institutes.split(",") as string[];
  const razorpayPaymentId = payment_id;

  // const institutes = value.institutes.toString().split(",") as string[]
  const studentId = jwtData.student_id;

  // verify the payment
  const { amount, status, id } = await fetchAnOrderInfo(orderId);
  const isPaymentSuccess = status === "paid";

  if (!isPaymentSuccess)
    throw new ErrorHandler(400, "Payment has not done yet");

  /*
      now after verification completed store some info to deffrent table in database
      ** We need to store multiple batches info
      1) fillup_forms //single row will created althoug if multiple course or batches enroll
      2) enrolled_batches_courses //multiple row will created if multiple batches or course enroll
      3) payments //multiple row will created if multiple batches or course enroll

      and also than increse the batch_reserved_seats + 1;
    */

  const rows_of_enrolled_batches: string[] = [];
  const payments_values: (string | number)[] = [];

  const client = await pool.connect();

  const { error: transactionError } = await tryCatch<
    { batch_id: number; start_date: string }[]
  >(async () => {
    await client.query("BEGIN");

    //get the batch_ids payment info form db for security
    const paramsSql = batchIds?.map((_, index) => `$${index + 1}`);
    const { rows: batchPriceInDb, rowCount } = await client.query(
      `SELECT
          course_id,
          batch_id,
          batch_fee AS total_price,
          CAST(batch_fee * (min_pay_percentage / 100.0) AS INT) AS minimum_to_pay
       FROM course_batches WHERE batch_id IN (${paramsSql})`,
      batchIds
    );

    if (rowCount === 0) throw new ErrorHandler(400, "No Batch Avilable");

    let totalPrice = 0;
    let totalMinToPay = 0;
    batchPriceInDb.forEach((item) => {
      totalPrice += parseInt(item.total_price);
      totalMinToPay += parseInt(item.minimum_to_pay);
    });

    const convartPaidAmount = parseInt(amount.toString()) / 100;

    // now verify the user paid amount and calcluted price are same or not
    if (convartPaidAmount != totalPrice && convartPaidAmount != totalMinToPay) {
      throw new ErrorHandler(400, "Your paid amount are not same");
    }

    const paymentType =
      convartPaidAmount === totalPrice ? "Full-Payment" : "Part-Payment";

    // store data to fillup_forms (single row will created althoug if multiple course or batches enroll)
    const customFormIdPrefix = `${
      institutes[0] === "Kolkata" ? "KOL" : "FDB"
    }/FORM/${date.getFullYear()}/`;
    const { rows } = await client.query(
      `
          INSERT INTO fillup_forms (form_id, student_id, form_status)
          VALUES ($1 || nextval('fillup_form_seq_id')::TEXT, $2, $3)
          RETURNING form_id
        `,
      [customFormIdPrefix, studentId, "Pending"]
    );

    // const paymentID = Date.now();

    const next_receipt_sr_number = await client.query(
      `SELECT nextval('receipt_no_seq') AS receipt_no`
    );

    const receiptNumber = `${
      institutes[0] === "Kolkata" ? "KOL" : "FDB"
    }/${date.getFullYear()}/${next_receipt_sr_number.rows[0].receipt_no}`;

    batchIds?.forEach((bId, index) => {
      const currentBatchPriceInfo = batchPriceInDb.find(
        (item) => item.batch_id == bId
      );
      if (!currentBatchPriceInfo) throw new ErrorHandler(400, "Batch Mismatch");

      rows_of_enrolled_batches.push(
        courseIds[index],
        bId,
        studentId,
        rows[0].form_id,
        orderId,
        isInWaitingListArray[index] == "true" ? "Pending" : "Pending" //old data was "Approve"
      );

      payments_values.push(
        studentId,
        paymentType === "Part-Payment"
          ? currentBatchPriceInfo.minimum_to_pay
          : currentBatchPriceInfo.total_price,
        razorpayPaymentId || id,
        "Online Payment Form Website",
        "Online",
        orderId,
        0,
        "",
        courseIds[index],
        rows[0].form_id,
        bId,
        paymentType,
        receiptNumber
      );
    });

    //store data to enrolled_batches_courses (multiple row will created if multiple batches or course enroll)
    await client.query(
      `INSERT INTO enrolled_batches_courses (course_id, batch_id, student_id, form_id, order_id, enrollment_status) 
         VALUES ${sqlPlaceholderCreator(6, batchIds.length).placeholder}`,
      rows_of_enrolled_batches
    );

    //store data to payments table multiple row will created if multiple batches or course enroll
    // payments_values[9] = rows[0].form_id;
    // await client.query(
    //   `
    //   INSERT INTO payments (student_id, paid_amount, payment_id, remark, mode, order_id, misc_payment, misc_remark, course_id, form_id, batch_id, payment_type, receipt_no)
    //   VALUES ${
    //     sqlPlaceholderCreator(13, batchIds.length, {
    //       placeHolderNumber: 13,
    //       value: " || nextval('receipt_no_seq')::TEXT",
    //     }).placeholder
    //   }
    //   `,
    //   payments_values
    // );

    await client.query(
      `
        INSERT INTO payments (student_id, paid_amount, payment_id, remark, mode, order_id, misc_payment, misc_remark, course_id, form_id, batch_id, payment_type, receipt_no)
        VALUES ${sqlPlaceholderCreator(13, batchIds.length).placeholder}
        `,
      payments_values
    );

    //increse the total batch_reserved_seats as +1 for every batches user enrolled
    const { rows: course_batch_info } = await client.query(
      `
        UPDATE course_batches
        SET batch_reserved_seats = batch_reserved_seats + 1
        WHERE batch_id IN (${batchIds?.map((_, index) => `$${index + 1}`)})
        RETURNING batch_id, start_date
        `,
      batchIds
    );

    await client.query("COMMIT");
    client.release();
    return course_batch_info;
  });

  if (transactionError !== null) {
    await client.query("ROLLBACK");
    client.release();
    throw transactionError;
  }
};

export const verifyDuePayment = async () => {};

export const verifyPaymentLinkPayment = async (
  token: string,
  payment_id?: string
) => {
  //verify token
  const { error, data } = await verifyToken<TEnrollCourseData>(token);
  if (error) throw new ErrorHandler(400, "Invalid Token");
  
  const date = new Date();

  if (!data) throw new ErrorHandler(400, "Failed To Verify Token");

  //fetch payment info form razorpay with order id (get form token data)
  const { amount, id, status } = await fetchAnOrderInfo(data.order_id);
  if (status != "paid")
    throw new ErrorHandler(400, "Payment has not been received yet");

  const convartPaidAmount = parseInt(amount.toString()) / 100;

  if (
    convartPaidAmount !== parseInt(data.total_price) &&
    convartPaidAmount !== data.minimum_to_pay
  ) {
    throw new ErrorHandler(400, "Payment Amount Mismatch. Contact us for help");
  }

  const batchIds = data.batch_ids.split(",");
  const courseIds = data.course_ids.split(",");
  const paymentType =
    convartPaidAmount === parseInt(data.total_price)
      ? "Full-Payment"
      : data.payment_type;

  const client = await pool.connect();

  const { error: tryError } = await tryCatch(async () => {
    const placeholders = batchIds.map((_, index) => `$${index + 1}`);
    const { rows } = await client.query(
      `
        SELECT 
          ebc.form_id,
          cb.batch_fee,
          CAST(cb.batch_fee * (cb.min_pay_percentage / 100.0) AS INT) AS minimum_to_pay,
          s.institute as student_institute
        FROM enrolled_batches_courses ebc

        LEFT JOIN course_batches cb
        ON cb.batch_id = ebc.batch_id

        LEFT JOIN students s
        ON s.student_id = $${batchIds.length + 1}

        WHERE ebc.batch_id IN (${placeholders}) AND ebc.student_id = $${
        batchIds.length + 1
      }
        `,
      [...batchIds, data.student_id]
    );

    const payments_values: (string | number)[] = [];

    const next_receipt_sr_number = await client.query(
      `SELECT nextval('receipt_no_seq') AS receipt_no`
    );

    const receiptNumber = `${
      rows[0].student_institute === "Kolkata" ? "KOL" : "FDB"
    }/${date.getFullYear()}/${next_receipt_sr_number.rows[0].receipt_no}`;

    batchIds.forEach((bId, index) => {
      payments_values.push(
        data.student_id,
        paymentType === "Part-Payment"
          ? rows[index].minimum_to_pay
          : rows[index].batch_fee,
        payment_id || id,
        "Paid With Payment Link",
        "Online",
        id,
        0,
        "", // misc remark
        courseIds[index],
        rows[index].form_id, //form id,
        bId,
        paymentType,
        receiptNumber
      );
    });

    await client.query(
      `
        INSERT INTO payments (student_id, paid_amount, payment_id, remark, mode, order_id, misc_payment, misc_remark, course_id, form_id, batch_id, payment_type, receipt_no)
        VALUES ${sqlPlaceholderCreator(13, batchIds.length).placeholder}
        `,
      payments_values
    );

    //increse the total batch_reserved_seats as +1 for every batches user enrolled
    const batchIdPlaceholders = batchIds?.map((_, index) => `$${index + 1}`);
    await client.query(
      `
        UPDATE course_batches
        SET batch_reserved_seats = batch_reserved_seats + 1
        WHERE batch_id IN (${batchIdPlaceholders})
              `,
      batchIds
    );

    //update order id to enrolled_batches_courses table -> add order_id
    await client.query(
      `
        UPDATE enrolled_batches_courses 
        SET order_id = $${batchIds.length + 1}
        WHERE batch_id IN (${batchIdPlaceholders}) AND student_id = $${
        batchIds.length + 2
      }
        `,
      [...batchIds, data.order_id, data.student_id]
    );

    await client.query("COMMIT");
    client.release();
  });

  if (tryError) {
    await client.query("ROLLBACK");
    client.release();
    throw new ErrorHandler(
      500,
      "During verification, we encountered an internal server error. Please contact us for assistance."
    );
  }
};
