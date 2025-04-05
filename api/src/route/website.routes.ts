import { Router } from "express";
import {
  addNewNotice,
  createSocialLinks,
  deleteBlog,
  deleteSingleNotice,
  deleteSingleSocialLink,
  getAllNotice,
  getBlogsList,
  getSingleBlog,
  getSingleNotice,
  getSlugs,
  getSocialLinks,
  postNewBlog,
  updateSingleBlog,
  updateSingleNotice,
  updateSocialLinks,
} from "../controller/website.controller";

export const websiteRoute = Router();

websiteRoute
  .post("/notice", addNewNotice)
  .put("/notice/:notice_id", updateSingleNotice)
  .delete("/notice/:notice_id", deleteSingleNotice)
  .get("/notice/:notice_id", getSingleNotice)
  .get("/notice", getAllNotice)

  .get("/blogs", getBlogsList)
  .get("/blogs/slug", getSlugs)
  .get("/blogs/:blog_id", getSingleBlog)
  .post("/blogs", postNewBlog)
  .put("/blogs/:blog_id", updateSingleBlog)
  .delete("/blogs/:blog_id", deleteBlog)

  .get("/social", getSocialLinks)
  .post("/social", createSocialLinks)
  .put("/social", updateSocialLinks)
  .delete("/social/:social_link_id", deleteSingleSocialLink);
