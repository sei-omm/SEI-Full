import Joi from "joi";

export const getJobsValidator = Joi.object({
  department : Joi.number().optional()
})

export const createJobValidator = Joi.object({
  job_title: Joi.string().required(),
  address: Joi.string().required(),
  exprience: Joi.string().required(),
  department: Joi.number().required(),
  job_description: Joi.string().required().max(2300),
});

export const updateJobValidator = Joi.object({
  id: Joi.number().required(),
  job_title: Joi.string().required(),
  address: Joi.string().required(),
  exprience: Joi.string().required(),
  department: Joi.number().required(),
  job_description: Joi.string().required().max(2300),
});

export const deleteJobValidator = Joi.object({
  id: Joi.number().required(),
});

export const applyJobValidator = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  contact_number: Joi.number().required(),
  dob: Joi.date().required(), //yyyy-mm-dd
  work_experience: Joi.string().required(),
  job_id: Joi.number().required(),
  resume : Joi.string().required()
});

export const getCandidateJobApplicationValidator = Joi.object({
  job_id: Joi.number().required(),
});

export const trackJobApplicationValidator = Joi.object({
  application_id: Joi.string().required(),
});

export const updateCandidateApplicationStatusValidator = Joi.object({
  application_list_id: Joi.number().required(),
  application_status: Joi.required().valid("pending", "success", "decline"),
});
