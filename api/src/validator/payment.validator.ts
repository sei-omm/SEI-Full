import Joi from "joi";

export const verifyPaymentValidator = Joi.object({
  order_id: Joi.string().required(),
  batch_ids: Joi.string().required(),
  course_ids: Joi.string().required(),
  is_in_waiting_list : Joi.string().required(),
  institute: Joi.string().required(),
});

export const verifyDueOnlinePaymentValidator = Joi.object({
  order_id: Joi.string().required(),
  batch_id: Joi.number().required(),
});


export const addPaymentValidator = Joi.object({
  student_id: Joi.number().required(),
  paid_amount: Joi.number().optional(),
  discount_amount: Joi.number().optional(),
  discount_remark: Joi.string().optional().allow(""),
  payment_type: Joi.optional().allow(""),
  remark: Joi.string().optional().allow(""),
  misc_payment: Joi.number().optional(),
  misc_remark: Joi.string().optional().allow(""),
  mode: Joi.string().required(),
  // course_id: Joi.number().required(),
  form_id: Joi.string().required(),
});

export const payDueAmountValidator = Joi.object({
  batch_id: Joi.number().required(),
});
