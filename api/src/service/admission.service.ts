import QueryString from "qs";
import { ErrorHandler } from "../utils/ErrorHandler";
import { transaction } from "../utils/transaction";
import { pool } from "../config/db";
import { getAdmissionsValidator } from "../validator/admission.validator";
import { parsePagination } from "../utils/parsePagination";
import { Request } from "express";
import { tryCatch } from "../utils/tryCatch";

// export const getAdmissionsService = async (courseId?: string) => {
//   let sql1 = `
//       SELECT

//       f.*,
//       s.name,
//       s.profile_image

//       FROM fillup_forms AS f

//       LEFT JOIN students AS s
//       ON f.student_id = s.student_id
// `;
//   const sql1Values: any[] = [];

//   if (courseId) {
//     sql1 = `
//         SELECT
//         f.*,
//         s.name,
//         s.profile_image
//         FROM enrolled_batches_courses as ebc

//         LEFT JOIN fillup_forms AS f
//         ON ebc.form_id = f.form_id

//         LEFT JOIN students AS s
//         ON f.student_id = s.student_id
//       `;
//   }

//   if (courseId) {
//     sql1 += ` WHERE course_id = $1`;
//     sql1Values.push(courseId);
//   }

//   const sql2 = `SELECT course_id, course_name FROM courses`;

//   const response = await transaction([
//     {
//       sql: sql1,
//       values: sql1Values,
//     },
//     {
//       sql: sql2,
//       values: [],
//     },
//   ]);

//   return {
//     enrolled_students: response[0].rows,
//     courses_name: response[1].rows,
//   };
// };

export const getAdmissionsService = async (
  query: QueryString.ParsedQs,
  req: Request
) => {
  const { error } = getAdmissionsValidator.validate(query);
  if (error) throw new ErrorHandler(400, error.message);

  const { LIMIT, OFFSET } = parsePagination(req);

  let FILTER =
    "WHERE c.course_id = $1 AND c.institute = $2 AND c.course_type = $3 AND cb.start_date = $4";
  let FILTER_VALUES: any[] = [
    query.course_id,
    query.institute,
    query.course_type,
    query.batch_date,
  ];
  if (req.query.form_id) {
    FILTER = "WHERE ff.form_id = $1";
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

  const { rows } = await pool.query(
    `
    SELECT 
      ff.form_id,
      ff.form_status,
      s.profile_image,
      s.name AS student_name,
      s.student_id
    FROM fillup_forms AS ff

    LEFT JOIN students AS s
    ON s.student_id = ff.student_id

    LEFT JOIN enrolled_batches_courses AS ebc
    ON ebc.form_id = ff.form_id

    LEFT JOIN courses AS c
    ON c.course_id = ebc.course_id

    LEFT JOIN course_batches AS cb
    ON cb.batch_id = ebc.batch_id

    ${FILTER}

    GROUP BY ebc.course_id, ff.form_id, s.profile_image, s.name, s.student_id
    LIMIT ${LIMIT} OFFSET ${OFFSET}
  `,
    FILTER_VALUES
  );

  return rows;
};

export const getSingleAdmissionInfo = async (form_id: string) => {
  //this is for enroll courses and student info
  const courseAndStudentInfoSql = `
          SELECT
              s.*,
              '********' AS password,
              ff.form_status,
              ff.form_id,

              json_agg(
                  json_build_object(
                      'enroll_id', ebc.enroll_id,
                      'course_id', c.course_id,
                      'course_require_documents', c.require_documents,
                      'course_name', c.course_name,
                      'batch_start_date', cb.start_date,
                      'batch_end_date', cb.end_date,
                      'batch_fee', cb.batch_fee,
                      'batch_id', cb.batch_id,
                      'enrollment_status', ebc.enrollment_status,
                      'modified_by_info', (
                          SELECT json_agg(
                              json_build_object('batch_id', mb.batch_id, 'employee_name', e.name, 'created_at', mb.created_at)
                          )
                          FROM batch_modified_by AS mb

                          INNER JOIN employee e
                          ON e.id = mb.employee_id

                          WHERE mb.batch_id = cb.batch_id
                          -- ORDER BY DESC
                      )
                  ) ORDER BY ebc.enroll_id
              ) AS enrolled_courses_info

          FROM fillup_forms AS ff
          LEFT JOIN students AS s ON s.student_id = ff.student_id
          LEFT JOIN enrolled_batches_courses AS ebc ON ebc.form_id = ff.form_id
          LEFT JOIN courses AS c ON c.course_id = ebc.course_id
          LEFT JOIN course_batches AS cb ON cb.batch_id = ebc.batch_id

          WHERE ff.form_id = $1

          GROUP BY s.student_id, ff.form_status, ff.form_id;
  `;

  const paymentsDataSql = `SELECT * FROM payments WHERE form_id = $1`;

  const getBatchesFeesSql = `
    SELECT 

    SUM(COALESCE(CB.batch_fee, 0)) as total_fee

    FROM enrolled_batches_courses as EBC
    
    LEFT JOIN course_batches as CB
    ON CB.batch_id = EBC.batch_id

    WHERE form_id = $1 -- AND EBC.enrollment_status = 'Approve' OR EBC.enrollment_status = 'Pending'`;

  const client = await pool.connect();

  const { error, data } = await tryCatch(async () => {
    await client.query("BEGIN");

    const courseAndStudentInfo = await client.query(courseAndStudentInfoSql, [
      form_id,
    ]);
    const enrolledCourseIds =
      courseAndStudentInfo.rows[0].enrolled_courses_info.map(
        (item: any) => item.course_id
      );

    const paymentsDataInfo = await client.query(paymentsDataSql, [form_id]);

    const getBatchesFeesInfo = await client.query(getBatchesFeesSql, [form_id]);

    const courseBatchesInfo = await client.query(
      `
      SELECT c.course_id, json_agg(cb.*) AS batches FROM courses c
      LEFT JOIN course_batches cb
      ON cb.course_id = c.course_id

      WHERE c.course_id IN (${enrolledCourseIds.map(
        (_: any, index: number) => `$${index + 1}`
      )})

      GROUP BY c.course_id
    `,
      enrolledCourseIds
    );

    await client.query("COMMIT");
    client.release();

    return {
      courseAndStudentInfo,
      paymentsDataInfo,
      getBatchesFeesInfo,
      courseBatchesInfo,
    };
  });

  if (error) {
    await client.query("ROLLBACK");
    client.release();
    throw new ErrorHandler(400, error.message);
  }

  // if (
  //   data?.courseAndStudentInfo.rowCount === 0 ||
  //   data?.paymentsDataInfo.rowCount === 0
  // )
  //   throw new ErrorHandler(500, "Data Empty Error");

  const paymentInfo: {
    total_paid: number;
    total_fee: number;
    total_due: number;
    total_misc_payment: number;
    total_discount: number;
    payments: any[];
  } = {
    total_paid: 0,
    total_fee: 0,
    total_due: 0,
    total_misc_payment: 0,
    total_discount: 0,
    payments: [],
  };

  const existedPaymentIds = new Map();
  data?.paymentsDataInfo.rows.forEach((item: any) => {
    if (existedPaymentIds.has(item.payment_id)) {
      const tempPayInfo =
        paymentInfo.payments[existedPaymentIds.get(item.payment_id)];
      tempPayInfo.paid_amount =
        parseInt(tempPayInfo.paid_amount) + parseInt(item.paid_amount);
      tempPayInfo.misc_payment =
        parseInt(tempPayInfo.misc_payment) + parseInt(item.misc_payment);
      tempPayInfo.discount_amount =
        parseInt(tempPayInfo.discount_amount) + parseInt(item.discount_amount);
    } else {
      paymentInfo.payments.push(item);
      existedPaymentIds.set(item.payment_id, paymentInfo.payments.length - 1);
    }
    // paymentInfo.total_paid = parseFloat(paymentInfo.total_paid.toString()) + parseFloat(item.paid_amount);
    paymentInfo.total_misc_payment += parseInt(item.misc_payment || 0.0);
    // paymentInfo.total_paid += parseInt(
    //   item.paid_amount + parseInt(item.misc_payment) || 0.0
    // );
    paymentInfo.total_paid += parseInt(item.paid_amount || 0.0);
    paymentInfo.total_discount += parseInt(item.discount_amount || 0.0);
  });

  // paymentInfo.total_fee = parseInt(data?.getBatchesFeesInfo.rows[0].total_fee || 0) - paymentInfo.total_discount;
  paymentInfo.total_fee = parseInt(
    data?.getBatchesFeesInfo.rows[0].total_fee || 0.0
  );

  // paymentInfo.total_due = parseInt(
  //   (
  //     paymentInfo.total_fee -
  //     paymentInfo.total_paid +
  //     paymentInfo.total_misc_payment +
  //     paymentInfo.total_discount
  //   ).toString()
  // );

  paymentInfo.total_due = parseInt(
    (paymentInfo.total_fee - paymentInfo.total_paid).toString()
  );

  return {
    course_and_student_info: data?.courseAndStudentInfo.rows[0],
    student_payment_info: paymentInfo,
    course_batches: data?.courseBatchesInfo.rows,
  };
};
