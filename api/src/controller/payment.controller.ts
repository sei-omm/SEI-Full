import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import {
  addPaymentValidator,
  payDueAmountValidator,
  verifyDueOnlinePaymentValidator,
  verifyPaymentValidator,
} from "../validator/payment.validator";
import { ErrorHandler } from "../utils/ErrorHandler";
import { pool } from "../config/db";
import { createOrder, fetchAnOrderInfo } from "../service/razorpay.service";
import { ApiResponse } from "../utils/ApiResponse";
import { transaction } from "../utils/transaction";
import { objectToSqlInsert } from "../utils/objectToSql";
import { insertIntoSql } from "../utils/sql/insertIntoSql";
import { v4 as uuidv4 } from "uuid";
import { sqlPlaceholderCreator } from "../utils/sql/sqlPlaceholderCreator";
import { tryCatch } from "../utils/tryCatch";
import { distributeAmountEfficiently } from "../utils/distributeAmountEfficiently";

const date = new Date();

// export const verifyPayment = asyncErrorHandler(
//   async (req: Request, res: Response) => {
//     const { error } = verifyPaymentValidator.validate(req.query);
//     if (error) throw new ErrorHandler(400, error.message);

//     const orderId = req.query.order_id as string;
//     const courseID = req.query.course_id as string;
//     const studentId = res.locals.student_id;

//     const { amount, status } = await fetchAnOrderInfo(orderId);

//     const isPaymentSuccess = status === "paid";
//     if (!isPaymentSuccess)
//       throw new ErrorHandler(400, "Payment has not done yet");

//     const { rowCount, rows } = await pool.query(
//       `SELECT course_fee, min_pay_percentage FROM courses WHERE course_id = $1`,
//       [courseID]
//     );

//     if (rowCount === 0)
//       throw new ErrorHandler(400, "No Course Avilable With This Id");

//     const convartPaidAmount = parseInt(amount.toString()) / 100;

//     if (
//       (convartPaidAmount / rows[0].course_fee) * 100 !==
//       rows[0].min_pay_percentage
//     ) {
//       throw new ErrorHandler(
//         400,
//         "Your paid amount and minimum payment is mismatched"
//       );
//     }
//     //if payment successfull store the info to db

//     const { columns, params, values } = objectToSqlInsert({
//       student_id: studentId,
//       paid_amount: convartPaidAmount,
//       payment_id: Date.now(),
//       remark: "Student Enrolled From Official Website",
//       mode: "Online-Payment",
//       order_id: orderId,
//       misc_payment: 0,
//       payment_type : convartPaidAmount === rows[0].course_fee ? "Full Payment" : "Part Payment",
//       misc_remark: "",
//       course_id: courseID,
//     });

//     const sqlForPayment = `INSERT INTO payments ${columns} VALUES ${params}`;

//     const quantityToRemove = 1;
//     await transaction([
//       {
//         sql: `
//           INSERT INTO enrolled_batches_courses (course_id, student_id, order_id, form_id, form_status) VALUES ($1, $2, $3, $4, $5)
//           ON CONFLICT (student_id, course_id)
//           DO UPDATE SET student_id = EXCLUDED.student_id
//         `,
//         values: [courseID, studentId, orderId, `FORM-${Date.now()}`, "Pending"],
//       },

//       {
//         sql: `UPDATE courses SET remain_seats = remain_seats - $1 WHERE course_id = $2 AND remain_seats >= $1`,
//         values: [quantityToRemove, courseID],
//       },

//       {
//         sql: sqlForPayment,
//         values: values,
//       },
//     ]);

//     res
//       .status(201)
//       .json(new ApiResponse(201, "Payment & Course Enrollment Successful"));
//   }
// );

export const test = asyncErrorHandler(async (req: Request, res: Response) => {
  const courseIds = req.query.course_ids?.toString().split(",");
  const paramsSql = courseIds?.map((_, index) => `$${index + 1}`);

  let enrollCoursesColumns = "";
  let enrollCoursesInsertParams = "";
  let enrollCoursesInsertValues: string[] = [];
  [1, 2, 3].forEach((item) => {
    const { columns, params, values } = objectToSqlInsert({
      name: "Hello",

      text: "world",
    });
    enrollCoursesColumns = columns;
    enrollCoursesInsertParams += params;
    enrollCoursesInsertValues.push(values.flat() as any);
  });

  const { rows, rowCount } = await pool.query(
    `SELECT
        course_id,
        course_fee AS total_price,
        CAST(course_fee * (min_pay_percentage / 100.0) AS INT) AS minimum_to_pay
     FROM courses WHERE course_id IN (${paramsSql})`,
    courseIds
  );

  let totalPrice = 0;
  let totalMinToPay = 0;
  rows.forEach((item) => {
    totalPrice += parseInt(item.total_price);
    totalMinToPay += parseInt(item.minimum_to_pay);
  });

  const { query, values } = insertIntoSql({
    tableName: "course",
    columns: ["Col 1", "Col 2"],
    rows: [
      ["Val 1", "Val 2"],
      ["Val 3", "Val 4"],
    ],
  });
  res.status(200).json(new ApiResponse(200, "", { query, values }));
});

// export const verifyPayment = asyncErrorHandler(
//   async (req: Request, res: Response) => {
//     const { error } = verifyPaymentValidator.validate(req.query);
//     if (error) throw new ErrorHandler(400, error.message);

//     const orderId = req.query.order_id as string;
//     const courseIds = req.query.course_ids?.toString().split(",");
//     const studentId = res.locals.student_id;

//     const { amount, status } = await fetchAnOrderInfo(orderId);

//     const isPaymentSuccess = status === "paid";
//     if (!isPaymentSuccess)
//       throw new ErrorHandler(400, "Payment has not done yet");

//     //Date Come -> [ { total_price: '7499.00', minimum_to_pay: 4999 } ]
//     const paramsSql = courseIds?.map((_, index) => `$${index + 1}`);
//     const { rows: coursePricesInDb, rowCount } = await pool.query(
//       `SELECT
//           course_id,
//           course_fee AS total_price,
//           CAST(course_fee * (min_pay_percentage / 100.0) AS INT) AS minimum_to_pay
//        FROM courses WHERE course_id IN (${paramsSql})`,
//       courseIds
//     );

//     if (rowCount === 0)
//       throw new ErrorHandler(400, "No Course Avilable With This Id");

//     let totalPrice = 0;
//     let totalMinToPay = 0;
//     coursePricesInDb.forEach((item) => {
//       totalPrice += parseInt(item.total_price);
//       totalMinToPay += parseInt(item.minimum_to_pay);
//     });

//     const convartPaidAmount = parseInt(amount.toString()) / 100;

//     // now verify the user paid amount and calcluted price are same or not
//     if (convartPaidAmount != totalPrice && convartPaidAmount != totalMinToPay) {
//       throw new ErrorHandler(400, "Your paid amount are not same");
//     }

//     const paymentType = convartPaidAmount === totalPrice ? "Full-Payment" : "Part-Payment";

//     /* Store the date now in payments, enrolled_batches_courses table and minus the seats form remain_seats*/

//     const enrollCourseValuesToStore = courseIds?.map((item) => [
//       item,
//       studentId,
//       orderId,
//       `${uuidv4()}`,
//       "Pending",
//     ]) as any;

//     const { query: enrollCourseQuery, values: enrollCourseValues } =
//       insertIntoSql({
//         tableName: "enrolled_batches_courses",
//         columns: [
//           "course_id",
//           "student_id",
//           "order_id",
//           "form_id",
//           "form_status",
//         ],
//         rows: enrollCourseValuesToStore,
//       });

//     const updateSeatsQuery = `
//       UPDATE courses
//       SET remain_seats = remain_seats - 1
//       WHERE course_id IN (${courseIds?.map((_, index) => `$${index + 1}`)})
//     `;
//     const updateSeatsValues = courseIds;

//     const paymentID = Date.now();
//     const insertPaymentInfoValus = courseIds?.map((item, index) => [
//       studentId,
//       paymentType === "Full-Payment"
//         ? totalPrice
//         : totalMinToPay,
//       paymentID,
//       "Student Enrolled From Official Website",
//       "Online-Payment",
//       orderId,
//       0,
//       paymentType,
//       "",
//       item,
//     ]) as any;

//     const { query: insertPaymentQuery, values: insertPaymentValues } =
//       insertIntoSql({
//         tableName: "payments",
//         columns: [
//           "student_id",
//           "paid_amount",
//           "payment_id",
//           "remark",
//           "mode",
//           "order_id",
//           "misc_payment",
//           "payment_type",
//           "misc_remark",
//           "course_id",
//         ],
//         rows: insertPaymentInfoValus,
//       });

//     await transaction([
//       {
//         sql: enrollCourseQuery,
//         values: enrollCourseValues,
//       },
//       {
//         sql: updateSeatsQuery,
//         values: updateSeatsValues as any[],
//       },
//       {
//         sql: insertPaymentQuery,
//         values: insertPaymentValues,
//       },
//     ]);

//     // const convartPaidAmount = parseInt(amount.toString()) / 100;

//     // if (
//     //   (convartPaidAmount / rows[0].course_fee) * 100 !==
//     //   rows[0].min_pay_percentage
//     // ) {
//     //   throw new ErrorHandler(
//     //     400,
//     //     "Your paid amount and minimum payment is mismatched"
//     //   );
//     // }
//     //if payment successfull store the info to db

//     // const { columns, params, values } = objectToSqlInsert({
//     //   student_id: studentId,
//     //   paid_amount: convartPaidAmount,
//     //   payment_id: Date.now(),
//     //   remark: "Student Enrolled From Official Website",
//     //   mode: "Online-Payment",
//     //   order_id: orderId,
//     //   misc_payment: 0,
//     //   payment_type : convartPaidAmount === rows[0].course_fee ? "Full Payment" : "Part Payment",
//     //   misc_remark: "",
//     //   course_id: courseID,
//     // });

//     // const sqlForPayment = `INSERT INTO payments ${columns} VALUES ${params}`;

//     // const quantityToRemove = 1;
//     // await transaction([
//     //   {
//     //     sql: `
//     //       INSERT INTO enrolled_batches_courses (course_id, student_id, order_id, form_id, form_status) VALUES ($1, $2, $3, $4, $5)
//     //       ON CONFLICT (student_id, course_id)
//     //       DO UPDATE SET student_id = EXCLUDED.student_id
//     //     `,
//     //     values: [courseID, studentId, orderId, `FORM-${Date.now()}`, "Pending"],
//     //   },

//     //   {
//     //     sql: `UPDATE courses SET remain_seats = remain_seats - $1 WHERE course_id = $2 AND remain_seats >= $1`,
//     //     values: [quantityToRemove, courseID],
//     //   },

//     //   {
//     //     sql: sqlForPayment,
//     //     values: values,
//     //   },
//     // ]);

//     res
//       .status(201)
//       .json(new ApiResponse(201, "Payment & Course Enrollment Successful"));
//   }
// );

export const verifyPayment = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = verifyPaymentValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    //get order details form request
    const orderId = value.order_id as string;
    const batchIds = value.batch_ids.toString().split(",") as string[];
    const courseIds = value.course_ids.toString().split(",") as string[];
    const isInWaitingListArray = value.is_in_waiting_list
      .toString()
      .split(",") as string[];
    // const institutes = value.institutes.toString().split(",") as string[]
    const studentId = res.locals.student_id;

    // verify the payment
    const { amount, status } = await fetchAnOrderInfo(orderId);
    const isPaymentSuccess = status === "paid";

    if (!isPaymentSuccess)
      throw new ErrorHandler(400, "Payment has not done yet");

    //get the batch_ids payment info form db for security
    const paramsSql = batchIds?.map((_, index) => `$${index + 1}`);
    const { rows: batchPriceInDb, rowCount } = await pool.query(
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
    const { error: transactionError } = await tryCatch(async () => {
      await client.query("BEGIN");

      // store data to fillup_forms (single row will created althoug if multiple course or batches enroll)
      const customFormIdPrefix = `${
        value.institute === "Kolkata" ? "KOL" : "FDB"
      }/FORM/${date.getFullYear()}/`;
      const { rows } = await client.query(
        `
          INSERT INTO fillup_forms (form_id, student_id, form_status)
          VALUES ($1 || nextval('fillup_form_seq_id')::TEXT, $2, $3)
          RETURNING form_id
        `,
        [customFormIdPrefix, studentId, "Pending"]
      );

      const paymentID = Date.now();
      batchIds?.forEach((bId, index) => {
        const currentBatchPriceInfo = batchPriceInDb.find(
          (item) => item.batch_id == bId
        );
        if (!currentBatchPriceInfo)
          throw new ErrorHandler(400, "Batch Mismatch");

        rows_of_enrolled_batches.push(
          courseIds[index],
          bId,
          studentId,
          rows[0].form_id,
          orderId,
          isInWaitingListArray[index] == "true" ? "Pending" : "Approve"
        );

        payments_values.push(
          studentId,
          paymentType === "Part-Payment"
            ? currentBatchPriceInfo.minimum_to_pay
            : currentBatchPriceInfo.total_price,
          paymentID,
          "Online Payment Form Website",
          "Online",
          orderId,
          0,
          "",
          courseIds[index],
          rows[0].form_id,
          bId,
          paymentType
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
      await client.query(
        `
        INSERT INTO payments (student_id, paid_amount, payment_id, remark, mode, order_id, misc_payment, misc_remark, course_id, form_id, batch_id, payment_type)
        VALUES ${sqlPlaceholderCreator(12, batchIds.length).placeholder}
        `,
        // [
        //   studentId,
        //   convartPaidAmount,
        //   Date.now(),
        //   "User Pay In Online",
        //   "Online",
        //   orderId,
        //   0,
        //   "",
        //   rows[0].form_id,
        //   paymentType,
        // ]
        payments_values
      );

      //decrese the total seats as -1 for every batches user enrolled
      await client.query(
        `
        UPDATE course_batches
        SET batch_total_seats = batch_total_seats - 1
        WHERE batch_id IN (${batchIds?.map((_, index) => `$${index + 1}`)})`,
        batchIds
      );

      await client.query("COMMIT");
      client.release();
    });

    if (transactionError !== null) {
      await client.query("ROLLBACK");
      client.release();
      throw transactionError;
    }

    res
      .status(200)
      .json(new ApiResponse(201, "Payment & Course Enrollment Successful"));
  }
);

export const payDueAmount = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = payDueAmountValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows, rowCount } = await pool.query(
      `
      WITH aggregated_payments AS (
          SELECT
              batch_id,
              COALESCE(SUM(paid_amount), 0) AS total_paid
          FROM
              payments
          GROUP BY
              batch_id
      )
      SELECT 
        cb.batch_fee,
        cb.batch_fee - COALESCE(ap.total_paid, 0) AS due_amount
      FROM course_batches AS cb
      
      LEFT JOIN
          aggregated_payments AS ap ON ap.batch_id = cb.batch_id

      WHERE cb.batch_id = $1
      GROUP BY cb.batch_fee, ap.total_paid
      `,
      [value.batch_id]
    );

    if (rowCount === 0)
      throw new ErrorHandler(400, "Not Batch Avliable With This Id");

    const { id, amount } = await createOrder(
      parseFloat(rows[0].due_amount) * 100
    );

    res.status(201).json(
      new ApiResponse(201, "Order id is created", {
        order_id: id,
        amount,
        razorpay_key: process.env.RAZORPAY_KEY_ID,
      })
    );
  }
);

export const verifyOnlineDuePayment = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = verifyDueOnlinePaymentValidator.validate(
      req.query
    );
    if (error) throw new ErrorHandler(400, error.message);

    const studentId = res.locals.student_id;

    const { amount, status } = await fetchAnOrderInfo(value.order_id);
    const isPaymentSuccess = status === "paid";

    if (!isPaymentSuccess)
      throw new ErrorHandler(400, "Payment has not done yet");

    //get the due amount from db
    const { rows, rowCount } = await pool.query(
      `
      WITH aggregated_payments AS (
          SELECT
              batch_id,
              form_id,
              COALESCE(SUM(paid_amount), 0) AS total_paid
          FROM
              payments
          GROUP BY
              batch_id, form_id
      )
      SELECT 
        cb.batch_fee,
        ap.form_id,
        cb.course_id,
        cb.batch_fee - COALESCE(ap.total_paid, 0) AS due_amount
      FROM course_batches AS cb
      
      LEFT JOIN
          aggregated_payments AS ap ON ap.batch_id = cb.batch_id

      WHERE cb.batch_id = $1
      GROUP BY cb.batch_fee, ap.total_paid, ap.form_id, cb.course_id
      `,
      [value.batch_id]
    );

    const convartPaidAmount = parseInt(amount.toString()) / 100;

    if (
      parseFloat(rows[0].due_amount) > convartPaidAmount ||
      parseFloat(rows[0].due_amount) < convartPaidAmount
    ) {
      throw new ErrorHandler(400, "Payment Mismatch Please Contact Us");
    }

    const { columns, params, values } = objectToSqlInsert({
      student_id: studentId,
      paid_amount: convartPaidAmount,
      payment_id: Date.now(),
      remark: "Student Paid Due Amount",
      mode: "Online",
      order_id: value.order_id,
      misc_payment: 0.0,
      misc_remark: "",
      course_id: rows[0].course_id,
      batch_id: value.batch_id,
      form_id: rows[0].form_id,
      payment_type: "Clear Due",
    });

    await pool.query(
      `INSERT INTO payments ${columns} VALUES ${params}`,
      values
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Due Payment Has Successfully Completed"));
  }
);

export const addPayment = asyncErrorHandler(
  async (req: Request, res: Response) => {
    // await new Promise((resolve) => setTimeout(() => resolve(""), 4000));

    const { error, value } = await addPaymentValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const paymentID = Date.now();
    // delete value.payment_type;

    const { rows } = await pool.query(
      `
      SELECT
        p.course_id,
        p.batch_id,
        -- SUM(p.paid_amount) as total_paid,
        cb.batch_fee - SUM(p.paid_amount) as due_amount
      FROM payments AS p

      LEFT JOIN course_batches AS cb
              ON cb.batch_id = p.batch_id
      
      WHERE form_id = $1

      GROUP BY p.course_id, p.batch_id, cb.batch_fee
      `,
      [value.form_id]
    );

    const valuesToStore: any[] = [];
    if (value.payment_type === "Misc Payment") {
      rows.forEach((item) => {
        valuesToStore.push(
          value.student_id,
          0,
          paymentID,
          value.remark ?? "",
          value.mode,
          "",
          parseInt(value.misc_payment ?? 0) / rows.length, // 0,
          value.misc_remark,
          item.course_id, //course id
          item.batch_id, //batch id
          value.form_id,
          value.payment_type
        );
      });
    } else {
      const result = distributeAmountEfficiently(rows, value.paid_amount);
      result.forEach((item) => {
        valuesToStore.push(
          value.student_id,
          item.distributedAmount ?? 0,
          paymentID,
          value.remark ?? "",
          value.mode,
          "",
          // parseInt(value.misc_payment ?? 0) / rows.length,
          0,
          value.misc_remark,
          item.course_id,
          item.batch_id,
          value.form_id,
          value.payment_type
        );
      });
    }

    await pool.query(
      `INSERT INTO payments (student_id, paid_amount, payment_id, remark, mode, order_id, misc_payment, misc_remark, course_id, batch_id, form_id, payment_type)
       VALUES ${
         sqlPlaceholderCreator(12, valuesToStore.length / 12).placeholder
       }
      `,
      valuesToStore
    );
    res.status(201).json(new ApiResponse(201, "New Payment Added"));
  }
);
