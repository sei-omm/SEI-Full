import Joi from "joi";

export const studentRegisterValidator = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  mobile_number: Joi.number().required(),
  dob: Joi.string().required(),
  indos_number: Joi.string().max(30).optional().allow(""),
  password: Joi.string().required().max(12).messages({
    "string.max": "Password must be at most 12 characters long.",
  }),
});

export const verifyOtpValidator = studentRegisterValidator.keys({
  otp: Joi.string().length(5).required().messages({
    "string.length": "OTP must be exactly 5 characters long.",
  }),
});

export const studentLoginValidator = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required().max(12).messages({
    "string.max": "Password must be at most 12 characters long.",
  }),
});

export const sendResetPasswordEmailValidator = Joi.object({
  email: Joi.string().required(),
});

export const setNewPasswordValidator = Joi.object({
  token: Joi.string().required(),
  new_password: Joi.string().required().max(12).messages({
    "string.max": "Password must be at most 12 characters long.",
  }),
});

export const resendOtpValidator = Joi.object({
  email: Joi.string().required(),
});

export const fillUpFormValidator = Joi.object({
  // course_id : Joi.number().required(),  //getting from params
  // indos_number : Joi.string().max(30).optional().allow(""),

  rank: Joi.string().required().allow(""),
  nationality: Joi.string().required(),
  permanent_address: Joi.string().required(),
  present_address: Joi.string().required(),
  blood_group: Joi.string().required().allow(""),
  allergic_or_medication: Joi.string().required().allow(""),
  next_of_kin_name: Joi.string().required(),
  relation_to_sel: Joi.string().required(),
  emergency_number: Joi.number().required(),
  number_of_the_cert: Joi.string().required().allow(""),
  issued_by_institute: Joi.string().required().allow(""),
  issued_by_institute_indos_number: Joi.string().required().allow(""),
  // payment_mode : Joi.string().required().valid("Part-Payment", "Full-Payment"),
});

export const saveIndosNumberValidator = Joi.object({
  indos_number: Joi.string().required().max(30),
});

export const saveStudentDocumentValidator = Joi.object({
  doc_id: Joi.string().required(),
  doc_uri: Joi.string().required(),
  doc_name: Joi.string().required(),
});
