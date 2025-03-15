import Joi from "joi";

export const VAddNewNotice = Joi.object({
  heading: Joi.string().required(),
  description: Joi.string().required(),
  visible: Joi.boolean().required(),
});

export const VUpdateSingleNotice = Joi.object({
  notice_id: Joi.number().required(),
  heading: Joi.string().required(),
  description: Joi.string().required(),
  visible: Joi.boolean().required(),
});

export const VDeleteSingleNotice = Joi.object({
  notice_id: Joi.number().required(),
});

// blogs
export const VSingleBlog = Joi.object({
  blog_id: Joi.number().required(),
});

export const VPostNewBlog = Joi.object({
  heading: Joi.string().required(),
  blog_content: Joi.string().required(),
  thumbnail: Joi.string().required(),
  meta_title: Joi.string().optional().allow(""),
  meta_description: Joi.string().optional().allow(""),
  meta_keywords: Joi.string().optional().allow(""),
  meta_canonical_url: Joi.string().optional().allow(""),
  visible: Joi.boolean().required(),
});

export const VUpdateSingleBlog = Joi.object({
  blog_id: Joi.number().required(),

  heading: Joi.string().required(),
  blog_content: Joi.string().required(),
  thumbnail: Joi.string().required(),

  meta_title: Joi.string().optional().allow(""),
  meta_description: Joi.string().optional().allow(""),
  meta_keywords: Joi.string().optional().allow(""),
  meta_canonical_url: Joi.string().optional().allow(""),
  
  visible: Joi.boolean().required(),
});