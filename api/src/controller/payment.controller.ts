import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import {
  addPaymentValidator,
  payDueAmountValidator,
  refundPaymentValidator,
  sendPaymentLinkValidator,
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
import { parsePagination } from "../utils/parsePagination";
import { verifyToken } from "../utils/token";
import { sendEmail } from "../utils/sendEmail";

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
    const { amount, status, id } = await fetchAnOrderInfo(orderId);
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
    const { error: transactionError, data } = await tryCatch<
      { batch_id: number; start_date: string }[]
    >(async () => {
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

      // const paymentID = Date.now();
      
      const paymentID = req.query.payment_id?.toString() || id;
      const receiptNoPrefix = `${
        value.institute === "Kolkata" ? "KOL" : "FDB"
      }/${date.getFullYear()}/`;

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
          isInWaitingListArray[index] == "true" ? "Pending" : "Pending" //old data was "Approve"
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
          paymentType,
          receiptNoPrefix
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
        INSERT INTO payments (student_id, paid_amount, payment_id, remark, mode, order_id, misc_payment, misc_remark, course_id, form_id, batch_id, payment_type, receipt_no)
        VALUES ${
          sqlPlaceholderCreator(13, batchIds.length, {
            placeHolderNumber: 13,
            value: " || nextval('receipt_no_seq')::TEXT",
          }).placeholder
        }
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

    res
      .status(200)
      .json(
        new ApiResponse(201, "Payment & Course Enrollment Successful", data)
      );
  }
);

export const payDueAmount = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = payDueAmountValidator.validate({...req.body, student_id : res.locals.student_id});
    if (error) throw new ErrorHandler(400, error.message);

    const { rows, rowCount } = await pool.query(
      `
        SELECT
          cb.batch_fee - COALESCE((SELECT SUM(paid_amount) FROM payments WHERE batch_id = $1 AND student_id = $2), 0.00) AS due_amount
        FROM course_batches cb

        WHERE cb.batch_id = $1
      `,
      [value.batch_id, value.student_id]
    );

    if (rowCount === 0)
      throw new ErrorHandler(400, "This Batch Is Not Avilable");

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

    const { amount, status, id } = await fetchAnOrderInfo(value.order_id);
    const isPaymentSuccess = status === "paid";

    if (!isPaymentSuccess)
      throw new ErrorHandler(400, "Payment has not done yet");

    // const { rows } = await pool.query(
    //   `
    //   SELECT 
    //   COALESCE(cb.batch_fee - SUM(p.paid_amount), 0.00) AS due_amount,
    //   c.institute,
    //   cb.course_id,
    //   p.form_id
    //   FROM payments AS p

    //   LEFT JOIN course_batches AS cb
    //   ON cb.batch_id = $1

    //   LEFT JOIN courses AS c
    //   ON c.course_id = cb.course_id

    //   WHERE p.batch_id = $1 AND p.student_id = $2

    //   GROUP BY cb.batch_fee, c.institute, cb.course_id, p.form_id
    // `,
    //   [value.batch_id, res.locals.student_id]
    // );

    const { rows } = await pool.query(
      `
      SELECT
        ebc.course_id,
        ebc.form_id,
        c.institute,
        cb.batch_fee - COALESCE((SELECT SUM(paid_amount) FROM payments WHERE batch_id = $1 AND student_id = $2), 0.00) AS due_amount 
      FROM enrolled_batches_courses ebc

      LEFT JOIN courses c
      ON c.course_id = ebc.course_id

      LEFT JOIN course_batches cb
      ON cb.batch_id = ebc.batch_id
      
      WHERE ebc.batch_id = $1 AND ebc.student_id = $2 
    `,
      [value.batch_id, res.locals.student_id]
    );

    const convartPaidAmount = parseInt(amount.toString()) / 100;

    const receiptNoPrefix = `${
      rows[0].institute === "Kolkata" ? "KOL" : "FDB"
    }/${date.getFullYear()}/`;

    if (
      parseFloat(rows[0].due_amount) > convartPaidAmount ||
      parseFloat(rows[0].due_amount) < convartPaidAmount
    ) {
      throw new ErrorHandler(400, "Payment Mismatch Please Contact Us");
    }

    const valuesToStore = [
      studentId,
      convartPaidAmount,
      id,
      "Student Paid Due Amount",
      "Online",
      value.order_id,
      0.0,
      "",
      rows[0].course_id,
      value.batch_id,
      rows[0].form_id,
      "Clear Due",
      receiptNoPrefix,
    ];

    await pool.query(
      `
      INSERT INTO payments (student_id, paid_amount, payment_id, remark, mode, order_id, misc_payment, misc_remark, course_id, batch_id, form_id, payment_type, receipt_no)
      VALUES ${
        sqlPlaceholderCreator(13, 1, {
          placeHolderNumber: 13,
          value: " || nextval('receipt_no_seq')::TEXT",
        }).placeholder
      }
      `,
      valuesToStore
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
        SUM(p.paid_amount) as paid_amount,
        c.institute,
        cb.batch_fee - SUM(p.paid_amount) as due_amount
      FROM payments AS p

      LEFT JOIN course_batches AS cb
         ON cb.batch_id = p.batch_id

      LEFT JOIN courses AS c
      ON c.course_id = p.course_id
      
      WHERE form_id = $1

      GROUP BY p.course_id, p.batch_id, c.institute, cb.batch_fee
      `,
      [value.form_id]
    );

    const valuesToStore: any[] = [];
    if (value.payment_type === "Misc Payment") {
      rows.forEach((item) => {
        const receiptNoPrefix = `${
          item.institute === "Kolkata" ? "KOL" : "FDB"
        }/${date.getFullYear()}/`;

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
          value.payment_type,
          0.0,
          "",
          receiptNoPrefix,
          value.bank_transaction_id
        );
      });
    } else if (value.payment_type === "Discount") {
      rows.forEach((item) => {
        const receiptNoPrefix = `${
          item.institute === "Kolkata" ? "KOL" : "FDB"
        }/${date.getFullYear()}/`;

        valuesToStore.push(
          value.student_id,
          0,
          paymentID,
          "",
          value.mode,
          "",
          0.0,
          "",
          item.course_id,
          item.batch_id,
          value.form_id,
          value.payment_type,
          parseInt(value.discount_amount ?? 0) / rows.length,
          value.discount_remark,
          receiptNoPrefix,
          value.bank_transaction_id
        );
      });
    } else {
      const result = distributeAmountEfficiently(
        rows,
        value.paid_amount,
        value.paid_amount < 0 ? "paid_amount" : "due_amount"
      );
      result.forEach((item, index) => {
        const receiptNoPrefix = `${
          rows[index].institute === "Kolkata" ? "KOL" : "FDB"
        }/${date.getFullYear()}/`;

        valuesToStore.push(
          value.student_id,
          item.distributedAmount ?? 0,
          paymentID,
          value.remark ?? "",
          value.mode,
          "",
          0,
          value.misc_remark,
          item.course_id,
          item.batch_id,
          value.form_id,
          value.payment_type,
          0.0,
          "",
          receiptNoPrefix,
          value.bank_transaction_id
        );
      });
    }

    await pool.query(
      `INSERT INTO payments (student_id, paid_amount, payment_id, remark, mode, order_id, misc_payment, misc_remark, course_id, batch_id, form_id, payment_type, discount_amount, discount_remark, receipt_no, bank_transaction_id)
       VALUES ${
         sqlPlaceholderCreator(16, valuesToStore.length / 16, {
           placeHolderNumber: 15,
           value: " || nextval('receipt_no_seq')::TEXT",
         }).placeholder
       }
      `,
      valuesToStore
    );
    res.status(201).json(new ApiResponse(201, "New Payment Added"));
  }
);

export const getStudentPaidPayment = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { rows } = await pool.query(
      `SELECT SUM(paid_amount) AS amount FROM payments WHERE student_id = $1 AND batch_id = $2`,
      [req.query.student_id, req.query.batch_id]
    );

    res.status(200).json(
      new ApiResponse(200, "Student Paid Payment", {
        amount: rows[0]?.amount || 0,
      })
    );
  }
);

//About Refund
export const initiateRefund = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = refundPaymentValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    // await transaction([
    //   {
    //     sql: `
    //     INSERT INTO refund_details (student_id, course_id, batch_id, refund_amount, refund_reason, bank_details, executive_name, refund_id, mode)
    //     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    //     values: [
    //       value.student_id,
    //       value.course_id,
    //       value.batch_id,
    //       value.refund_amount,
    //       value.refund_reason,
    //       value.bank_details,
    //       value.executive_name,
    //       value.refund_id ?? Date.now(),
    //       value.mode,
    //     ],
    //   },

    //   {
    //     sql: `
    //       INSERT INTO payments (student_id, paid_amount, payment_id, remark, mode, order_id, misc_payment, misc_remark, course_id, batch_id, form_id, payment_type, discount_amount, discount_remark)
    //       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    //     `,
    //     values: [
    //       value.student_id,
    //       -Math.abs(value.refund_amount),
    //       value.refund_id ?? Date.now(),
    //       value.refund_reason,
    //       value.mode,
    //       value.refund_id ?? Date.now(),
    //       0,
    //       "",
    //       value.course_id,
    //       value.batch_id,
    //       value.form_id,
    //       "Refund",
    //       0,
    //       "",
    //     ],
    //   },

    //   {
    //     sql: `UPDATE enrolled_batches_courses SET enrollment_status = 'Cancel' WHERE course_id = $1 AND batch_id = $2 AND student_id = $3`,
    //     values: [value.course_id, value.batch_id, value.student_id],
    //   },
    // ]);

    await transaction([
      {
        sql: `
        INSERT INTO refund_details (student_id, course_id, batch_id, form_id, refund_amount, refund_reason, bank_details, executive_name, refund_id, mode, payment_id, bank_transaction_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (student_id, course_id, batch_id)
        DO UPDATE SET  
                  refund_reason = EXCLUDED.refund_reason,
                  bank_details = EXCLUDED.bank_details,
                  executive_name = EXCLUDED.executive_name,
                  refund_id = EXCLUDED.refund_id,
                  mode = EXCLUDED.mode,
                  bank_transaction_id = EXCLUDED.bank_transaction_id
        `,
        values: [
          value.student_id,
          value.course_id,
          value.batch_id,
          value.form_id,
          value.refund_amount,
          value.refund_reason,
          value.bank_details,
          value.executive_name,
          value.refund_id || "",
          value.mode,
          Date.now(),
          value.bank_transaction_id
        ],
      },

      {
        sql: `UPDATE enrolled_batches_courses SET enrollment_status = 'Cancel' WHERE course_id = $1 AND batch_id = $2 AND student_id = $3`,
        values: [value.course_id, value.batch_id, value.student_id],
      },
    ]);

    res.status(201).json(new ApiResponse(201, "Refund Successfully Initiated"));
  }
);

export const updateRefundDetails = asyncErrorHandler(async (req, res) => {
  const { error, value } = refundPaymentValidator.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  const client = await pool.connect();

  const { error: tryError } = await tryCatch(async () => {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `
      UPDATE 
        refund_details 
      SET 
        refund_reason = $1, 
        bank_details = $2, 
        executive_name = $3, 
        refund_id = $4, 
        mode = $5, 
        status = $6
      WHERE student_id = $7 AND course_id = $8 AND batch_id = $9
      RETURNING payment_id 
      `,
      [
        value.refund_reason,
        value.bank_details,
        value.executive_name,
        value.refund_id || "",
        value.mode,
        value.status,
        value.student_id,
        value.course_id,
        value.batch_id,
      ]
    );

    const payment_id = rows[0].payment_id;
    const { rowCount } = await client.query(
      `SELECT payment_id FROM payments WHERE payment_id = $1`,
      [payment_id]
    );
    //no data avilable just insert new payment row with inicited payment_id
    if (rowCount === 0) {
      await client.query(
        `
        INSERT INTO payments (student_id, paid_amount, payment_id, remark, mode, order_id, misc_payment, misc_remark, course_id, batch_id, form_id, payment_type, discount_amount, discount_remark)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `,
        [
          value.student_id,
          -Math.abs(value.refund_amount),
          payment_id,
          value.refund_reason,
          value.mode,
          "", //order_id
          0,
          "",
          value.course_id,
          value.batch_id,
          value.form_id,
          "Refund",
          0,
          "",
        ]
      );
    }

    await client.query(
      `UPDATE enrolled_batches_courses SET enrollment_status = 'Cancel' WHERE course_id = $1 AND batch_id = $2 AND student_id = $3`,
      [value.course_id, value.batch_id, value.student_id]
    );

    await client.query("COMMIT");
    client.release();
  });

  if (tryError) {
    await client.query("ROLLBACK");
    client.release();
    throw new ErrorHandler(500, "Internal Server Error");
  }

  res.status(200).json(new ApiResponse(200, "Refund Details Updated"));
});

export const getRefundList = asyncErrorHandler(async (req, res) => {
  let filter = "";
  const filter_values: string[] = [];

  const institute = req.query.institute;
  if (institute) {
    filter = "WHERE rd.institute = $1";
    filter_values.push(institute.toString());
  }

  const { LIMIT, OFFSET } = parsePagination(req);

  const { rows } = await pool.query(
    `
    SELECT
      s.profile_image,
      s.name,
      c.course_name,
      cb.start_date,
      rd.*
    FROM refund_details rd

    LEFT JOIN students s
    ON rd.student_id = s.student_id

    LEFT JOIN courses c
    ON rd.course_id = c.course_id

    LEFT JOIN course_batches cb
    ON rd.batch_id = cb.batch_id

    ${filter}

    ORDER BY rd.created_at DESC

    LIMIT ${LIMIT} OFFSET ${OFFSET}
    `,
    filter_values
  );

  res.status(200).json(new ApiResponse(200, "All Refund List", rows));
});

export const servePaymentPage = asyncErrorHandler(async (req, res) => {
  const token = req.params.token;

  const { data, error } = await verifyToken<{
    order_id: string;
    amount: number;
    tokenKey: string;
  }>(token);
  if (error) throw new ErrorHandler(400, "Payment Link Has Expired Or Invalid");

  res.render("pay", {
    key: process.env.RAZORPAY_KEY_ID,
    order_id: data?.order_id,
    // amount_to_pay: data?.minimum_to_pay,
  });
});

type PaymentDetails = {
  course_ids: string; // Comma-separated string of course IDs
  total_price: string; // Total price as a string
  minimum_to_pay: number; // Minimum amount to pay as a number
  batch_ids: string; // Comma-separated string of batch IDs
  student_id: string; // Student ID as a string
  payment_type: string; // Payment type as a string
  order_id: string;
};

export const verifyPaymentForPaymentLink = asyncErrorHandler(
  async (req, res) => {
    const token = req.body.token;
    const razorpay_payment_id = req.body.payment_id;

    //verify token
    const { error, data } = await verifyToken<PaymentDetails>(token);
    if (error) throw new ErrorHandler(400, "Invalid Token");

    if (!data) throw new ErrorHandler(400, "Failed To Verify Token");

    //fetch payment info form razorpay with order id (get form token data)
    const { amount, id, status } = await fetchAnOrderInfo(data.order_id);
    if (status != "paid")
      throw new ErrorHandler(400, "Payment has not been received yet");

    const convartPaidAmount = parseInt(amount.toString()) / 100;

    if (
      convartPaidAmount !== parseInt(data.total_price) ||
      convartPaidAmount !== data.minimum_to_pay
    )
      throw new ErrorHandler(
        400,
        "Payment Amount Mismatch. Contact us for help"
      );

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

      const receiptNoPrefix = `${
        rows[0].student_institute === "Kolkata" ? "KOL" : "FDB"
      }/${date.getFullYear()}/`;

      batchIds.forEach((bId, index) => {
        payments_values.push(
          data.student_id,
          paymentType === "Part-Payment"
            ? rows[index].minimum_to_pay
            : rows[index].batch_fee,
          razorpay_payment_id?.toString() || id,
          "Paid With Payment Link",
          "Online",
          id,
          0,
          "", // misc remark
          courseIds[index],
          rows[index].form_id, //form id,
          bId,
          paymentType,
          receiptNoPrefix
        );
      });

      await client.query(
        `
        INSERT INTO payments (student_id, paid_amount, payment_id, remark, mode, order_id, misc_payment, misc_remark, course_id, form_id, batch_id, payment_type, receipt_no)
        VALUES ${
          sqlPlaceholderCreator(13, batchIds.length, {
            placeHolderNumber: 13,
            value: " || nextval('receipt_no_seq')::TEXT",
          }).placeholder
        }
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

    res
      .status(200)
      .json(new ApiResponse(200, "Payment Successfully Completed"));
  }
);

export const sendPaymentLinkToEmail = asyncErrorHandler(async (req, res) => {
  const { error, value } = sendPaymentLinkValidator.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  const { error: tokenError, data } = await verifyToken<PaymentDetails>(
    value.token
  );
  if (tokenError || !data) throw new ErrorHandler(400, "Invalid Token");

  const { rows } = await pool.query(
    `
    SELECT
     s.name as student_name,
     s.email as student_email,
     STRING_AGG(c.course_name, ', ') as courses
    FROM students s

    LEFT JOIN courses c
    ON c.course_id IN (${data.course_ids}) 

    WHERE s.student_id = $1

    GROUP BY s.student_id
    `,
    [data.student_id]
  );

  await sendEmail(rows[0].student_email, "PAYMENT_LINK", {
    student_name: rows[0].student_name,
    course_name: rows[0].courses,
    order_id: data.order_id,
    amount_to_pay:
      data.payment_type === "Part-Payment"
        ? data.minimum_to_pay
        : data.total_price,
    payment_link: process.env.FRONTEND_HOST + "/payment/" + value.token,
    current_year: date.getFullYear(),
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Payment link has been successfully sent."));
});