import Joi from "joi";

export const sendNotificationValidator = Joi.object({
  notification_title: Joi.string().required(),
  notification_description: Joi.string().required(),
  notification_type: Joi.valid("role-base", "private").required(),
  to_ids: Joi.string().when("notification_type", {
    is: "private",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  to_roles: Joi.string().when("notification_type", {
    is: "role-base",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});
