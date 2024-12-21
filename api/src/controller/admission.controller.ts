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
  viewStudentsDocumentsValidator,
} from "../validator/admission.validator";
import { pool } from "../config/db";
import { reqFilesToKeyValue } from "../utils/reqFilesToKeyValue";
import { objectToSqlConverterUpdate } from "../utils/objectToSql";
import { transaction } from "../utils/transaction";

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
        new ApiResponse(
          200,
          "",
          await getAdmissionsService(req.query)
        )
      );
  }
);

export const saveAdmissionInfo = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = saveAdmissionInfoValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    const filesOBJ = reqFilesToKeyValue(req);

    const formStatus = value.form_status;
    delete value.form_status;
    const formId = value.form_id;
    delete value.form_id;

    // const courseId = value.course_id;
    // delete value.course_id;
    const studentId = value.student_id;
    delete value.student_id;

    const {
      keys,
      paramsNum,
      values: sqlValues,
    } = objectToSqlConverterUpdate({
      ...value,
      ...filesOBJ,
    });
    sqlValues.push(studentId);

    await transaction([
      {
        sql: `UPDATE fillup_forms SET form_status = $1 WHERE form_id = $2`,
        values: [formStatus, formId],
      },
      {
        sql: `UPDATE students SET ${keys} WHERE student_id = $${paramsNum}`,
        values: sqlValues,
      },
    ]);

    res
      .status(200)
      .json(new ApiResponse(200, "Admission Info Successfully Updated"));
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

    await pool.query(
      `UPDATE enrolled_batches_courses SET enrollment_status = $1 WHERE enroll_id = $2`,
      [value.enrollment_status, value.enroll_id]
    );

    res.status(200).json(new ApiResponse(200, "Status Successfully Updated"));
  }
);

export const updateFormStatus = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const { error, value } = updateFormStatusValidator.validate(req.body);
    if (error) throw new ErrorHandler(400, error.message);

    await pool.query(
      `UPDATE fillup_forms SET form_status = $1 WHERE form_id = $2`,
      [value.form_status, value.form_id]
    );

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
