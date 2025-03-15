import { Router } from "express";
import { isAuthenticated } from "../middleware/isAuthenticated";
import {
  createAppraisal,
  getAppraisalList,
  getEmployeeDocuments,
  getSingleAppraisal,
  getSingleEmployeeInfo,
  updateAppraisalReport,
} from "../controller/employee.controller";
import {
  createEmployeeLeaveRequest,
  generateLeaveReceipt,
  getEmployeeLeaveRequest,
  getOthersLeaveList,
  updateLeaveStatus,
} from "../controller/leave.controller";
import {
  completeTranning,
  getSingleTranningFormData,
  getTranningListEmployee,
} from "../controller/tranning.controllers";

export const accountRoute = Router();

accountRoute
  .get("/", isAuthenticated, getSingleEmployeeInfo)
  .get("/documents", isAuthenticated, getEmployeeDocuments)

  .get("/leave", isAuthenticated, getEmployeeLeaveRequest)
  .get("/leave/other", isAuthenticated, getOthersLeaveList)
  .post("/leave", isAuthenticated, createEmployeeLeaveRequest)
  .patch("/leave/:id", isAuthenticated, updateLeaveStatus)
  .get("/leave/receipt/:leave_id", isAuthenticated, generateLeaveReceipt)

  .get("/appraisal", isAuthenticated, getAppraisalList)
  .post("/appraisal", isAuthenticated, createAppraisal)
  .put("/appraisal/:appraisal_id", isAuthenticated, updateAppraisalReport)
  .get("/appraisal/:appraisal_id", isAuthenticated, getSingleAppraisal)

  .get("/tranning", isAuthenticated, getTranningListEmployee)
  .get("/one-form", isAuthenticated, getSingleTranningFormData)
  .put("/complete/:record_id", isAuthenticated, completeTranning);
