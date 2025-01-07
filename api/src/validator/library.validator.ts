import Joi from "joi";

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
  institute : Joi.string().required()
});

export const updateLibraryItemValidator = insertLibraryItemValidator.keys({
  library_id: Joi.number().required(),
});

export const getSingleLibraryValidator = Joi.object({
  library_id: Joi.number().required(),
});

export const getLibraryInfoWithFilterValidator = Joi.object({
  institute : Joi.string().required(),
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
  library_item_id : Joi.number().required()
});
