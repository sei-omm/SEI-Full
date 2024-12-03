import { Router } from "express";
import {
  createAdmissionReport,
  generateAdmissionExcelReport,
  generateDobExcelReport,
  getBatchReport,
  getCourseTrendExcelReport,
  getCourseTrendReport,
  getDgsIndosExcelReport,
  getDgsIndosReport,
  getStudentsBirthDateReport,
  sendBirthdateWish,
  testController,
} from "../controller/report.controller";

export const reportRouter = Router();
reportRouter
  .get("/admission", createAdmissionReport)
  .get("/admission/excel", generateAdmissionExcelReport)
  .get("/dob", getStudentsBirthDateReport)
  .get("/dob/excel", generateDobExcelReport)
  .get("/dgs", getDgsIndosReport)
  .get("/dgs/excel", getDgsIndosExcelReport)
  .get("/course-trend-report", getCourseTrendReport)
  .get("/course-trend-report/excel", getCourseTrendExcelReport)
  .get("/batch", getBatchReport)
  .post("/dob/send-wish", sendBirthdateWish)
  .get("/test", testController);
