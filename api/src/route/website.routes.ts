import { Router } from "express";
import {
  addNewNotice,
  deleteSingleNotice,
  getAllNotice,
  getSingleNotice,
  updateSingleNotice,
} from "../controller/website.controller";

export const websiteRoute = Router();

websiteRoute
  .post("/notice", addNewNotice)
  .put("/notice/:notice_id", updateSingleNotice)
  .delete("/notice/:notice_id", deleteSingleNotice)
  .get("/notice/:notice_id", getSingleNotice)
  .get("/notice", getAllNotice)
