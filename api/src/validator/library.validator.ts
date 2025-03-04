import Joi, { string } from "joi";

export const insertLibraryItemValidator = Joi.object({
  library_file_name: Joi.string().required(),
  library_file_type: Joi.valid(
    "pdf",
    "doc",
    "audio",
    "image",
    "link"
  ).required(),
  // course_id: Joi.number().required(),
  is_active: Joi.boolean().required(),
  library_resource_link: Joi.string().required().label("Library Resources"),
  allow_download: Joi.boolean().required(),
  visibility: Joi.string()
    .valid("subject-specific", "course-specific")
    .required(),
  course_ids: Joi.string().when("visibility", {
    is: "course-specific",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  subject_ids: Joi.string().when("visibility", {
    is: "subject-specific",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  institute: Joi.string().required(),
});

export const updateLibraryItemValidator = insertLibraryItemValidator.keys({
  library_id: Joi.number().required(),
});

export const getSingleLibraryValidator = Joi.object({
  library_id: Joi.number().required(),
});

export const getLibraryInfoWithFilterValidator = Joi.object({
  institute: Joi.string().required(),
  visibility: Joi.string()
    .valid("subject-specific", "course-specific")
    .required(),
  course_id: Joi.string().when("visibility", {
    is: "course-specific",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  subject_id: Joi.string().when("visibility", {
    is: "subject-specific",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  date_from: Joi.string().required(),
  date_to: Joi.string().required(),
  page: Joi.number().optional(),
});

export const updateVisibilityValidator = Joi.object({
  library_id: Joi.number().required(),
  is_active: Joi.boolean().required(),
});

export const downloadFileValidator = Joi.object({
  library_item_id: Joi.number().required(),
});

// Physical Library

export const insertPhysicalLibraryValidator = Joi.array().items(
  Joi.object({
    book_name: Joi.string().required(),
    edition: Joi.string().required(),
    author: Joi.string().required(),
    row_number: Joi.number().required(),
    shelf: Joi.string().required(),
    institute: Joi.string().required(),
  })
);

export const updatePhysicalLibraryValidator = Joi.array().items(
  Joi.object({
    phy_lib_book_id: Joi.number().required(),
    book_name: Joi.string().required(),
    edition: Joi.string().required(),
    author: Joi.string().required(),
    row_number: Joi.number().required(),
    shelf: Joi.string().required(),
  })
);

export const issueBookValidator = Joi.object({
  student_id: Joi.number().optional(),
  // employee_id: Joi.number().when(Joi.ref("student_id"), {
  //   is: Joi.exist(),
  //   then: Joi.required(),
  //   otherwise: Joi.optional(),
  // }),
  employee_id: Joi.alternatives().conditional("student_id", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  info: Joi.array().items(
    Joi.object({
      course_id: Joi.number().optional().allow("undefined"),
      phy_lib_book_id: Joi.number().required(),
    })
  ),
  issue_date: Joi.string().required(),
  institute: Joi.string().required(),
});

export const returnBookToLibraryValidator = Joi.object({
  phy_lib_book_issue_id: Joi.number().required(),
  return_date: Joi.string().required(),
});

export const returnBookToLibraryBulkV = Joi.array().items(
  Joi.object({
    phy_lib_book_issue_id: Joi.number().required(),
    return_date: Joi.string().required(),
  })
);

export const bookListReportV = Joi.object({
  institute: Joi.string().required(),
  book_name: Joi.string().optional(),
});