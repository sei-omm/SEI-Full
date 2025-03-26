import Joi from "joi";

export const addNewCourseValidator = Joi.object({
  course_code: Joi.string().max(20).required().label("Course Code"),
  course_name: Joi.string().max(255).required().label("Course Name"),
  institute: Joi.string().max(20).required().label("Institute"),
  course_type: Joi.string().max(20).required().label("Course Type"),
  require_documents: Joi.string().required().label("Course Require Documents"),
  subjects: Joi.string().required().label("Course Subject"),
  course_duration: Joi.string().max(255).required().label("Course Duration"),
  course_fee: Joi.number().required().label("Course Fee"),
  min_pay_percentage: Joi.number()
    .optional()
    .label("Course min Pay Percentage"),
  total_seats: Joi.number().required().label("Total Seats"),
  remain_seats: Joi.number().required().label("Remain Seats"),
  course_visibility: Joi.string()
    .valid("Public", "Private", "Schedule")
    .required()
    .label("Course Visibility"),
  course_update_time: Joi.string().when("course_visibility", {
    is: "Schedule",
    then: Joi.required().messages({
      "any.required": "Schedule Date Is Required",
    }),
    otherwise: Joi.optional(),
  }),
  course_pdf: Joi.string().optional().allow("").label("Course Module"),
  course_showing_order: Joi.number()
    .optional()
    .min(1)
    .label("Course Showing Order"),
  concern_marketing_executive_id: Joi.number()
    .required()
    .label("Concern Marketing Executive"),
  max_batch: Joi.number().required().label("Maximum Batch / Month"),
  category : Joi.string().required(),
});

export const getSingleCourseValidator = Joi.object({
  course_id: Joi.number().required(),
});

export const getMultiCoursesPricesValidator = Joi.object({
  course_ids: Joi.string().required().allow(""),
});

export const getMultiBatchPricesValidator = Joi.object({
  batch_ids: Joi.string().required().allow(""),
});

export const updateCourseValidator = Joi.object({
  course_id: Joi.number().integer().required(),
  course_name: Joi.string().max(255).required(),
  institute: Joi.string().max(20).required(),
  course_type: Joi.string().max(20).required(),
  require_documents: Joi.string().required(),
  subjects: Joi.string().required(),
  course_duration: Joi.string().max(255).required(),
  course_fee: Joi.number().required(),
  min_pay_percentage: Joi.number().optional(),
  total_seats: Joi.number().required(),
  remain_seats: Joi.number().required(),
  course_visibility: Joi.string()
    .valid("Public", "Private", "Schedule")
    .required(),
  course_update_time: Joi.string().when("course_visibility", {
    is: "Schedule",
    then: Joi.required().messages({
      "any.required": "Schedule Date Is Required",
    }),
    otherwise: Joi.optional(),
  }),
  course_pdf: Joi.string().optional().allow(""),
  course_showing_order: Joi.number().optional().min(1),
  concern_marketing_executive_id: Joi.number().required(),
  max_batch: Joi.number().required(),
  category : Joi.string().required(),
});

export const fillUpCourseFormValidator = Joi.object({
  course_id: Joi.number().required(),
  student_id: Joi.number().required(),

  rank: Joi.string().allow(""),
  indos_number: Joi.string().allow(""),

  nationality: Joi.string().required(),
  permanent_address: Joi.string().required(),
  present_address: Joi.string().required(),
  dob: Joi.string().required(),

  blood_group: Joi.string().allow(""),
  allergic_or_medication: Joi.string().allow(""),
  next_of_kin_name: Joi.string().allow(""),
  relation_to_sel: Joi.string().required(),
  emergency_number: Joi.string().required(),

  number_of_the_cert: Joi.string().allow(""),
  issued_by_institute: Joi.string().allow(""),
  issued_by_institute_indos_number: Joi.string().allow(""),

  id_proof: Joi.string().uri().max(2083).optional().label("Id Proof Document"),
  address_proof: Joi.string()
    .uri()
    .max(2083)
    .optional()
    .label("Address Proof Document"),
  academic_proof: Joi.string()
    .uri()
    .max(2083)
    .optional()
    .label("Academic Proof Document"),

  form_status: Joi.string().required(),
});

export const getScheduleCourseBatchValidator = Joi.object({
  course_id: Joi.any().required(),
  page: Joi.number().optional(),
});

export const enrollCourseValidator = Joi.object({
  course_ids: Joi.string().required(),
  payment_mode: Joi.string().required().valid("Part-Payment", "Full-Payment"),
});

export const enrollBatchValidator = Joi.object({
  batch_ids: Joi.string().required(),
  payment_mode: Joi.string().required().valid("Part-Payment", "Full-Payment"),

  student_id: Joi.number().optional(),
});

export const scheduleCourseBatchValidator = Joi.object({
  course_id: Joi.number().required(),
  start_date: Joi.string().required(),
  end_date: Joi.string().required(),
  batch_fee: Joi.number().required(),
  min_pay_percentage: Joi.number().required(),
  batch_total_seats: Joi.number().required(),
  batch_reserved_seats: Joi.number().required(),
  visibility: Joi.string().optional(),
});

export const updateScheduleCourseBatchValidator =
  scheduleCourseBatchValidator.concat(
    Joi.object({
      batch_id: Joi.number().required(),
    })
  );

export const deleteCourseBatchValidator = Joi.object({
  batch_id: Joi.number().required(),
});

export const getRequiredDocumentsValidator = Joi.object({
  course_ids: Joi.string().required(),
  student_id: Joi.number().optional(),
});

export const VchangeBatchManually = Joi.object({
  old_batch_id: Joi.number().required(),
  new_batch_id: Joi.number().required(),
  course_id: Joi.number().required(),
  student_id: Joi.number().required(),
});

export const VTimeTable = Joi.object({
  institute: Joi.string().required(),
  date: Joi.string().required(),
});

// export const VSaveTimeTable = Joi.array().items(
//   Joi.object({
//     date: Joi.string().required(),

//     course_id: Joi.number().required(),
//     employee_id: Joi.number().required().allow(null),

//     for_subject_name: Joi.string().required(),

//     institute : Joi.string().required()
//   })
// );

export const VSaveTimeTable = Joi.object({
  date: Joi.string().required(),
  time_table_data: Joi.string().required(),
  institute: Joi.string().required(),
  faculty_ids: Joi.array().items(Joi.number()),
  total_rows : Joi.number().required()
});

export const VDraftTimeTable = Joi.object({
  date: Joi.string().required(),
  institute : Joi.string().required(),
  virtual_table : Joi.string().required()
});
