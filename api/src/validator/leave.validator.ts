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
  previous_status : Joi.string().valid("pending", "success", "decline").required(),

  leave_type: Joi.string().valid("cl", "sl", "el", "ml").required(),

  leave_and_employee_row_id : Joi.number().required(),

  who_is_updating_id : Joi.number().required()
});

export const VEachEmployeLeaveDetails = Joi.object({
  institute: Joi.string().required()
});

export const getOthersLeaveListV = Joi.object({
  employee_id : Joi.number().required()
})
export const getLeaveReciptV = Joi.object({
  leave_id : Joi.number().required()
});