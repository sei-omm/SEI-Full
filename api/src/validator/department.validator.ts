import Joi from "joi";

export const addDesignationValidator = Joi.array()
  .items(
    Joi.object({
      department_id: Joi.number().required(),
      deg_name: Joi.string().required(),
    })
  )
  .required();

export const addDepartmentValidator = Joi.object({
  name: Joi.string().required(),
  designation: Joi.string().optional(),
});

export const updateDepartmentValidator = addDepartmentValidator.keys({
  department_id: Joi.number().required(),
});
