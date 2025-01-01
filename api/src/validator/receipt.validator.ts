import Joi from "joi";

export const paymentReciptValidator = Joi.object({
  // student_name : Joi.string().required(),
  // indos_number : Joi.string().required(),
  // contact_number : Joi.number().required(),
  // email : Joi.string().email().required(),
  // payment_remark : Joi.string().required(),

  // course_fee : Joi.number().required(),
  // total_paid_till_now : Joi.number().required(),
  // due_amount : Joi.number().required(),
  // disc_amount : Joi.number().required(),

  // amount_paid : Joi.number().required(),
  // misc_amount : Joi.number().required()

  form_id: Joi.string().required(),
  student_id: Joi.number().required(),
  payment_id: Joi.string().required(),
});

export const admissionReceiptValidator = Joi.object({
  form_id: Joi.string().required(),
});