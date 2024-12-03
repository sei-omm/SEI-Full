import Joi from "joi";

export const admissionReportValidator = Joi.object({
  institute: Joi.string().required().label("Institute"),
  from_date: Joi.string().required().label("From Date"),
  to_date: Joi.string().required().label("To Date"),
});

export const studentBirthdateReportValidator = Joi.object({
  birth_date: Joi.string().required(),
});

export const studentBirthdateWishValidator = Joi.object({
  student_name: Joi.string().required(),
  student_email: Joi.string().required(),
});
export const dgsIndosReportValidator = Joi.object({
  institute: Joi.string().required(),
  course_type: Joi.string().required(),
  course_id: Joi.string().required(),
  batch_date: Joi.string().required(),
});

export const courseTrendReportValidator = Joi.object({
  institute: Joi.string().required(),
  course_type: Joi.string().required(),
  course_id: Joi.string().required(),
  last_no_of_batches: Joi.number().required(),
});

