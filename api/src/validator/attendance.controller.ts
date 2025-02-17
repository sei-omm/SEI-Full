import Joi, { date } from "joi";

export const addNewEmployeeAttendanceValidator = Joi.object({
  status: Joi.string()
    .valid("Present", "Absent", "Half Day", "Sunday", "Holiday")
    .required(),
  employee_id: Joi.number().required(),
});

export const updateBuldAttendanceValidator = Joi.array().items(
  Joi.object({
    employee_id: Joi.number().required(),
    attendance_option: Joi.string()
      .valid("Present", "Absent", "Half Day", "Sunday", "Holiday")
      .required(),
    attendance_date: Joi.string().required(),
  })
);
