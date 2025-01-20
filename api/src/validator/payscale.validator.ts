import Joi from "joi";

export const addPayscaleValidator = Joi.array().items(
  Joi.object({
    item_type: Joi.string().valid("Year", "Payscale Label").required(),
    item_value: Joi.string().required(),
  })
);

export const getPayscaleValidator = Joi.object({
  item_type: Joi.string().valid("Year", "Payscale Label", "Both").required(),
});

export const updatePayscaleValidator = Joi.object({
  payscale_id: Joi.number().required(),
  payscale_label: Joi.string().required(),
  payscale_year: Joi.number().required(),
});
