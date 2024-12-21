import Joi from "joi";
import {
  fillUpFormValidator,
  studentRegisterValidator,
} from "./student.validator";

export const saveAdmissionInfoValidator = studentRegisterValidator
  .concat(fillUpFormValidator)
  .fork(["password"], (schema) => schema.forbidden())
  .append({
    form_status: Joi.string().valid("Approve", "Pending", "Cancel").required(),
    student_id: Joi.number().required(),
    id_proof: Joi.string().uri().max(2083).optional().label("Id Proof"),
    address_proof: Joi.string()
      .uri()
      .max(2083)
      .optional()
      .label("Address Proof"),
    academic_proof: Joi.string()
      .uri()
      .max(2083)
      .optional()
      .label("Academic Proof"),
    form_id: Joi.string().required(),
  });

export const updateEnrollCourseStatusValidator = Joi.object({
  enroll_id: Joi.number().required(),
  enrollment_status: Joi.string()
    .valid("Approve", "Pending", "Cancel")
    .required(),
});

export const viewStudentsDocumentsValidator = Joi.object({
  student_id: Joi.number().required(),
});

export const updateFormStatusValidator = Joi.object({
  form_id: Joi.string().required(),
  form_status: Joi.string().valid("Approve", "Pending", "Cancel").required(),
});

export const getAdmissionsValidator = Joi.object({
  course_id : Joi.number().required(),
  institute : Joi.string().required(),
  course_type : Joi.string().required(),
  batch_date : Joi.string().required()
});