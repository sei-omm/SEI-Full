import Joi, { string } from "joi";

export const verifyPaymentValidator = Joi.object({
  // order_id: Joi.string().required(),
  // batch_ids: Joi.string().required(),
  // course_ids: Joi.string().required(),
  // is_in_waiting_list: Joi.string().required(),
  // institute: Joi.string().required(),

  verify_type : Joi.string().valid("normal", "due", "payment-link").required(),
  token : Joi.string().required(),
  payment_id: Joi.string().optional().allow(""),
});

export const verifyDueOnlinePaymentValidator = Joi.object({
  payment_id: Joi.string().required(),
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
  bank_transaction_id : Joi.string().optional().allow("")
});

export const payDueAmountValidator = Joi.object({
  student_id : Joi.number().required(),
  batch_id: Joi.number().required(),
});

export const refundPaymentValidator = Joi.object({
  student_id: Joi.number().required(),
  course_id: Joi.number().required(),
  batch_id: Joi.number().required(),
  refund_amount: Joi.number().required(),

  refund_reason: Joi.string().optional().allow(""),
  bank_details: Joi.string().optional().allow(""),
  executive_name: Joi.string().optional().allow(""),
  refund_id: Joi.string().optional().allow(""),

  mode: Joi.string().required(),
  form_id: Joi.string().required(),

  status: Joi.string().optional(),
  bank_transaction_id : Joi.string().optional().allow("")
});

export const sendPaymentLinkValidator = Joi.object({
  token: Joi.string().required(),
});
