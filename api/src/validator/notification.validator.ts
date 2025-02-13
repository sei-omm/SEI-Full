import Joi from "joi";

export const createAndSendNotificationValidator = Joi.object({
  notification_title: Joi.string().required(),
  notification_description: Joi.string().required(),
  notification_link: Joi.string().optional(),
  notification_type: Joi.valid("role_base", "private").required(),
  employee_ids: Joi.array().items(Joi.number()).when("notification_type", {
    is: "private",
    then: Joi.required(),
    otherwise: Joi.disallow(),
  }),
  employee_roles: Joi.array().items(Joi.string()).when("notification_type", {
    is: "role_base",
    then: Joi.required(),
    otherwise: Joi.disallow(),
  }),
});

export const sendNotificationValidator = Joi.object({
  notification_id: Joi.number().required(),
  notification_type: Joi.valid("role_base", "private").required(),
  employee_ids: Joi.array().items(Joi.number()).when("notification_type", {
    is: "private",
    then: Joi.required(),
    otherwise: Joi.disallow(),
  }),
  employee_roles: Joi.array().items(Joi.string()).when("notification_type", {
    is: "role_base",
    then: Joi.required(),
    otherwise: Joi.disallow(),
  }),
});
