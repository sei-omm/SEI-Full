import Joi from "joi";

export const VAssignNewMember = Joi.object({
  employee_id: Joi.number().required(),
  permissions: Joi.string().required(),
});

export const VDeleteMember = Joi.object({
  member_id: Joi.number().required(),
});

export const VUpdateMemberPermission = Joi.object({
  member_id: Joi.number().required(),
  permissions: Joi.string().required(),
});

export const VChangeRole = Joi.object({
  employee_id: Joi.number().required(),
  role: Joi.string().required(),
});
