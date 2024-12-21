import { Router } from "express";
import {
  addNewSubject,
  deleteSubject,
  getSubject,
  updateSubject,
} from "../controller/subject.controller";

export const subjectRoute = Router();

subjectRoute
  .get("/", getSubject)
  .post("/", addNewSubject)
  .put("/:subject_id", updateSubject)
  .delete("/:subject_id", deleteSubject);
