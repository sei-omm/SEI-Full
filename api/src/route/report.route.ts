import { Router } from "express";
import {
  createAdmissionReport,
  generateAdmissionExcelReport,
  generateDobExcelReport,
  generateTimeTableReport,
  getBatchReport,
  getBatchReportExcel,
  getCourseTrendExcelReport,
  getCourseTrendReport,
  getDgsIndosReport,
  getOccupancyReport,
  getReceiptReport,
  getReceiptReportExcel,
  getRefundReport,
  getStudentsBirthDateReport,
  inventoryReport,
  sendBirthdateWish,
} from "../controller/report.controller";
import { stramTimeTableReport, streamAdmissionExcelReport, streamBatchExcelReport, streamCourseTrendExcelReport, streamDgsIndosExcelReport, streamInventoryReport, streamOccupancyExcelReport, streamReceiptExcelReport, streamRefundExcelReport } from "../controller/stream.report";

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
  .get("/occupancy", getOccupancyReport)
  .get("/occupancy/excel", streamOccupancyExcelReport)
  .get("/refund", getRefundReport)
  .get("/refund/excel", streamRefundExcelReport)
  .get("/inventory", inventoryReport)
  .get("/inventory/excel", streamInventoryReport)
  .get("/time-table", generateTimeTableReport)
  .get("/time-table/excel", stramTimeTableReport)
