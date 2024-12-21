import Joi, { date } from "joi";

export const addNewEmployeeAttendanceValidator = Joi.object({
  status: Joi.string().valid("Present", "Absent", "Half Day", "Sunday", "Holiday").required(),
  employee_id: Joi.number().required(),
});

export const updateEmployeeAttendanceValidator = Joi.object({
  employee_id: Joi.string().required(),
  status: Joi.string().valid("Present", "Absent", "Half Day", "Sunday", "Holiday").required(),
  date: Joi.string().required(),
});
