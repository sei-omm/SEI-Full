import Joi from "joi";

export const VAddNewNotice = Joi.object({
  heading: Joi.string().required(),
  description: Joi.string().required(),
  visible: Joi.boolean().required(),
});

export const VUpdateSingleNotice = Joi.object({
  notice_id: Joi.number().required(),
  heading: Joi.string().required(),
  description: Joi.string().required(),
  visible: Joi.boolean().required(),
});

export const VDeleteSingleNotice = Joi.object({
  notice_id: Joi.number().required(),
});
