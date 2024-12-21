import { Router } from "express";
import {
  createAdmissionReport,
  generateAdmissionExcelReport,
  generateDobExcelReport,
  getBatchReport,
  getBatchReportExcel,
  getCourseTrendExcelReport,
  getCourseTrendReport,
  getDgsIndosReport,
  getReceiptReport,
  getReceiptReportExcel,
  getStudentsBirthDateReport,
  sendBirthdateWish,
} from "../controller/report.controller";
import { streamAdmissionExcelReport, streamBatchExcelReport, streamCourseTrendExcelReport, streamDgsIndosExcelReport, streamReceiptExcelReport } from "../controller/stream.report";

export const reportRouter = Router();
reportRouter
  .get("/admission", createAdmissionReport)
  .get("/admission/excel", streamAdmissionExcelReport)
  .get("/dob", getStudentsBirthDateReport)
  .get("/dob/excel", generateDobExcelReport)
  .get("/dgs", getDgsIndosReport)
  .get("/dgs/excel", streamDgsIndosExcelReport)
  .get("/course-trend-report", getCourseTrendReport)
  .get("/course-trend-report/excel", streamCourseTrendExcelReport)
  .get("/batch", getBatchReport)
  .get("/batch/excel", streamBatchExcelReport)
  .get("/receipt", getReceiptReport)
  .get("/receipt/excel", streamReceiptExcelReport)
  .post("/dob/send-wish", sendBirthdateWish)
