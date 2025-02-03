import Joi from "joi";

export const createLeaveRequestValidator = Joi.object({
  employee_id: Joi.number().required(),
  leave_from: Joi.date().required(),
  leave_to: Joi.date().required(),
  leave_reason: Joi.string().required(),

  leave_type: Joi.string().valid("cl", "sl", "el", "ml").required(),
});

export const updateLeaveStatusValidator = Joi.object({
  id: Joi.number().required(),
  employee_id: Joi.number().required(),
  leave_from: Joi.date().required(),
  leave_to: Joi.date().required(),
  leave_status: Joi.string().valid("pending", "success", "decline").required(),

  leave_type: Joi.string().valid("cl", "sl", "el", "ml").required(),
});

export const VEachEmployeLeaveDetails = Joi.object({
  institute: Joi.string().required(),
});
