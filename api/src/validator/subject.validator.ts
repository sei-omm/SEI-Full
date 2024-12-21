import Joi from "joi";

export const addNewSubjectValidator = Joi.object({
  subject_name: Joi.string().required(),
});

export const updateSubjectValidator = addNewSubjectValidator.keys({
  subject_id: Joi.number().required(),
});

export const deleteSubjectValidator = Joi.object({
  subject_id: Joi.number().required(),
});
