import Joi from "joi";

export const VSendFormData = Joi.object({
  employee_id: Joi.number().required(),
  it_completed_date: Joi.string().optional(),
  se_completed_date: Joi.string().optional(),
  tr_generated_date: Joi.string().optional(),
  tr_completed_date: Joi.string().optional(),

  it_form_data: Joi.string().optional(),
  se_form_data: Joi.string().optional(),
  tr_form_date: Joi.string().optional(),

  action_type : Joi.string().valid("Accept", "Generate")
});

export const VGetSingleFormData = Joi.object({
  employee_id: Joi.number().required(),
  col_name: Joi.string()
    .valid("it_form_data", "se_form_data", "tr_form_date")
    .required(),
});
