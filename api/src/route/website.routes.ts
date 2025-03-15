import { Router } from "express";
import {
  addNewNotice,
  deleteBlog,
  deleteSingleNotice,
  getAllNotice,
  getBlogsList,
  getSingleBlog,
  getSingleNotice,
  postNewBlog,
  updateSingleBlog,
  updateSingleNotice,
} from "../controller/website.controller";

export const websiteRoute = Router();

websiteRoute
  .post("/notice", addNewNotice)
  .put("/notice/:notice_id", updateSingleNotice)
  .delete("/notice/:notice_id", deleteSingleNotice)
  .get("/notice/:notice_id", getSingleNotice)
  .get("/notice", getAllNotice)

  .get("/blogs", getBlogsList)
  .get("/blogs/:blog_id", getSingleBlog)
  .post("/blogs", postNewBlog)
  .put("/blogs/:blog_id", updateSingleBlog)
  .delete("/blogs/:blog_id", deleteBlog)
