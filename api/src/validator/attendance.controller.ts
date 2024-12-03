import Joi, { date } from "joi";

export const addNewEmployeeAttendanceValidator = Joi.object({
  status: Joi.string().valid("Present", "Absent", "Leave").required(),
  employee_id: Joi.number().required(),
});

export const updateEmployeeAttendanceValidator = Joi.object({
  employee_id: Joi.string().required(),
  status: Joi.string().valid("Present", "Absent", "Leave").required(),
  date: Joi.string().required(),
});
