import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import {
  getAdmissionsService,
  getSingleAdmissionInfo,
} from "../service/admission.service";
import { ApiResponse } from "../utils/ApiResponse";
import { ErrorHandler } from "../utils/ErrorHandler";
import {
  saveAdmissionInfoValidator,
  updateEnrollCourseStatusValidator,
  updateFormStatusValidator,
  VCreateAdmission,
  viewStudentsDocumentsValidator,
} from "../validator/admission.validator";
import { pool } from "../config/db";
import { objectToSqlConverterUpdate } from "../utils/objectToSql";
import { transaction } from "../utils/transaction";
import { tryCatch } from "../utils/tryCatch";
import { sqlPlaceholderCreator } from "../utils/sql/sqlPlaceholderCreator";
import bcrypt from "bcrypt";

import { DatabaseError } from "pg";

const date = new Date();

export const getAdmissions = asyncErrorHandler(
  async (req: Request, res: Response) => {
    // const course_id = req.query.course_id;
    // const institute = req.query.institute;
    // const batch_date = req.query.batch_date;
    const form_id = req.query?.["form-id"];

    //get single admission data
    if (form_id) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "",
            await getSingleAdmissionInfo(form_id as string)
          )
        );
    }

    //get all admission data
    res
      .status(200)
      .json(
        new ApiResponse(200, "", await getAdmissionsService(req.query, req))
      );
  }
);

export const saveAdmissionInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = saveAdmissionInfoValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const formStatus = value.form_status;
    delete value.form_status;
    const formId = value.form_id;
    delete value.form_id;

    const studentId = value.student_id;
    delete value.student_id;

    const {
      keys,
      paramsNum,
      values: sqlValues,
    } = objectToSqlConverterUpdate(value);
    sqlValues.push(studentId);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(`UPDATE students SET ${keys} WHERE student_id = $${paramsNum}`, sqlValues);
      
      await client.query(`UPDATE fillup_forms SET form_status = $1 WHERE form_id = $2`, [formStatus, formId]);

      await client.query(`UPDATE enrolled_batches_courses SET enrollment_status = $1 WHERE form_id = $2`, [formStatus, formId])

      res.status(200).json(new ApiResponse(200, "Admission Info Successfully Updated"));

      await client.query("COMMIT");
      client.release();
    } catch (error) {
      await client.query("ROLLBACK");
      client.release();

      if (error instanceof DatabaseError) {
        if(error.code === "23505") {
          throw new ErrorHandler(400, "This mobile number is already registered. Please try another one.", "mobile_number");
        } else {
          throw new ErrorHandler(500, "Error updating student admission data");
        }
      } else {
        throw new ErrorHandler(500, "Error updating student admission data");
      }
    }
  }
);

export const updateEnrollCourseStatus = asyncErrorHandler(
  async (req: Request, res: Response) => {
    // await new Promise((resolve) => setTimeout(() => resolve(""), 3000));

    const { error, value } = updateEnrollCourseStatusValidator.validate({
      ...req.body,
      ...req.params,
    });
    if (error) throw new ErrorHandler(400, error.message);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { rows } = await client.query(
        `UPDATE enrolled_batches_courses SET enrollment_status = $1 WHERE enroll_id = $2 RETURNING course_id, student_id, batch_id`,
        [value.enrollment_status, value.enroll_id]
      );

      if (value.enrollment_status === "Approve") {
        await client.query(
          `
          DELETE FROM payments WHERE student_id = $1 AND course_id = $2 AND batch_id = $3 AND paid_amount < 0
          `,
          [rows[0].student_id, rows[0].course_id, rows[0].batch_id]
        );
      }

      await client.query("COMMIT");
      client.release();
    } catch (error: any) {
      await client.query("ROLLBACK");
      client.release();
      throw new ErrorHandler(400, error.message);
    }

    res.status(200).json(new ApiResponse(200, "Status Successfully Updated"));
  }
);

export const updateFormStatus = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = updateFormStatusValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    await transaction([
      {
        sql: `UPDATE fillup_forms SET form_status = $1 WHERE form_id = $2`,
        values: [value.form_status, value.form_id],
      },
      {
        sql: `UPDATE enrolled_batches_courses SET enrollment_status = $1 WHERE form_id = $2`,
        values: [value.form_status, value.form_id],
      },
    ]);

    res
      .status(200)
      .json(new ApiResponse(200, "Form Status Successfully Updated"));
  }
);

//from CRM only
export const viewStudentUploadedDocuments = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = viewStudentsDocumentsValidator.validate(
      req.params
    );
    if (error) throw new ErrorHandler(400, error.message);

    const { rows } = await pool.query(
      `SELECT * FROM student_docs WHERE student_id = $1`,
      [value.student_id]
    );

    res.status(200).json(new ApiResponse(200, "", rows));
  }
);

export const createAdmission = asyncErrorHandler(async (req, res) => {
  const { error, value } = VCreateAdmission.validate(req.body);
  if (error)
    throw new ErrorHandler(400, error.message, error.details[0].context?.key);

  const client = await pool.connect();

  const { error: tryError, data } = await tryCatch(async () => {
    await client.query("BEGIN");

    const newHashedPassword = await bcrypt.hash(value.password, 10);

    //create students row
    const { rows: studentInfo, rowCount } = await client.query(
      `
    INSERT INTO students
      (name, email, mobile_number, rank, indos_number, nationality, permanent_address, present_address, dob, cdc_num, passport_num, coc_number, cert_of_completency, blood_group, allergic_or_medication, next_of_kin_name, relation_to_sel, emergency_number, number_of_the_cert, issued_by_institute, issued_by_institute_indos_number, institute, password)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
    ON CONFLICT (mobile_number) 
    DO UPDATE SET
     mobile_number = EXCLUDED.mobile_number
     WHERE FALSE -- Prevents any actual updates
    RETURNING student_id
    `,
      [
        value.name,
        value.email,
        value.mobile_number,
        value.rank,
        value.indos_number,
        value.nationality,
        value.permanent_address,
        value.present_address,
        value.dob,
        value.cdc_num,
        value.passport_num,
        value.coc_number,
        value.cert_of_completency,
        value.blood_group,
        value.allergic_or_medication,
        value.next_of_kin_name,
        value.relation_to_sel,
        value.emergency_number,
        value.number_of_the_cert,
        value.issued_by_institute,
        value.issued_by_institute_indos_number,
        value.institute,
        newHashedPassword,
      ]
    );
    if (rowCount === 0) {
      throw new ErrorHandler(
        400,
        "Student Mobile Number Already Exist Please Try Another One",
        "mobile_number"
      );
    }

    const student_id = studentInfo[0].student_id;

    // store data to fillup_forms (single row will created althoug if multiple course or batches enroll)
    const customFormIdPrefix = `${
      value.institute === "Kolkata" ? "KOL" : "FDB"
    }/FORM/${date.getFullYear()}/`;
    const { rows: formInfo } = await client.query(
      `
      INSERT INTO fillup_forms (form_id, student_id, form_status)
      VALUES ($1 || nextval('fillup_form_seq_id')::TEXT, $2, $3)
      RETURNING form_id
    `,
      [customFormIdPrefix, student_id, "Pending"]
    );

    const form_id = formInfo[0].form_id;

    const rows_of_enrolled_batches: string[] = [];

    value.course_info.forEach((cInfo: any) => {
      rows_of_enrolled_batches.push(
        cInfo.course_id,
        cInfo.batch_id,
        student_id,
        form_id,
        "",
        "Pending"
      );
    });

    await client.query(
      `INSERT INTO enrolled_batches_courses (course_id, batch_id, student_id, form_id, order_id, enrollment_status) 
        VALUES ${
          sqlPlaceholderCreator(6, value.course_info.length).placeholder
        }`,
      rows_of_enrolled_batches
    );

    await client.query("COMMIT");
    client.release();
    return { form_id, student_id };
  });

  if (tryError) {
    await client.query("ROLLBACK");
    client.release();
    if (
      tryError.message ===
      "Student Mobile Number Already Exist Please Try Another One"
    ) {
      throw new ErrorHandler(400, tryError.message, "mobile_number");
    }

    throw new ErrorHandler(500, "Internal Server Error");
  }

  res.status(201).json(
    new ApiResponse(201, "Information Successfully Saved", {
      form_id: data?.form_id,
      student_id: data?.student_id,
    })
  );
});
