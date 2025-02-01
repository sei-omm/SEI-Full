import Joi from "joi";

export const VAddHolidayList = Joi.array().items(
  Joi.object({
    holiday_name: Joi.string().required(),
    holiday_date: Joi.string().required(),
    holiday_year: Joi.number().required(),
  })
);
