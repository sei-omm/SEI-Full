import Joi from "joi";

export const getJobsValidator = Joi.object({
  department: Joi.number().optional(),
  page: Joi.number().optional(),
});

export const createJobValidator = Joi.object({
  job_title: Joi.string().required(),
  address: Joi.string().required(),
  exprience: Joi.string().required(),
  department: Joi.number().required(),
  department_name: Joi.string().required(),
  job_description: Joi.string().required().max(2300),

  vendors_email: Joi.string().optional(),
});

export const updateJobValidator = Joi.object({
  id: Joi.number().required(),
  job_title: Joi.string().required(),
  address: Joi.string().required(),
  exprience: Joi.string().required(),
  department: Joi.number().required(),
  department_name: Joi.string().required(),
  job_description: Joi.string().required().max(2300),

  vendors_email: Joi.string().optional(),
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
  resume: Joi.string().required(),
});

export const getCandidateJobApplicationValidator = Joi.object({
  job_id: Joi.number().required(),
  page: Joi.number().optional(),
});

export const trackJobApplicationValidator = Joi.object({
  application_id: Joi.string().required(),
});

export const updateCandidateApplicationStatusValidator = Joi.object({
  application_list_id: Joi.number().required(),
  application_status: Joi.required().valid("pending", "success", "decline"),
});

export const VSendEmailToVendor = Joi.object({
  to_emails: Joi.array().items(Joi.string().required()),
  extra_info: Joi.string().optional().allow(""),
});
