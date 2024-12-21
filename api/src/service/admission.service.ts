import QueryString from "qs";
import { ErrorHandler } from "../utils/ErrorHandler";
import { transaction } from "../utils/transaction";
import { pool } from "../config/db";
import { getAdmissionsValidator } from "../validator/admission.validator";

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

export const getAdmissionsService = async (query: QueryString.ParsedQs) => {
  const { error } = getAdmissionsValidator.validate(query);
  if (error) throw new ErrorHandler(400, error.message);

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

    WHERE c.course_id = $1 AND c.institute = $2 AND c.course_type = $3 AND cb.start_date = $4

    GROUP BY ebc.course_id, ff.form_id, s.profile_image, s.name, s.student_id
  `,
    [query.course_id, query.institute, query.course_type, query.batch_date]
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
            'enrollment_status', ebc.enrollment_status
          ) ORDER BY ebc.enroll_id
        ) as enrolled_courses_info

        FROM fillup_forms AS ff

        LEFT JOIN students AS s
        ON s.student_id = ff.student_id

        LEFT JOIN enrolled_batches_courses AS ebc
        ON ebc.form_id = ff.form_id

        LEFT JOIN courses AS c
        ON c.course_id = ebc.course_id

        LEFT JOIN course_batches AS cb
        ON cb.batch_id = ebc.batch_id

        WHERE ff.form_id = $1

        GROUP BY s.student_id, ff.form_status, ff.form_id
  `;

  const paymentsDataSql = `SELECT * FROM payments WHERE form_id = $1`;

  const getBatchesFeesSql = `
    SELECT 

    SUM(CB.batch_fee) as total_fee

    FROM enrolled_batches_courses as EBC
    
    LEFT JOIN course_batches as CB
    ON CB.batch_id = EBC.batch_id

     WHERE form_id = $1`;

  const response = await transaction([
    { sql: courseAndStudentInfoSql, values: [form_id] },
    { sql: paymentsDataSql, values: [form_id] },
    { sql: getBatchesFeesSql, values: [form_id] },
  ]);

  if (response[0].rowCount === 0 || response[1].rowCount === 0)
    throw new ErrorHandler(500, "Data Empty Error");

  const paymentInfo: {
    total_paid: number;
    total_fee: number;
    total_due: number;
    total_misc_payment: number;
    payments: any[];
  } = {
    total_paid: 0,
    total_fee: 0,
    total_due: 0,
    total_misc_payment: 0,
    payments: [],
  };

  const existedPaymentIds = new Map();
  response[1].rows.forEach((item) => {
    if (existedPaymentIds.has(item.payment_id)) {
      const tempPayInfo =
        paymentInfo.payments[existedPaymentIds.get(item.payment_id)];
      tempPayInfo.paid_amount =
        parseFloat(tempPayInfo.paid_amount) + parseFloat(item.paid_amount);
      tempPayInfo.misc_payment =
        parseFloat(tempPayInfo.misc_payment) + parseFloat(item.misc_payment);
    } else {
      paymentInfo.payments.push(item);
      existedPaymentIds.set(item.payment_id, paymentInfo.payments.length - 1);
    }
    paymentInfo.total_paid =
      parseFloat(`${paymentInfo.total_paid}`) + parseFloat(item.paid_amount);
    paymentInfo.total_misc_payment += parseInt(item.misc_payment || 0.0);
  });

  paymentInfo.total_fee = parseFloat(response[2].rows[0].total_fee);
  paymentInfo.total_due = parseFloat(
    `${paymentInfo.total_fee - paymentInfo.total_paid}`
  );

  return {
    course_and_student_info: response[0].rows[0],
    student_payment_info: paymentInfo,
  };
};
