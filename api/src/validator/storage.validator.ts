import Joi from "joi";

export const createdFolderValidator = Joi.object({
  folder_name: Joi.string().required().max(50).label("Folder Name"),
  parent_folder_id: Joi.number().optional().label("Parent Folder ID"),
  institute : Joi.string().required()
});

export const renameFolderValidator = Joi.object({
  folder_id: Joi.number().required().label("Folder Id"),
  folder_name: Joi.string().required().max(50).label("Folder Name"),
});

export const deleteFolderValidator = Joi.object({
  folder_id: Joi.number().required().label("Folder Id"),
});

export const getFilesAndFoldersValidator = Joi.object({
  folder_id: Joi.number().required().label("Folder Id"),
  institute : Joi.string().required()
});

const saveFileInfoToDbValidatorObj = Joi.object({
  file_name: Joi.string().required(),
  file_type: Joi.string().required(),
  file_url: Joi.string().required(),

  folder_id: Joi.number().optional().label("Folder Id"),

  institute : Joi.string().required()
});

export const saveFileInfoToDbValidator = Joi.array().items(saveFileInfoToDbValidatorObj).required();

export const renameFileValidator = Joi.object({
  file_id: Joi.number().required().label("File Id"),
  file_name: Joi.string().required().max(50).label("File Name"),
});

export const deleteFileValidator = Joi.object({
  file_id: Joi.number().required().label("File Id"),
});
