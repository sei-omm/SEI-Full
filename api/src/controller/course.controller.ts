import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import {
  objectToSqlConverterUpdate,
  objectToSqlInsert,
} from "../utils/objectToSql";
import { pool } from "../config/db";
import { ApiResponse } from "../utils/ApiResponse";
import {
  addNewCourseValidator,
  deleteCourseBatchValidator,
  enrollBatchValidator,
  getMultiBatchPricesValidator,
  getMultiCoursesPricesValidator,
  getRequiredDocumentsValidator,
  getScheduleCourseBatchValidator,
  getSingleCourseValidator,
  scheduleCourseBatchValidator,
  updateCourseValidator,
  updateScheduleCourseBatchValidator,
  VchangeBatchManually,
  VDraftTimeTable,
  VSaveTimeTable,
  VTimeTable,
} from "../validator/course.validator";
import { ErrorHandler } from "../utils/ErrorHandler";
import { getAuthToken } from "../utils/getAuthToken";
import { createToken, verifyToken } from "../utils/token";
import { createOrder } from "../service/razorpay.service";
import { transaction } from "../utils/transaction";
import { filterToSql } from "../utils/filterToSql";
import { tryCatch } from "../utils/tryCatch";
import { parsePagination } from "../utils/parsePagination";
import { hasOverlappingBatchDate } from "../utils/hasOverlappingBatchDate";

const table_name = "courses";

export const getAllCourse = asyncErrorHandler(
  async (req: Request, res: Response) => {
    // await new Promise((resolve) => setTimeout(() => resolve(""), 3000))
    const center = req.query.center;
    const token = getAuthToken(req);

    let sql = `
      SELECT *,
            CASE
                WHEN course_update_time <= NOW() AND course_visibility = 'Schedule'
                THEN 'Public'
                ELSE course_visibility
            END AS course_visibility
      FROM ${table_name}
    `;

    const conditions = []; // Array to hold conditions
    const params: string[] = []; // Array to hold parameter values

    // Build conditions based on available query parameters
    if (center) {
      conditions.push(`institute = $${params.length + 1}`);
      params.push(center as string);
    }

    if (!token) {
      conditions.push(
        "(course_visibility = 'Public' OR course_update_time <= NOW())"
      );
      // conditions.push(`course_update_time <= NOW()`);
    } else {
      const { error, data } = await verifyToken<{ role: string }>(token);
      if (error) throw new ErrorHandler(400, error.message);

      if (data?.role != "admin") {
        conditions.push(`course_update_time <= NOW()`);
      }
    }

    // If there are conditions, add them to the query
    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    const { rows } = await pool.query(sql, params);
    res.status(200).json(new ApiResponse(200, "All Date", rows));
  }
);

export const getCoursesWithSubject = asyncErrorHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT course_id, course_name, subjects FROM courses WHERE institute = $1`,
    [req.query.institute]
  );

  res.status(200).json(new ApiResponse(200, "Course Info With Subjects", rows));
});

// export const getCoursesWithBatch = asyncErrorHandler(
//   async (req: Request, res: Response) => {
//     const center = req.query.center;

//     const token = getAuthToken(req);
//     let whereCondition = `WHERE c.course_visibility = 'Public' ${
//       center ? "AND institute = $1" : ""
//     }`;

//     if (token) {
//       const { error, data } = await verifyToken<{ role: string }>(token);
//       if (error) throw new ErrorHandler(400, error.message);

//       if (data?.role !== "Student") {
//         whereCondition = center ? "WHERE institute = $1" : "";
//       }
//     }

//     const sql = `
//         SELECT
//         c.*,
//         COALESCE(
//             json_agg(
//                 b.*
//             ) FILTER (WHERE b.batch_id IS NOT NULL), '[]'
//         ) AS batches
//     FROM
//         courses c
//     LEFT JOIN
//         course_batches b ON c.course_id = b.course_id

//     ${whereCondition}

//     GROUP BY
//         c.course_id, c.course_name ORDER BY course_showing_order ASC;
//     `;

//     const sqlValues: any[] = [];
//     if (center) {
//       sqlValues.push(center);
//     }

//     const { rows } = await pool.query(sql, sqlValues);
//     res.status(200).json(new ApiResponse(200, "All Date", rows));
//   }
// );

export const getCoursesWithBatch = asyncErrorHandler(async (req, res) => {
  const { LIMIT, OFFSET } = parsePagination(req);

  let isNoPagination = false;
  if (req.query.nopagination !== undefined) {
    isNoPagination =
      req.query.nopagination.toString() === "false" ? false : true;
    delete req.query.nopagination;
  }

  //filds
  let validFields: string[] = [];
  const fieldsParam = req.query.fields?.toString();
  if (fieldsParam) {
    const requestedFields = fieldsParam.split(":").filter(Boolean);
    const allowedFields = [
      "course_id",
      "course_code",
      "course_name",
      "institute",
    ];
    validFields = requestedFields.filter((field) =>
      allowedFields.includes(field)
    );
    // If no valid fields are provided, default to selecting all fields or throw an error
    if (validFields.length === 0) {
      throw new ErrorHandler(400, "No valid fields specified");
    }

    delete req.query.fields;
  }

  //for limited courses
  const courseIds = req.query.course_ids?.toString();
  delete req.query.course_ids;

  const { filterQuery, filterValues, placeholderNum } = filterToSql(
    req.query,
    "c"
  );
  let newFilters = filterQuery;

  const courseIdsToArray = courseIds?.split(",");
  if (courseIds !== undefined && courseIdsToArray) {
    if (filterQuery === "") {
      newFilters += `WHERE c.course_id IN (${courseIdsToArray.map(
        (_, index) => `$${index + 1}`
      )})`;
    } else {
      newFilters += ` AND c.course_id IN (${courseIdsToArray?.map(
        (_, index) => `$${placeholderNum + index}`
      )})`;
    }
    filterValues.push(...courseIdsToArray);
  }

  const sql = `
          SELECT
          ${validFields.length === 0 ? "c.*" : `c.${validFields.join(", c.")}`},
          COALESCE(
              json_agg(
                  b.* ORDER BY b.start_date ASC
              ) FILTER (WHERE b.batch_id IS NOT NULL AND b.start_date >= CURRENT_DATE), '[]'
          ) AS batches
      FROM 
          courses c
      LEFT JOIN 
          course_batches b ON c.course_id = b.course_id

          ${newFilters}

      GROUP BY 
          c.course_id, c.course_name ORDER BY course_showing_order ASC
      
      ${isNoPagination ? "" : `LIMIT ${LIMIT} OFFSET ${OFFSET}`}
      `;
  const { rows } = await pool.query(sql, filterValues);
  res.status(200).json(new ApiResponse(200, "All Date", rows));
});

export const getCourseWithBatchStudents = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { filterQuery, filterValues } = filterToSql(
      {
        ...req.query,
        course_visibility: "Public",
      },
      "c"
    );

    const sql = `
            SELECT 
            c.*,
            COALESCE(
                json_agg(
                    b.* ORDER BY b.start_date ASC
                ) FILTER (WHERE b.batch_id IS NOT NULL AND b.start_date >= CURRENT_DATE), '[]'
            ) AS batches
        FROM 
            courses c
        LEFT JOIN 
            course_batches b ON c.course_id = b.course_id

            ${filterQuery}

        GROUP BY 
            c.course_id, c.course_name ORDER BY course_showing_order ASC;
        `;

    const { rows } = await pool.query(sql, filterValues);
    res.status(200).json(new ApiResponse(200, "All Date", rows));
  }
);

//with schedule
// export const getSingleCourse = asyncErrorHandler(
//   async (req: Request, res: Response) => {
//     const { error, value } = getSingleCourseValidator.validate(req.params);
//     if (error) throw new ErrorHandler(400, error.message);

//     const sql = `
//       SELECT *,
//         CASE
//           WHEN course_update_time <= NOW() AND course_visibility = 'Schedule'
//           THEN 'Public'
//           ELSE course_visibility
//         END AS course_visibility
//       FROM ${table_name} WHERE course_id = $1
//     `;

//     const { rowCount, rows } = await pool.query(sql, [value.course_id]);

//     if (rowCount === 0) throw new ErrorHandler(404, "No Course Found");

//     res.status(200).json(new ApiResponse(200, "All Date", rows[0]));
//   }
// );

export const getSingleCourse = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = getSingleCourseValidator.validate(req.params);
    if (error) throw new ErrorHandler(400, error.message);

    const sql = `
      SELECT 
      c.*,
      d.*,
      cwmbpm.max_batch
      FROM ${table_name} AS c
      LEFT JOIN department AS d
            ON d.id = c.concern_marketing_executive_id
      LEFT JOIN course_with_max_batch_per_month AS cwmbpm
            ON cwmbpm.course_id = c.course_id
      WHERE c.course_id = $1

      ORDER BY cwmbpm.created_date DESC
      LIMIT 1
    `;

    const { rowCount, rows } = await pool.query(sql, [value.course_id]);

    if (rowCount === 0) throw new ErrorHandler(404, "No Course Found");

    res.status(200).json(new ApiResponse(200, "All Date", rows[0]));
  }
);

export const getMultiCoursesPrices = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = getMultiCoursesPricesValidator.validate(req.query);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }

    const courseIds = req.query.course_ids;
    if (courseIds === "")
      return res.status(200).json(new ApiResponse(200, "Courses", []));

    const idsStringToArray = courseIds?.toString().split(",");
    const sqlParams = idsStringToArray?.map((_, index) => `$${index + 1}`);

    // const { rows, rowCount } = await pool.query(
    //   `SELECT
    //       SUM(course_fee) AS total_price,
    //       CAST(SUM(course_fee * (min_pay_percentage / 100.0)) AS INT) AS minimum_to_pay
    //    FROM ${table_name} WHERE course_id IN (${sqlParams})`,
    //   idsStringToArray
    // );

    // const { rows } = await pool.query(
    //   `SELECT

    //       c.course_id,
    //       c.course_name,
    //       c.course_fee AS total_price,
    //       CAST(c.course_fee * (c.min_pay_percentage / 100.0) AS INT) AS minimum_to_pay,
    //       COALESCE(json_agg(b.*), '[]') AS batches

    //    FROM ${table_name} AS c

    //    LEFT JOIN schedule_course_batches as b
    //    ON b.course_id = c.course_id

    //    WHERE c.course_id IN (${sqlParams})
    //    GROUP BY c.course_id, c.course_name, c.course_fee, c.min_pay_percentage;
    //    `,
    //   idsStringToArray
    // );

    const { rows } = await pool.query(
      `SELECT
          c.course_id,
          c.course_name,
          c.course_fee AS total_price,
          CAST(c.course_fee * (c.min_pay_percentage / 100.0) AS INT) AS minimum_to_pay
       FROM ${table_name} AS c
       WHERE c.course_id IN (${sqlParams})
       `,
      idsStringToArray
    );

    // if (rowCount === 0) throw new ErrorHandler(400, "No Course Found");

    res.status(200).json(new ApiResponse(200, "Done", rows));
  }
);

export const getMultiBatchPrices = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = getMultiBatchPricesValidator.validate(req.query);
    if (error) {
      throw new ErrorHandler(400, error.details[0].message);
    }

    const batchIds = req.query.batch_ids;
    if (batchIds === "")
      return res
        .status(200)
        .json(new ApiResponse(200, "Batches With Prices", []));

    const idsStringToArray = batchIds?.toString().split(",");
    const sqlParams = idsStringToArray?.map((_, index) => `$${index + 1}`);

    const { rows } = await pool.query(
      `SELECT
          cb.course_id,
          cb.batch_id,
          cb.batch_fee AS total_price,
          CAST(cb.batch_fee * (cb.min_pay_percentage / 100.0) AS INT) AS minimum_to_pay
       FROM course_batches AS cb
       WHERE cb.batch_id IN (${sqlParams})
       `,
      idsStringToArray
    );

    // if (rowCount === 0) throw new ErrorHandler(400, "No Course Found");

    res.status(200).json(new ApiResponse(200, "Done", rows));
  }
);

export const searchCourse = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const keyword = req.query.q;
    if (!keyword || keyword === "") {
      // throw new ErrorHandler(400, "Add Some Keyword To Search");
      return res.status(200).json(new ApiResponse(200, "Search Result", []));
    }

    const { rows } = await pool.query(
      `SELECT course_id, course_name FROM ${table_name} WHERE course_name ILIKE $1`,
      [`%${keyword}%`]
    );

    res.status(200).json(new ApiResponse(200, "Search Result", rows));
  }
);

export const addNewCourse = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = addNewCourseValidator.validate(req.body);
    if (error)
      throw new ErrorHandler(
        400,
        error.message,
        error?.details[0].context?.key
      );

    const client = await pool.connect();

    const { error: tryError } = await tryCatch(async () => {
      await client.query("BEGIN");

      const max_batch = req.body.max_batch;
      delete req.body.max_batch;

      const { columns, params, values } = objectToSqlInsert(req.body);
      const { rows } = await client.query(
        `INSERT INTO ${table_name} ${columns} VALUES ${params} RETURNING course_id`,
        values
      );

      const newCreatedCourseId = rows[0].course_id;

      await client.query(
        `
          INSERT INTO course_with_max_batch_per_month
          (course_id, max_batch)
          VALUES ($1, $2)
          
          ON CONFLICT (course_id, created_month)
          DO NOTHING;
        `,
        [newCreatedCourseId, max_batch]
      );

      await client.query("COMMIT");
      client.release();
    });

    if (tryError) {
      await client.query("ROLLBACK");
      client.release();
      throw new ErrorHandler(
        500,
        "Some Problem Occurred While Processing Your Request"
      );
    }

    res.status(201).json(new ApiResponse(201, "New Courses Added"));
  }
);

export const updateCourseInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = updateCourseValidator.validate({
      ...req.params,
      ...req.body,
    });

    if (error) throw new ErrorHandler(400, error.message);

    const client = await pool.connect();

    const { error: tryError } = await tryCatch(async () => {
      await client.query("BEGIN");

      const max_batch = req.body.max_batch;
      delete req.body.max_batch;

      const { keys, paramsNum, values } = objectToSqlConverterUpdate(req.body);
      await pool.query(
        `UPDATE ${table_name} SET ${keys} WHERE course_id = $${paramsNum}`,
        [...values, req.params.course_id]
      );

      await client.query(
        `
          INSERT INTO course_with_max_batch_per_month
          (course_id, max_batch, created_month)
          VALUES ($1, $2, DATE_TRUNC('month', CURRENT_DATE))
          ON CONFLICT (course_id, created_month)
          
          DO UPDATE SET
              max_batch = EXCLUDED.max_batch;
        `,
        [req.params.course_id, max_batch]
      );

      await client.query("COMMIT");
      client.release();
    });

    if (tryError) {
      await client.query("ROLLBACK");
      client.release();
      console.log(tryError);
      throw new ErrorHandler(
        500,
        "Some Problem Occurred While Processing Your Request"
      );
    }

    res
      .status(201)
      .json(new ApiResponse(201, "Course Info Updated Successfully"));
  }
);

export const deleteCourse = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = getSingleCourseValidator.validate(req.params);
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(`DELETE FROM ${table_name} WHERE course_id = $1`, [
      req.params.course_id,
    ]);
    // await new Promise((resolve) => setTimeout(() => resolve(""), 4000))

    res.status(200).json(new ApiResponse(200, "Course Successfully Deleted"));
  }
);

// export const enrolCourse = asyncErrorHandler(
//   async (req: Request, res: Response) => {
//     // await new Promise((resolve) => setTimeout(()=> resolve(""), 3000));

//     const { error } = fillUpFormValidator.validate({
//       ...req.body,
//       ...req.params,
//     });
//     if (error) throw new ErrorHandler(400, error.message);

//     const payment_mode = req.body.payment_mode;
//     const studentId = res.locals.student_id;
//     const courseId = req.params.course_id;
//     const amountStudentPaying = req.body.student_paying;
//     delete req.body.payment_mode;
//     delete req.body.student_paying;

//     const { keys, paramsNum, values } = objectToSqlConverterUpdate(req.body);
//     values.push(studentId);

//     if (payment_mode === "Cash") {
//       /*

//        if student pay using Cash payment mode then do three thing
//        1) update the student info in students table
//        2) insert a new row inside enrolled_batches_courses table. so that i can understand user has enrolled
//        3) decrease the amount of remains students by 1
//        4) store info to payment section
//       */

//       const {
//         columns,
//         params,
//         values: paymentsValues,
//       } = objectToSqlInsert({
//         student_id: studentId,
//         paid_amount: 0,
//         payment_id: Date.now(),
//         remark: "Student Enrolled From Official Website",
//         mode: "CASH",
//         order_id: null,
//         misc_payment: 0,
//         misc_remark: "",
//         payment_type: "Full Payment",
//         course_id: courseId,
//       });

//       const sqlForPayment = `INSERT INTO payments ${columns} VALUES ${params}`;

//       const quantityToRemove = 1;
//       await transaction([
//         {
//           sql: `
//             INSERT INTO enrolled_batches_courses (course_id, student_id, order_id, form_id, form_status) VALUES ($1, $2, $3, $4, $5)
//             ON CONFLICT (student_id, course_id)
//             DO UPDATE SET student_id = EXCLUDED.student_id
//           `,
//           values: [
//             courseId,
//             studentId,
//             "CASH",
//             `FORM-${Date.now()}`,
//             "Pending",
//           ],
//         },
//         {
//           sql: `UPDATE students SET ${keys} WHERE student_id = $${paramsNum}`,
//           values: values,
//         },
//         {
//           sql: `UPDATE courses SET remain_seats = remain_seats - $1 WHERE course_id = $2 AND remain_seats >= $1`,
//           values: [quantityToRemove, courseId],
//         },
//         {
//           sql: sqlForPayment,
//           values: paymentsValues,
//         },
//       ]);

//       return res
//         .status(201)
//         .json(new ApiResponse(201, "Course Enrollment Successful"));
//     }

//     /*

//        if student pay using Online payment mode then
//        1) get course_fee and min_pay_percentage form course table
//        2) get student_paying amount and check is the amount is not bigger or smaller then the min_pay_percentage
//        3) create a razorpay order

//     */

//     if (!amountStudentPaying)
//       throw new ErrorHandler(400, "student_paying amount is needed");

//     //get the amount of the course
//     const { rows, rowCount } = await pool.query(
//       `SELECT course_fee, min_pay_percentage FROM ${table_name} WHERE course_id = $1`,
//       [courseId]
//     );

//     //updating student info
//     await pool.query(
//       `UPDATE students SET ${keys} WHERE student_id = $${paramsNum}`,
//       values
//     );

//     if (rowCount === 0) throw new ErrorHandler(404, "Course Doesn't found");

//     const studentPayingAmount = parseInt(amountStudentPaying);

//     //if use amount is bigger then the course amount
//     if (studentPayingAmount > rows[0].course_fee)
//       throw new ErrorHandler(400, "You are paying more the the course amount");

//     //if the studentPayingAmount percentage is less the the min_pay_percentage
//     if (
//       (studentPayingAmount / rows[0].course_fee) * 100 <
//       rows[0].min_pay_percentage
//     )
//       throw new ErrorHandler(
//         400,
//         "You are not able to pay less then the minimum amount"
//       );

//     //create mew order and send back to client side
//     const { id, amount } = await createOrder(studentPayingAmount * 100);
//     res.status(201).json(
//       new ApiResponse(201, "Order id is created", {
//         order_id: id,
//         amount,
//         razorpay_key: process.env.RAZORPAY_KEY_ID,
//       })
//     );
//   }
// );

// export const enrolCourse = asyncErrorHandler(
//   async (req: Request, res: Response) => {
//     const { error } = enrollCourseValidator.validate({
//       ...req.body,
//       ...req.query,
//     });
//     if (error) throw new ErrorHandler(400, error.message);

//     const courseIds = req.query.course_ids?.toString().split(","); //it should be an array of course ids
//     delete req.body.course_ids;

//     const payment_mode = req.body.payment_mode;
//     delete req.body.payment_mode;

//     //get the amount of the course
//     const paramsSql = courseIds?.map((_, index) => `$${index + 1}`);

//     //Date Come -> [ { total_price: '7499.00', minimum_to_pay: 4999 } ]
//     const { rows, rowCount } = await pool.query(
//       `SELECT
//           SUM(course_fee) AS total_price,
//           CAST(SUM(course_fee * (min_pay_percentage / 100.0)) AS INT) AS minimum_to_pay
//        FROM ${table_name} WHERE course_id IN (${paramsSql})`,
//       courseIds
//     );

//     if (rowCount === 0) throw new ErrorHandler(404, "Course Doesn't found");

//     //create new order and send back to client side
//     const { id, amount } = await createOrder(
//       payment_mode === "Part-Payment"
//         ? rows[0].minimum_to_pay * 100
//         : rows[0].total_price * 100
//     );

//     res.status(201).json(
//       new ApiResponse(201, "Order id is created", {
//         order_id: id,
//         amount,
//         razorpay_key: process.env.RAZORPAY_KEY_ID,
//       })
//     );
//   }
// );

export const enrollToBatch = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = enrollBatchValidator.validate({
      ...req.body,
      ...req.query,
    });
    if (error) throw new ErrorHandler(400, error.message);

    const batchIds = req.query.batch_ids?.toString().split(","); //it should be an array of batch ids
    delete req.body.batch_ids;

    const payment_type = req.body.payment_mode;
    delete req.body.payment_mode;

    // why this because when form crm we need to create payment link for student at that time we will send student id in query else form portal it will come throung auth header
    const studentID = res.locals.student_id || req.query.student_id;

    //get the amount of the course
    const paramsSql = batchIds?.map((_, index) => `$${index + 1}`);

    //Date Come -> [ { total_price: '7499.00', minimum_to_pay: 4999 } ]
    // const { rows, rowCount } = await pool.query(
    //   `SELECT
    //       SUM(batch_fee) AS total_price,
    //       CAST(SUM(batch_fee * (min_pay_percentage / 100.0)) AS INT) AS minimum_to_pay
    //    FROM course_batches WHERE batch_id IN (${paramsSql}
    //    `,
    //   batchIds
    // );

    // const { rows, rowCount } = await client.query(
    //   `SELECT
    //       STRING_AGG(course_id::TEXT, ',') as course_ids,
    //       SUM(batch_fee) AS total_price,
    //       CAST(SUM(batch_fee * (min_pay_percentage / 100.0)) AS INT) AS minimum_to_pay
    //    FROM course_batches WHERE batch_id IN (${paramsSql})
    //    `,
    //   batchIds
    // );

    // const { rows, rowCount } = await pool.query(
    //   `
    //   WITH course_totals AS (
    //     SELECT
    //         start_date,
    //         end_date,
    //         course_id,
    //         SUM(batch_fee) AS total_price_per_course,
    //         CAST(SUM(batch_fee * (min_pay_percentage / 100.0)) AS INT) AS minimum_to_pay_per_course
    //     FROM course_batches
    //     WHERE batch_id IN (65, 66)
    //     GROUP BY start_date, end_date, course_id
    //    )
    //     SELECT
    //         course_id,
    //         start_date,
    //         end_date,
    //         SUM(total_price_per_course) OVER () AS total_price,
    //         SUM(minimum_to_pay_per_course) OVER () AS minimum_to_pay
    //     FROM course_totals;
    //   `
    // )

    const { rows, rowCount } = await pool.query(
      `
        SELECT
            c.course_id,
            cb.start_date,
            cb.end_date,
            CASE 
                WHEN MIN(cb.batch_total_seats) <= MIN(cb.batch_reserved_seats) THEN true 
                ELSE false 
            END AS is_waiting_list,
            SUM(cb.batch_fee) AS total_price,
            CAST(SUM(cb.batch_fee * (cb.min_pay_percentage / 100.0)) AS INT) AS minimum_to_pay,
            c.institute
        FROM course_batches cb

        LEFT JOIN courses AS c
        ON c.course_id = cb.course_id

        WHERE cb.batch_id IN (${paramsSql})
        GROUP BY c.course_id, cb.start_date, cb.end_date;

        `,
      batchIds
    );

    if (rowCount === 0) throw new ErrorHandler(404, "Course Doesn't found");

    if (hasOverlappingBatchDate(rows)) {
      throw new ErrorHandler(
        400,
        "You have selected two courses with the same date please delete one of them."
      );
    }

    const tokenInfo = {
      course_ids: "",
      total_price: 0,
      minimum_to_pay: 0,
      is_in_waiting_list: "",
      institutes: "",
    };

    rows.forEach((item, index) => {
      tokenInfo.course_ids +=
        index === 0 ? item.course_id : "," + item.course_id;
      tokenInfo.total_price += parseFloat(item.total_price);
      tokenInfo.minimum_to_pay += parseFloat(item.minimum_to_pay);
      tokenInfo.is_in_waiting_list +=
        index === 0 ? item.is_waiting_list : "," + item.is_waiting_list;
      tokenInfo.institutes +=
        index === 0 ? item.institute : "," + item.institute;
    });

    //create new order and send back to client side
    const { id } = await createOrder(
      payment_type === "Part-Payment"
        ? tokenInfo.minimum_to_pay * 100
        : tokenInfo.total_price * 100
    );

    const token_key = createToken(
      {
        ...tokenInfo,
        batch_ids: req.query.batch_ids,
        student_id: studentID,
        payment_type,
        order_id: id,
      },
      { expiresIn: "48h" }
    );

    res.status(201).json(
      new ApiResponse(201, "Order id has created", {
        // order_id: id,
        // amount,
        // razorpay_key: process.env.RAZORPAY_KEY_ID,
        token_key,
      })
    );
  }
);

export const getMultipleBatchWithId = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const ids = req.query.batch_ids?.toString().split(",") || [];

    const { rows } = await pool.query(
      `SELECT 
        cb.*,
        c.course_name,
        c.course_showing_order
       FROM course_batches cb
        LEFT JOIN courses c
        ON c.course_id = cb.course_id
       WHERE batch_id IN (${ids.map((_, index) => `$${index + 1}`)})`,
      ids
    );

    res.status(200).json(new ApiResponse(200, "Course Batches", rows));
  }
);

export const getCourseBatch = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = getScheduleCourseBatchValidator.validate(
      req.params
    );
    if (error) throw new ErrorHandler(400, error.message);

    const { LIMIT, OFFSET } = parsePagination(req);

    const { rows } = await pool.query(
      `
      SELECT 
          *, 
          CASE 
              WHEN end_date < CURRENT_DATE THEN 'Over' 
              ELSE visibility 
          END AS visibility
      FROM course_batches 
      WHERE course_id = $1 
      -- ORDER BY created_at DESC
      ORDER BY start_date ASC
      LIMIT ${LIMIT} OFFSET ${OFFSET}
    `,
      [req.params.course_id]
    );

    res.status(200).json(new ApiResponse(200, "Course Batches", rows));
  }
);

export const insertNewCourseBatch = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = scheduleCourseBatchValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const { columns, params, values } = objectToSqlInsert(value);
    await pool.query(
      `INSERT INTO course_batches ${columns} VALUES ${params}`,
      values
    );

    res.status(200).json(new ApiResponse(200, "New Batch Added Successfully"));
  }
);

export const updateCourseBatchInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = updateScheduleCourseBatchValidator.validate({
      ...req.body,
      ...req.params,
    });
    if (error) throw new ErrorHandler(400, error.message);

    delete req.body.start_date;
    delete req.body.end_date;

    const { keys, values, paramsNum } = objectToSqlConverterUpdate(value);
    values.push(req.params.batch_id);
    await pool.query(
      `UPDATE course_batches SET ${keys} WHERE batch_id = $${paramsNum}`,
      values
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Course Batch Info Successfully Updated"));
  }
);

export const deleteCourseBatch = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = deleteCourseBatchValidator.validate(req.params);
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(`DELETE FROM course_batches WHERE batch_id = $1`, [
      value.batch_id,
    ]);

    res.status(200).json(new ApiResponse(200, "Course Batch Has Removed"));
  }
);

export const getCoursesRequiredDocuments = asyncErrorHandler(
  async (req: Request, res: Response) => {
    // await new Promise((resolve) => setTimeout(() => resolve(""), 3000));

    const { error } = getRequiredDocumentsValidator.validate(req.query);
    if (error) throw new ErrorHandler(400, error.message);

    const courseIDs = req.query.course_ids?.toString().split(",") as string[];
    // const studentId = req.query.student_id;
    const studentId = res.locals.student_id ?? req.query.student_id ?? 0;

    const response = await transaction([
      {
        sql: `SELECT course_name, require_documents FROM courses WHERE course_id IN (${courseIDs?.map(
          (_, index) => `$${index + 1}`
        )})`,
        values: courseIDs,
      },

      {
        sql: `SELECT * FROM student_docs WHERE student_id = $1`,
        values: [studentId],
      },
    ]);

    res.status(200).json(
      new ApiResponse(200, "Courses Info", {
        courseDocumentsInfo: response[0].rows,
        studentsUploadedDocuments: response[1].rows,
      })
    );
  }
);

export const getCoursesForDropDown = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const institute = req.query.institute;
    let monthAndYear = req.query.month_year;
    const without_course_batches =
      req.query.without_course_batches === "true" ? true : false;
    if (without_course_batches) {
      monthAndYear = undefined;
    }
    const withFullBatchInfo =
      req.query.with_full_batch_info === "true" ? true : false;

    let filter = "";
    const valueToStore: string[] = [];

    if (institute) {
      filter = "WHERE institute = $1";
      valueToStore.push(institute.toString());
    }

    if (monthAndYear) {
      if (filter === "") {
        filter = "WHERE TO_CHAR(cb.start_date, 'YYYY-MM') = $1";
      } else {
        filter += " AND TO_CHAR(cb.start_date, 'YYYY-MM') = $2";
      }

      valueToStore.push(monthAndYear.toString());
    }

    const { rows } = await pool.query(
      `
        SELECT 
          c.course_id, 
          c.course_name
          ${
            without_course_batches
              ? ""
              : `
              , COALESCE(
              ${
                withFullBatchInfo
                  ? "JSON_AGG(JSON_OBJECT('batch_id' : cb.batch_id, 'start_date' : cb.start_date) ORDER BY cb.created_at DESC)"
                  : "JSON_AGG(cb.start_date ORDER BY cb.created_at DESC)"
              }
               
              FILTER (WHERE cb.course_id IS NOT NULL), 
              '[]'::json
            ) AS course_batches
            `
          }
          
        FROM ${table_name} AS c
        ${
          without_course_batches
            ? ""
            : `
          LEFT JOIN course_batches AS cb
          ON cb.course_id = c.course_id
        `
        }
        

        ${filter}
        
        GROUP BY c.course_id
      `,
      valueToStore
    );
    res.status(200).json(new ApiResponse(200, "Courses For Dropdown", rows));
  }
);

export const changeBatchManually = asyncErrorHandler(async (req, res) => {
  const { error, value } = VchangeBatchManually.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  await transaction([
    {
      sql: `
        UPDATE enrolled_batches_courses 
        SET batch_id = $1 
        WHERE student_id = $2 AND course_id = $3 AND batch_id = $4
      `,
      values: [
        value.new_batch_id,
        value.student_id,
        value.course_id,
        value.old_batch_id,
      ],
    },

    {
      sql: `
        UPDATE payments
        SET batch_id = $1
        WHERE student_id = $2 AND course_id = $3 AND batch_id = $4
      `,
      values: [
        value.new_batch_id,
        value.student_id,
        value.course_id,
        value.old_batch_id,
      ],
    },

    {
      sql: `
        INSERT INTO batch_modified_by (employee_id, batch_id)
        VALUES ($1, $2)
        ON CONFLICT(employee_id, batch_id) DO NOTHING;
      `,
      values: [res.locals.employee_id, value.new_batch_id],
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, "Student Batch Date Successfully Updated"));
});

type InfoType = {
  course_id: number;
  course_name: string;
  course_code: string;
  subjects: string; // comma separated string
  faculty_details: {
    subject: string; // comma separated string
    faculty_id: number;
    faculty_name: string;
    max_teaching_hrs_per_week: string;
    faculty_current_working_hours: number;
    is_active: boolean;
    profile_image: string;
  }[];
};

// type TFaculty = {
//   for_subject_name: string;
//   faculty_id: number;
//   faculty_name: string;
//   profile_image: string;
// };

// type TTimeTable = {
//   course_id: number;
//   course_name: string;
//   course_code: string;
//   subjects: string[];
//   faculty: TFaculty[];

//   // subject_with_faculty: {
//   //   subject_name: string;
//   //   faculty: {
//   //     faculty_id: number;
//   //     faculty_name: string;
//   //     profile_image: string;
//   //   }[];
//   // }[];
// };

type TFacultyInfo = {
  faculty_id: number;
  faculty_name: string;
  profile_image: string;
};

// type TOutput1 = {
//   course_id: number;
//   course_name: string;
//   course_code: string;
//   sub_fac: {
//     subject_name: string;
//     faculty: TFacultyInfo[];
//   }[];
// };

// export const generateTimeTable2 = asyncErrorHandler(async (req, res) => {
//   const { error, value } = VTimeTable.validate(req.query);
//   if (error) throw new ErrorHandler(400, error.message);

//   const cDate = new Date(value.date);
//   if (cDate.getDay() === 0) {
//     throw new ErrorHandler(
//       405,
//       `You can't prepare time table as it is "Sunday"`
//     );
//   }

//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     const { rowCount, rows: holidayInfo } = await client.query(
//       `SELECT holiday_name FROM holiday_management WHERE holiday_date = $1 AND institute = $2`,
//       [value.date, value.institute]
//     );

//     if (rowCount !== 0)
//       throw new ErrorHandler(
//         405,
//         `You can't prepare time table as it is Holiday "${holidayInfo[0].holiday_name}"`
//       );

//     const { rows: dreftData, rowCount: dreftCount } = await client.query(
//       `SELECT * FROM time_table_draft WHERE date = $1`,
//       [value.date]
//     );
//     const { rows } = await client.query(
//       `
//             SELECT
//               c.course_id,
//               c.course_name,
//               c.course_code,
//               c.subjects,
//               COALESCE(
//                   (
//                       SELECT json_agg(
//                           jsonb_build_object(
//                               'faculty_id', fwcs.faculty_id,
//                               'subject', fwcs.subject,
//                               'faculty_name', e.name,
//                               'profile_image', e.profile_image,
//                               'max_teaching_hrs_per_week', CASE WHEN e.max_teaching_hrs_per_week = '' THEN '0' ELSE e.max_teaching_hrs_per_week END,
//                               'faculty_current_working_hours', e.faculty_current_working_hours,
//                               'is_active', e.is_active
//                           )
//                       )
//                       FROM faculty_with_course_subject fwcs
//                       INNER JOIN employee e ON e.id = fwcs.faculty_id
//                       WHERE fwcs.course_id = c.course_id AND e.is_active = true
//                   ),
//                   '[]'::json
//               ) AS faculty_details
//             FROM courses c
//             INNER JOIN course_batches cb ON cb.course_id = c.course_id
              
//             WHERE c.institute = $1 AND $2 BETWEEN cb.start_date AND cb.end_date
    
//             GROUP BY c.course_id
//         `,
//       [value.institute, value.date]
//     );

//     const databasedata = rows as InfoType[];

//     const outputs: TOutput1[] = [];

//     const existFacAndPositions = new Map<number, number[]>();

//     databasedata.forEach((data) => {
//       const subjects = data.subjects.split(",");

//       const tempData: TOutput1 = {
//         course_id: data.course_id,
//         course_code: data.course_code,
//         course_name: data.course_name,
//         sub_fac: [],
//       };

//       subjects.forEach((cSubject) => {
//         tempData.sub_fac.push({
//           subject_name: cSubject,
//           faculty: data.faculty_details
//             .filter((fac) => fac.subject.includes(cSubject))
//             .map((item) => {
//               // const tempExist = existFacAndPositions.get(item.faculty_id);
//               // if (!tempExist) {
//               //   existFacAndPositions.set(item.faculty_id, [index]);
//               // } else {
//               //   existFacAndPositions.set(item.faculty_id, [
//               //     ...tempExist,
//               //     index,
//               //   ]);
//               // }

//               return {
//                 faculty_id: item.faculty_id,
//                 faculty_name: item.faculty_name,
//                 profile_image: item.profile_image,
//               };
//             }),
//         });
//       });

//       outputs.push(tempData);
//     });

//     function doSwap (facPosition : number, i : number, c_fac_array : TFacultyInfo[]) {
//       // do the swap
//       const tempFacInfo = c_fac_array[i];
//       c_fac_array[i] = c_fac_array[facPosition];
//       c_fac_array[facPosition] = tempFacInfo;
//       existFacAndPositions.set(c_fac_array[i].faculty_id, [i]);
//     }

//     const checkAndSetFacPosition = (
//       c_fac_id: number,
//       facPosition: number,
//       c_fac_array: TFacultyInfo[]
//     ) => {
//       const facInfo = existFacAndPositions.get(c_fac_id);

//       if (!facInfo) {
//         existFacAndPositions.set(c_fac_id, [facPosition]);
//         return;
//       }

//       if (facPosition === 0 && facInfo.includes(0)) {
//         //if i got someone who alreay exist at first position and current facPosition is also 0 than need to take action
//         // what ? -> check that fac_array if i get any other fac who don't exist 0 th position swap him with current one
//         let gotSomeone = false;

//         for (let i = 0; i < c_fac_array.length; i++) {
//           if (c_fac_array[i].faculty_id === c_fac_id) continue;

//           const facInfo2 = existFacAndPositions.get(c_fac_array[i].faculty_id);
//           if (!facInfo2) {
//             doSwap(facPosition, i, c_fac_array);
//             gotSomeone = true;
//             existFacAndPositions.set(c_fac_array[i].faculty_id, [facPosition])
//             break;
//           } else if (!facInfo2.includes(0)){
//             doSwap(facPosition, i, c_fac_array);
//             gotSomeone = true;
//             existFacAndPositions.set(c_fac_array[i].faculty_id, [...facInfo2, facPosition])
//             break;
//           }
//         }
//         if (gotSomeone === false) {
//           // if i didn't got someone who is not present at 0th position that at the first add -1 as fac id
//           c_fac_array.unshift({
//             faculty_id: -1,
//             faculty_name: "Choose Faculty",
//             profile_image: "",
//           });
//         }
//       }
//     };

//     outputs.forEach((output) => {
//       output.sub_fac.forEach((item) => {
//         item.faculty.forEach((fac, facIndex) => {
//           checkAndSetFacPosition(fac.faculty_id, facIndex, item.faculty);
//         });
//       });
//     });

//     res.status(200).json(
//       new ApiResponse(200, "Time Table Info", {
//         time_table_info: outputs,
//         virtual_table: dreftCount === 0 ? null : dreftData[0].virtual_table,
//         draft_id: dreftCount === 0 ? -1 : dreftData[0].draft_id,
//       })
//     );

//     await client.query("COMMIT");
//     client.release();
//   } catch (error: any) {
//     await client.query("ROLLBACK");
//     client.release();
//     if (error?.isOperational) {
//       throw new ErrorHandler(error.statusCode, error.message);
//     } else {
//       throw new ErrorHandler(500, error.message);
//     }
//   }
// });

type TFaculty = {
  faculty_id: number;
  faculty_name: string;
  profile_image: string;
};

type TTimeTable = {
  course_id: number;
  course_name: string;
  course_code: string;
  sub_fac: {
    subject_name: string;
    faculty: TFaculty[];
  }[];
};

export const generateTimeTable2 = asyncErrorHandler(async (req, res) => {
  const { error, value } = VTimeTable.validate(req.query);
  if (error) throw new ErrorHandler(400, error.message);

  const cDate = new Date(value.date);
  if (cDate.getDay() === 0) {
    throw new ErrorHandler(
      405,
      `You can't prepare time table as it is "Sunday"`
    );
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rowCount, rows: holidayInfo } = await client.query(
      `SELECT holiday_name FROM holiday_management WHERE holiday_date = $1 AND institute = $2`,
      [value.date, value.institute]
    );

    if (rowCount !== 0)
      throw new ErrorHandler(
        405,
        `You can't prepare time table as it is Holiday "${holidayInfo[0].holiday_name}"`
      );

    const { rows: dreftData, rowCount: dreftCount } = await client.query(
      `SELECT * FROM time_table_draft WHERE date = $1`,
      [value.date]
    );
    const { rows } = await client.query(
      `
            SELECT
              c.course_id,
              c.course_name,
              c.course_code,
              c.subjects,
              COALESCE(
                  (
                      SELECT json_agg(
                          jsonb_build_object(
                              'faculty_id', fwcs.faculty_id,
                              'subject', fwcs.subject,
                              'faculty_name', e.name,
                              'profile_image', e.profile_image,
                              'max_teaching_hrs_per_week', CASE WHEN e.max_teaching_hrs_per_week = '' THEN '0' ELSE e.max_teaching_hrs_per_week END,
                              'faculty_current_working_hours', e.faculty_current_working_hours,
                              'is_active', e.is_active
                          )
                      )
                      FROM faculty_with_course_subject fwcs
                      INNER JOIN employee e ON e.id = fwcs.faculty_id
                      WHERE fwcs.course_id = c.course_id AND e.is_active = true
                  ),
                  '[]'::json
              ) AS faculty_details
            FROM courses c
            INNER JOIN course_batches cb ON cb.course_id = c.course_id
              
            WHERE c.institute = $1 AND $2 BETWEEN cb.start_date AND cb.end_date
    
            GROUP BY c.course_id
        `,
      [value.institute, value.date]
    );

    const databasedata = rows as InfoType[];

    const output: TTimeTable[] = [];
    const existFac = new Map<
    number,
    {
      parent_index: number;
      child_index: number;
      positions: number[];
    }
  >();

    databasedata.forEach((data, pIndex) => {
      const subjects = data.subjects.split(",");

      const tempData: TTimeTable = {
        course_code: data.course_code,
        course_id: data.course_id,
        course_name: data.course_name,
        sub_fac: [],
      };

      subjects.forEach((subject, cIndex) => {
        const fac_to_store: TFaculty[] = [];
        const temp_fac_list: TFaculty[] = [];

        data.faculty_details.forEach((fac) => {
          if (!fac.subject.includes(subject)) return;

          const currentPosition = fac_to_store.length;
          const existFacInfo = existFac.get(fac.faculty_id);
          if (!existFacInfo || !existFacInfo.positions.includes(0)) {
            existFac.set(fac.faculty_id, {
              positions: [...(existFacInfo?.positions || []), currentPosition],
              parent_index: pIndex,
              child_index: cIndex,
            });
            fac_to_store.push({
              faculty_id : fac.faculty_id,
              faculty_name : fac.faculty_name,
              profile_image : fac.profile_image
            });
            return;
          }

          temp_fac_list.push({
            faculty_id : fac.faculty_id,
            faculty_name : fac.faculty_name,
            profile_image : fac.profile_image
          });
        });

        if (fac_to_store.length !== 0) {
          fac_to_store.push(...temp_fac_list)
          tempData.sub_fac.push({
            subject_name : subject,
            faculty: fac_to_store,
          });
          return;
        }

        // this mean in my current array i don't have anyone who it not teaching
        let facWhomSwap : TFaculty | null = null;
        for(let i = 0; i < temp_fac_list.length; i++) {
          const existTempFacInfo = existFac.get(temp_fac_list[i].faculty_id);
          if(!existTempFacInfo) throw new Error("existTempFacInfo Fac Id Should Be Here"); // it should be here

          // if no output don't need to check
          if(!output[existTempFacInfo.parent_index]) continue;

          const index = output[existTempFacInfo.parent_index].sub_fac[existTempFacInfo.child_index].faculty.findIndex(oldFac => oldFac.faculty_id !== temp_fac_list[i].faculty_id && !existFac.get(oldFac.faculty_id)?.positions.includes(0))
          // mean there is no fac avilable to swap with current one
          if(index === -1) continue;

          // now if i got someone unusal swap him with first position item
          const tempFacInfo = output[existTempFacInfo.parent_index].sub_fac[existTempFacInfo.child_index].faculty[0];
          output[existTempFacInfo.parent_index].sub_fac[existTempFacInfo.child_index].faculty[0] = output[existTempFacInfo.parent_index].sub_fac[existTempFacInfo.child_index].faculty[index];
          output[existTempFacInfo.parent_index].sub_fac[existTempFacInfo.child_index].faculty[index] = tempFacInfo;
          //after swaping remamber to change the positions of swaped fac in existFac map data stracture

          const whomSetAtTopId = output[existTempFacInfo.parent_index].sub_fac[existTempFacInfo.child_index].faculty[0].faculty_id
          const whomSetAtTopInfo = existFac.get(whomSetAtTopId);
          if(!whomSetAtTopInfo) throw new Error("whomSetAtTopInfo Should Be Here");

          existFac.set(whomSetAtTopId, {
            ...whomSetAtTopInfo,
            positions : [0, ...whomSetAtTopInfo.positions]
          })
          facWhomSwap = temp_fac_list[i];
          break;
        }

        if(!facWhomSwap){
          // if i didn't get anyone with replace than at the first position add -1 as fac id (as empty fac)
          if(temp_fac_list.length !== 0) {
            fac_to_store.push({
              faculty_id : -1,
              faculty_name : "Choose Faculty",
              profile_image : ""
            }, ...temp_fac_list);
          }

          tempData.sub_fac.push({
            subject_name : subject,
            faculty: fac_to_store,
          });
          return;
        }

        fac_to_store.push(
          facWhomSwap,
          ...temp_fac_list.filter(item => item.faculty_id !== facWhomSwap.faculty_id)
        );
        tempData.sub_fac.push({
          subject_name : subject,
          faculty: fac_to_store,
        });

      });

      output.push(tempData);
    });

    res.status(200).json(
      new ApiResponse(200, "Time Table Info", {
        time_table_info: output,
        virtual_table: dreftCount === 0 ? null : dreftData[0].virtual_table,
        draft_id: dreftCount === 0 ? -1 : dreftData[0].draft_id,
      })
    );

    await client.query("COMMIT");
    client.release();
  } catch (error: any) {
    await client.query("ROLLBACK");
    client.release();
    if (error?.isOperational) {
      throw new ErrorHandler(error.statusCode, error.message);
    } else {
      throw new ErrorHandler(500, error.message);
    }
  }
});

// export const generateTimeTable = asyncErrorHandler(async (req, res) => {
//   const { error, value } = VTimeTable.validate(req.query);
//   if (error) throw new ErrorHandler(400, error.message);

//   const cDate = new Date(value.date);
//   if (cDate.getDay() === 0) {
//     throw new ErrorHandler(
//       405,
//       `You can't prepare time table as it is "Sunday"`
//     );
//   }

//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     const { rowCount, rows: holidayInfo } = await client.query(
//       `SELECT holiday_name FROM holiday_management WHERE holiday_date = $1 AND institute = $2`,
//       [value.date, value.institute]
//     );

//     if (rowCount !== 0)
//       throw new ErrorHandler(
//         405,
//         `You can't prepare time table as it is Holiday "${holidayInfo[0].holiday_name}"`
//       );

//     const { rows: dreftData, rowCount: dreftCount } = await client.query(
//       `SELECT * FROM time_table_draft WHERE date = $1`,
//       [value.date]
//     );
//     if (dreftCount !== 0) {
//       return res.status(200).json(
//         new ApiResponse(200, "Time Table Info", {
//           type: "draft",
//           result: dreftData[0],
//         })
//       );
//     }

//     const { rows } = await client.query(
//       `
//             SELECT
//               c.course_id,
//               c.course_name,
//               c.course_code,
//               c.subjects,
//               COALESCE(
//                   (
//                       SELECT json_agg(
//                           jsonb_build_object(
//                               'faculty_id', fwcs.faculty_id,
//                               'subject', fwcs.subject,
//                               'faculty_name', e.name,
//                               'profile_image', e.profile_image,
//                               'max_teaching_hrs_per_week', CASE WHEN e.max_teaching_hrs_per_week = '' THEN '0' ELSE e.max_teaching_hrs_per_week END,
//                               'faculty_current_working_hours', e.faculty_current_working_hours,
//                               'is_active', e.is_active
//                           )
//                       )
//                       FROM faculty_with_course_subject fwcs
//                       INNER JOIN employee e ON e.id = fwcs.faculty_id
//                       WHERE fwcs.course_id = c.course_id AND e.is_active = true
//                   ),
//                   '[]'::json
//               ) AS faculty_details
//             FROM courses c
//             INNER JOIN course_batches cb ON cb.course_id = c.course_id
              
//             WHERE c.institute = $1 AND $2 BETWEEN cb.start_date AND cb.end_date
    
//             GROUP BY c.course_id
//         `,
//       [value.institute, value.date]
//     );

//     const outputs = rows as InfoType[];

//     const results: TTimeTable[] = [];
//     const map = new Map<
//       number,
//       {
//         pIndex: number;
//         facPosition: number;
//         forSubject: string;
//       }
//     >();

//     outputs.forEach((output, pIndex) => {
//       const subjects = output.subjects.split(",");

//       const time_table: TTimeTable = {
//         course_name: output.course_name,
//         course_code: output.course_code,
//         course_id: output.course_id,
//         subjects: subjects,
//         faculty: [],
//       };

//       //
//       subjects.forEach((subject) => {
//         const current_fac_array: TFaculty[] = [];
//         const temp: TFaculty[] = [];

//         output.faculty_details.forEach((loopFac) => {
//           // check current employee teaching current subject or not
//           if (loopFac.subject.includes(subject)) {
//             const facInfoToStore = {
//               faculty_id: loopFac.faculty_id,
//               faculty_name: loopFac.faculty_name,
//               for_subject_name: subject,
//               profile_image: loopFac.profile_image,
//             };
//             const myCurrentPosition = time_table.faculty.filter(
//               (item) => item.for_subject_name === subject
//             ).length;
//             const mapInfo = map.get(loopFac.faculty_id);
//             if (
//               mapInfo &&
//               mapInfo.facPosition === 0 &&
//               myCurrentPosition === 0
//             ) {
//               temp.push(facInfoToStore);
//             } else {
//               // time_table.faculty.push(facInfoToStore)
//               current_fac_array.push(facInfoToStore);

//               map.set(loopFac.faculty_id, {
//                 pIndex,
//                 facPosition: myCurrentPosition,
//                 forSubject: subject,
//               });
//             }
//           }
//         });

//         if (current_fac_array.length === 0 && temp.length !== 0) {
//           current_fac_array.push({
//             faculty_id: -1,
//             faculty_name: "Choose Faculty",
//             for_subject_name: subject,
//             profile_image: "",
//           });
//         }

//         current_fac_array.push(...temp);

//         time_table.faculty.push(...current_fac_array);
//       });

//       results.push(time_table);
//     });

//     res.status(200).json(
//       new ApiResponse(200, "Time Table Info", {
//         type: "generated",
//         result: results,
//       })
//     );

//     await client.query("COMMIT");
//     client.release();
//   } catch (error: any) {
//     await client.query("ROLLBACK");
//     client.release();
//     if (error?.isOperational) {
//       throw new ErrorHandler(error.statusCode, error.message);
//     } else {
//       throw new ErrorHandler(500, error.message);
//     }
//   }
// });

export const saveTimeTable = asyncErrorHandler(async (req, res) => {
  const { error, value } = VSaveTimeTable.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `DELETE FROM time_table_draft WHERE date = $1 AND institute = $2`,
      [value.date, value.institute]
    );

    const { rowCount } = await client.query(
      `SELECT date FROM time_table WHERE date = $1`,
      [value.date]
    );

    if (rowCount && rowCount > 0)
      throw new ErrorHandler(400, "Time Table Has Already Saved");

    //increase each employee current_working_hours + 1
    await client.query(
      `
        UPDATE employee SET 
          faculty_current_working_hours = faculty_current_working_hours + 1
        WHERE id IN (${value.faculty_ids.map(
          (_: any, index: number) => `$${index + 1}`
        )})
      `,
      value.faculty_ids
    );

    await client.query(
      `
      INSERT INTO 
        time_table (date, time_table_data, total_rows, institute)
      VALUES
         ($1, $2, $3, $4)
      `,
      [value.date, value.time_table_data, value.total_rows, value.institute]
    );

    await client.query("COMMIT");
    client.release();
  } catch (error: any) {
    await client.query("ROLLBACK");
    client.release();
    throw new ErrorHandler(400, error.message);
  }

  res.status(200).json(new ApiResponse(200, "Time table saved successfully"));
});

export const draftTimeTable = asyncErrorHandler(async (req, res) => {
  const { error, value } = VDraftTimeTable.validate(req.body);
  if (error) throw new ErrorHandler(400, error.message);

  await pool.query(
    `
    INSERT INTO time_table_draft (date, institute, virtual_table)
    VALUES ($1, $2, $3)
    ON CONFLICT (date, institute) DO UPDATE SET virtual_table = $3
    `,
    [value.date, value.institute, value.virtual_table]
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Time Table Has Been Saved In Draft, You Can Edit It Later Before Saving It In Database"
      )
    );
});

export const removeFromDraft = asyncErrorHandler(async (req, res) => {
  await pool.query(`DELETE FROM time_table_draft WHERE draft_id = $1`, [
    req.params.draft_id,
  ]);
  res.status(200).json(new ApiResponse(200, "Time Table Removed From Draft"));
});
