import Joi from "joi";

export const admissionReportValidator = Joi.object({
  institute: Joi.string().optional().label("Institute"),
  from_date: Joi.string().optional().label("From Date"),
  to_date: Joi.string().optional().label("To Date"),
  page: Joi.number().optional(),

  form_id: Joi.string().optional(),
  indos_number: Joi.string().optional(),
  cdc_num: Joi.string().optional(),
  passport_num: Joi.string().optional(),
  month_year : Joi.string().optional(),

  rank : Joi.string().optional()
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
  course_id: Joi.number().required(),
  batch_date: Joi.string().required(),
  page: Joi.number().optional(),
  month_year : Joi.string().optional(),
});

export const courseTrendReportValidator = Joi.object({
  institute: Joi.string().required(),
  course_type: Joi.string().required(),
  course_id: Joi.string().required(),
  last_no_of_batches: Joi.number().required(),
  // batch_date: Joi.string().required(),
  page: Joi.number().optional(),
  month_year : Joi.string().optional(),
});

export const receiptReportValidator = Joi.object({
  institute: Joi.string().required().label("Institute"),
  from_date: Joi.string().required().label("From Date"),
  to_date: Joi.string().required().label("To Date"),
  page: Joi.number().optional(),
  month_year : Joi.string().optional(),
});

export const occupancyReportValidator = Joi.object({
  institute: Joi.string().required().label("Institute"),
  start_date: Joi.string().required().label("Start Date"),
  end_date: Joi.string().required().label("End Date"),
  page: Joi.number().optional(),
});

export const occupancyExcelReportValidator = occupancyReportValidator
  .fork(["institute"], (schema) => schema.optional())
  .unknown(false)
  .prefs({ stripUnknown: { objects: true } });

export const refundReportValidator = Joi.object({
  institute: Joi.string().required().label("Institute"),
  course_type: Joi.string().required(),

  course_id: Joi.number().required().optional(),
  batch_date: Joi.string().required().optional(),

  start_date: Joi.string().required().label("From Date").optional(),
  end_date: Joi.string().required().label("To Date").optional(),
  page: Joi.number().optional(),
});
