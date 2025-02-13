import Joi from "joi";

export const updateEmployeeStatusValidator = Joi.object({
  id: Joi.number().required(),
  is_active: Joi.boolean().required(),
});

export const employeeSchema = Joi.object({
  name: Joi.string().max(255).required().label("Name"),
  employee_id: Joi.string().length(7).optional().label("Employee ID"),
  joining_date: Joi.date().required().label("Joining Date"),
  // job_title: Joi.string().max(255).optional().label("Job Title"),
  department_id: Joi.number().optional().label("department_id"),
  contact_number: Joi.string().max(15).optional().label("Contact Number"),
  email_address: Joi.string()
    .email()
    .max(255)
    .pattern(/@/)
    .optional()
    .label("Email Address"),
  living_address: Joi.string().optional().allow("").label("Living Address"),
  permanent_address: Joi.string()
    .optional()
    .allow("")
    .label("Permanent Address"),
  dob: Joi.date().optional().label("Date of Birth"),
  gender: Joi.string()
    .valid("Male", "Female", "Other")
    .max(6)
    .optional()
    .label("Gender"),
  marital_status: Joi.string()
    .valid("Married", "Un-Married")
    .max(6)
    .optional()
    .label("Marital"),
  bank_name: Joi.string().max(100).optional().label("Bank Name"),
  bank_account_no: Joi.string().max(20).optional().label("Bank Account Number"),
  account_holder_name: Joi.string()
    .max(100)
    .optional()
    .label("Account Holder Name"),
  ifsc_code: Joi.string().length(11).optional().label("IFSC Code"),
  profile_image: Joi.string().uri().max(2083).optional().label("Profile Image"),
  employee_docs_info: Joi.string().required(),

  // resume: Joi.string().uri().max(2083).optional().label("Resume"),
  // pan_card: Joi.string().uri().max(2083).optional().label("PAN Card"),
  // aadhaar_card: Joi.string().uri().max(2083).optional().label("Aadhaar Card"),
  // ten_pass_certificate: Joi.string()
  //   .uri()
  //   .max(2083)
  //   .optional()
  //   .label("10th Pass Certificate"),
  // twelve_pass_certificate: Joi.string()
  //   .uri()
  //   .max(2083)
  //   .optional()
  //   .label("12th Pass Certificate"),
  // graduation_certificate: Joi.string()
  //   .uri()
  //   .max(2083)
  //   .optional()
  //   .label("Graduation Certificate"),
  // other_certificate: Joi.string()
  //   .uri()
  //   .max(2083)
  //   .optional()
  //   .label("Other Certificate"),
  basic_salary: Joi.number().precision(2).optional().label("Basic Salary"),
  hra: Joi.number().precision(2).optional().label("HRA"),
  other_allowances: Joi.number()
    .precision(2)
    .optional()
    .label("Other Allowances"),
  provident_fund: Joi.number().precision(2).optional().label("Provident Fund"),
  professional_tax: Joi.number()
    .precision(2)
    .optional()
    .label("Professional Tax"),
  esic: Joi.number().precision(2).optional().label("ESIC Tax"),
  income_tax: Joi.number().precision(2).optional().label("Income Tax"),
  gratuity: Joi.number().precision(2).optional().label("Gratuity"),
  is_active: Joi.boolean().default(true).label("Is Active"),

  login_email: Joi.string().max(255).optional().allow("").messages({
    "string.email": "Please enter a valid Employee Login Email / Employee ID",
    "string.max": "Employee Login Email should be at most 255 characters",
    "any.required": "Employee Login Email is required",
  }),

  login_password: Joi.string().max(12).required().messages({
    "string.max": "Employee Login Password should be at most 12 characters",
    "any.required": "Employee Login Password is required",
  }),

  // rank: Joi.string().required().label("Employee Rank"),
  fin_number: Joi.string().allow("").optional().label("Fin Number"),
  indos_number: Joi.string().allow("").optional().label("Indos Number"),
  cdc_number: Joi.string().allow("").optional().label("CDC Number"),
  grade: Joi.string().allow("").optional().label("Grade"),
  qualification: Joi.string().allow("").optional(),
  additional_qualification: Joi.string().allow("").optional(),
  selling_experience: Joi.string().allow("").optional(),
  teaching_experience: Joi.string().allow("").optional(),

  max_teaching_hrs_per_week: Joi.string().optional().allow(""),
  faculty_attendance_type: Joi.string().valid("Regular", "Visiting"),
  employee_type: Joi.string().valid("Office Staff", "Faculty"),
  institute: Joi.string().required(),
  designation: Joi.string().optional().allow(""),
  authority: Joi.number().optional(),

  emergency_contact_number: Joi.string()
    .required()
    .label("Emergency Contact Number"),
  contact_person_name: Joi.string().required().label("Contact Person Name"),
  contact_person_relation: Joi.string()
    .optional()
    .allow("")
    .label("Contact Person Relation"),

  payscale_label: Joi.string().required().label("Payscale Label"),
  payscale_year: Joi.number().required().label("Payscale Year"),

  next_to_kin: Joi.string().optional().allow("").label("Next To Kin"),
  relation_to_self: Joi.string().optional().allow("").label("Relation To Self"),

  cl: Joi.number().optional(),
  sl: Joi.number().optional(),
  el: Joi.number().optional(),
  ml: Joi.number().optional(),
});

export const employeeLoginValidator = Joi.object({
  login_email: Joi.string().max(255).required().messages({
    "string.email": "Please enter a valid Employee Login Email / ID",
    "string.max": "Employee Login Email should be at most 255 characters",
    "any.required": "Employee Login Email is required",
  }),

  login_password: Joi.string().max(12).required().messages({
    "string.max": "Employee Login Password should be at most 12 characters",
    "any.required": "Employee Login Password is required",
  }),
});

export const getEmployeeDocumentValidator = Joi.object({
  employee_id: Joi.number().required(),
});

export const assignFacultyCourseSubjectValidator = Joi.object({
  faculty_id: Joi.number().required(),
  course_id: Joi.number().required(),
  subject: Joi.string().required(),
});

//Appraisal
export const createAppraisalValidator = Joi.object({
  employee_id: Joi.number().required(),
  discipline: Joi.string().required(),
  duties: Joi.string().required(),
  targets: Joi.string().required(),
  achievements: Joi.string().required(),
  appraisal_options_employee: Joi.string().required(),
});

export const getAppraisalListValidator = Joi.object({
  employee_id: Joi.number().required(),
  type: Joi.string().valid("own", "others").required(),
});

export const getSingleAppraisalValidator = Joi.object({
  appraisal_id: Joi.number().required(),
});

export const updateAppraisalValidator = Joi.object({
  appraisal_id: Joi.number().required(),

  employee_id: Joi.number().required(),

  discipline: Joi.string().required(),
  duties: Joi.string().required(),
  targets: Joi.string().required(),
  achievements: Joi.string().required(),

  appraisal_options_employee: Joi.string().required(),
  appraisal_options_hod: Joi.string().required(),
  state_of_health: Joi.string().required(),
  integrity: Joi.string().required(),
});

export const assignAssetsValidator = Joi.array().items(
  Joi.object({
    employee_id: Joi.number().required(),
    assets_name: Joi.string().required(),
    issued_by: Joi.string().required(),
    issue_date: Joi.string().required(),
    return_date: Joi.string().optional(),
  })
);
