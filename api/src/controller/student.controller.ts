import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import {
  fillUpFormValidator,
  resendOtpValidator,
  saveIndosNumberValidator,
  saveStudentDocumentValidator,
  sendResetPasswordEmailValidator,
  setNewPasswordValidator,
  studentLoginValidator,
  studentRegisterValidator,
  verifyOtpValidator,
} from "../validator/student.validator";
import { ErrorHandler } from "../utils/ErrorHandler";
import bcrypt from "bcrypt";
import {
  objectToSqlConverterUpdate,
  objectToSqlInsert,
} from "../utils/objectToSql";
import { pool } from "../config/db";
import { ApiResponse } from "../utils/ApiResponse";
import { createToken, verifyToken } from "../utils/token";
import { sendEmail } from "../utils/sendEmail";
import { sendOtp } from "../utils/sendOtp";
import { sqlPlaceholderCreator } from "../utils/sql/sqlPlaceholderCreator";

const table_name = "students";

export const getStudentInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const studentIdFromToken = res.locals.student_id;

    // const { rowCount, rows } = await pool.query(
    //   `SELECT student_id, indos_number, name, email, mobile_number, dob, profile_image FROM ${table_name} WHERE student_id = $1`,
    //   [studentIdFromToken]
    // );

    // if (rowCount === 0) throw new ErrorHandler(404, "No Date Found");
    // res.status(200).json(new ApiResponse(200, "All Student Date", rows[0]));

    // const query = `
    //   SELECT
    // s.student_id,
    // s.name,
    // s.email,
    // s.mobile_number,
    // s.dob,
    // s.profile_image,
    // s.indos_number,

    //       c.course_id,
    //       c.course_name,
    //       c.require_documents,
    //       c.course_duration,
    //       c.total_seats,
    //       c.remain_seats,
    //       c.created_at
    //   FROM
    //       ${table_name} s
    //   LEFT JOIN
    //       enrolled_batches_courses ec ON s.student_id = ec.student_id
    //   LEFT JOIN
    //       courses c ON ec.course_id = c.course_id
    //   WHERE
    //       s.student_id = $1`;

    // const query = `
    //   SELECT
    //     s.student_id,
    //     s.name,
    //     s.email,
    //     s.mobile_number,
    //     s.dob,
    //     s.profile_image,
    //     s.indos_number,
    //     json_agg(
    //       json_build_object(
    //         'course_id', c.course_id,
    //         'course_code', c.course_code,
    //         'course_name', c.course_name,
    //         'institute', c.institute,
    //         'course_type', c.course_type,
    //         'require_documents', c.require_documents,
    //         'course_duration', c.course_duration,
    //         'course_fee', c.course_fee,
    //         'min_pay_percentage', c.min_pay_percentage,
    //         'total_seats', c.total_seats,
    //         'remain_seats', c.remain_seats,
    //         'course_visibility', c.course_visibility,
    //         'course_update_time', c.course_update_time,
    //         'created_at', c.created_at,
    //         -- 'enrolled_batch_info', cb.*
    //         'enrolled_batch_date', cb.start_date,
    //         'batch_fee', cb.batch_fee
    //       )
    //     ) as courses

    //   FROM
    //      ${table_name} AS s
    //   LEFT JOIN
    //       enrolled_batches_courses AS ebc ON s.student_id = ebc.student_id
    //   LEFT JOIN
    //       courses AS c ON ebc.course_id = c.course_id
    //   LEFT JOIN
    //       course_batches AS cb ON cb.batch_id = ebc.batch_id
    //   LEFT JOIN
    //        payments AS p ON p.form_id = ebc.form_id
    //   WHERE
    //     s.student_id = $1

    //   GROUP BY s.student_id
    // `

    const query = `
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
            s.student_id, 
            s.name, 
            s.email, 
            s.mobile_number, 
            s.dob, 
            s.profile_image,
            s.indos_number,
            COALESCE(
                json_agg(
                    json_build_object(
                        'course_id', c.course_id,
                        'course_code', c.course_code,
                        'course_name', c.course_name,
                        'institute', c.institute,
                        'course_type', c.course_type,
                        'require_documents', c.require_documents,
                        'course_duration', c.course_duration,
                        'course_fee', c.course_fee,
                        'min_pay_percentage', c.min_pay_percentage,
                        'total_seats', c.total_seats,
                        'remain_seats', c.remain_seats,
                        'course_visibility', c.course_visibility,
                        'course_update_time', c.course_update_time,
                        'created_at', c.created_at,
                        'enrolled_batch_date', cb.start_date,
                        'enrollment_status', ebc.enrollment_status,
                        'enrolled_batch_id', cb.batch_id,
                        'due_amount', cb.batch_fee - COALESCE(ap.total_paid, 0)
                    )
                ) FILTER (WHERE c.course_id IS NOT NULL), 
                '[]'::json
            ) AS courses
        FROM 
            ${table_name} AS s
        LEFT JOIN 
            enrolled_batches_courses AS ebc ON s.student_id = ebc.student_id 
        LEFT JOIN
            courses AS c ON ebc.course_id = c.course_id
        LEFT JOIN
            course_batches AS cb ON cb.batch_id = ebc.batch_id
        LEFT JOIN
            aggregated_payments AS ap ON ap.batch_id = cb.batch_id
        WHERE 
            s.student_id = $1
        GROUP BY 
            s.student_id;
    `;

    const { rows } = await pool.query(query, [studentIdFromToken]);

    // const studentData = {
    //   student_id: rows[0]?.student_id,
    //   name: rows[0]?.name,
    //   email: rows[0]?.email,
    //   mobile_number: rows[0]?.mobile_number,
    //   dob: rows[0]?.dob,
    //   profile_image: rows[0]?.profile_image,
    //   indos_number: rows[0]?.indos_number,
    //   courses: rows
    //     .map((row) => ({
    //       course_id: row.course_id,
    //       course_name: row.course_name,
    //       require_documents: row.require_documents,
    //       course_duration: row.course_duration,
    //       total_seats: row.total_seats,
    //       remain_seats: row.remain_seats,
    //       created_at: row.created_at,
    //     }))
    //     .filter((course) => course.course_id !== null), // Filter out null courses
    // };

    res.status(200).json(new ApiResponse(200, "Student Informations", rows[0]));
  }
);

export const registerStudent = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = studentRegisterValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const { rowCount } = await pool.query(
      `SELECT email FROM ${table_name} WHERE email = $1`,
      [value.email]
    );

    if (rowCount !== 0)
      throw new ErrorHandler(409, "Account Already Exist Please Login");

    await sendOtp(value.email);

    res
      .status(200)
      .json(
        new ApiResponse(200, "Otp Has Sended To This Email : " + value.email)
      );
  }
);

export const verifyOtp = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = verifyOtpValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    try {
      const { rows, rowCount } = await pool.query(
        `SELECT * FROM otps WHERE email = $1`,
        [value.email]
      );
      if (rowCount === 0) throw new ErrorHandler(400, "Send OTP First");

      if (rows[0].otp != value.otp) throw new ErrorHandler(400, "Wrong OTP");

      const hashedPassword = await bcrypt.hash(value.password, 10);
      value.password = hashedPassword;

      delete value.otp;

      const { columns, params, values } = objectToSqlInsert(value);

      await pool.query(
        `INSERT INTO ${table_name} ${columns} VALUES ${params}`,
        values
      );

      res
        .status(201)
        .json(new ApiResponse(201, "Registration Successfully Completed"));
    } catch (error) {
      console.log(error);
      throw new ErrorHandler(400, "error");
    }
  }
);

export const resendOtp = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = resendOtpValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    await sendOtp(value.email);

    res.status(200).json(new ApiResponse(200, "Otp Resended"));
  }
);

export const loginStudent = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = studentLoginValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const { rows, rowCount } = await pool.query(
      `
      SELECT 
        s.student_id, s.indos_number, s.name, s.password, s.profile_image,
        COALESCE(json_agg(ebc.*) FILTER (WHERE ebc.* IS NOT NULL), '[]'::json) as enrolled_courses
      FROM ${table_name} AS s
      LEFT JOIN 
        enrolled_batches_courses AS ebc ON ebc.student_id = s.student_id
      WHERE s.email = $1 OR s.indos_number = $1
      GROUP BY s.student_id
      `,
      [value.email]
    );

    if (rowCount === 0) throw new ErrorHandler(404, "Please register first");

    const storedHashedPassword = rows[0].password;
    const isMatch = await bcrypt.compare(value.password, storedHashedPassword);

    if (!isMatch) {
      throw new ErrorHandler(400, "Wrong username or password");
    }

    // create jwt token and send back to user
    const token = createToken(
      {
        role: "Student",
        indos_number: rows[0].indos_number,
        name: rows[0].name,
        student_id: rows[0].student_id,
      },
      { expiresIn: "7d" }
    );

    rows[0].password = "******";

    res.status(200).json(
      new ApiResponse(200, "Login completed successfully", {
        token,
        profile_image: rows[0].profile_image,
        enrolled_courses: rows[0].enrolled_courses,
      })
    );
  }
);

export const sendResetPasswordEmail = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = sendResetPasswordEmailValidator.validate(req.body);

    if (error) throw new ErrorHandler(400, error.message);

    const { rowCount, rows } = await pool.query(
      `SELECT student_id, email FROM ${table_name} WHERE email = $1`,
      [value.email]
    );

    if (rowCount === 0)
      throw new ErrorHandler(404, "You don't have any account");

    const token = createToken(
      {
        student_id: rows[0].student_id,
      },
      { expiresIn: "5m" }
    );

    await sendEmail(value.email, "RESET_PASSWORD", {
      resetPasswordLink: `${process.env.FRONTEND_HOST}/student/change-password/${token}`,
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Password reset email has sended to this email : " + value.email
        )
      );
  }
);

export const setNewPassword = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = setNewPasswordValidator.validate(req.body);

    if (error) throw new ErrorHandler(400, error.message);

    const { error: jwtError, data: jwtDate } = await verifyToken<{
      student_id: string;
    }>(value.token);

    if (jwtError) {
      throw new ErrorHandler(400, "Invalid Token");
    }

    //get student_id from token data and do student database manupulation
    const newHashedPassword = await bcrypt.hash(value.new_password, 10);

    //set password
    await pool.query(
      `UPDATE ${table_name} SET password = $1 WHERE student_id = $2`,
      [newHashedPassword, jwtDate?.student_id]
    );

    res.status(200).json(new ApiResponse(200, "Password Changed Successfully"));
  }
);

export const uploadProfileImage = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const studentId = req.body.student_id || null;
    const profilUrl = req.file?.path;

    if (!studentId) throw new ErrorHandler(400, "'student_id' is required");

    await pool.query(
      `UPDATE ${table_name} SET profile_image = $1 WHERE student_id = $2`,
      [profilUrl, req.body.student_id]
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, "Profile Image Successfully Updated", profilUrl)
      );
  }
);

export const saveStudentForm = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = fillUpFormValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const studentId = res.locals.student_id;

    const { keys, paramsNum, values } = objectToSqlConverterUpdate(req.body);
    values.push(studentId);

    await pool.query(
      `UPDATE students SET ${keys} WHERE student_id = $${paramsNum}`,
      values
    );

    res.status(200).json(new ApiResponse(200, "Student Form Info Saved"));
  }
);

export const saveIndosNumber = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error } = saveIndosNumberValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const studentId = res.locals.student_id;

    await pool.query(
      `UPDATE ${table_name} SET indos_number = $1 WHERE student_id = $2`,
      [req.body.indos_number, studentId]
    );

    res.status(200).json(new ApiResponse(200, "Indos Number Saved"));
  }
);

export const saveStudentDocument = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = saveStudentDocumentValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const studentId = parseInt(res.locals.student_id);

    await pool.query(
      `
      INSERT INTO student_docs (student_id, doc_id, doc_uri, doc_name)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (student_id, doc_id)
      DO UPDATE SET
          doc_uri = EXCLUDED.doc_uri,
          doc_name = EXCLUDED.doc_name;
  `,
      [studentId, value.doc_id, value.doc_uri, value.doc_name]
    );

    res
      .status(201)
      .json(new ApiResponse(201, "Document Has Successfully Uploaded"));
  }
);
