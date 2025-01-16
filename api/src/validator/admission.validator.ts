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
    cdc_num: Joi.string().optional().allow(""),
    passport_num: Joi.string().optional().allow(""),
    coc_number: Joi.string().optional().allow(""),
    cert_of_completency: Joi.string().optional().allow(""),
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
  course_id: Joi.number().optional(),
  institute: Joi.string().optional(),
  course_type: Joi.string().optional(),
  batch_date: Joi.string().optional(),
  page: Joi.number().optional(),

  form_id: Joi.string().optional(),
  indos_number: Joi.string().optional(),
  cdc_num: Joi.string().optional(),
  passport_num: Joi.string().optional(),
});
