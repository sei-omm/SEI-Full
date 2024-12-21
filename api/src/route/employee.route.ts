import { Router } from "express";
import {
  addNewEmployee,
  generateAllEmployeeExcelSheet,
  getEmployee,
  getEmployeeDocuments,
  getMarketingTeam,
  getSingleEmployeeInfo,
  loginEmployee,
  removeEmployee,
  updateEmployee,
  updateEmployeeActiveStatus,
} from "../controller/employee.controller";
import { upload } from "../middleware/multer";
import { createEmployeeLeaveRequest } from "../controller/leave.controller";

export const employeeRoute = Router();

const uploadFileFilds = [
  { name: "profile_image", maxCount: 1 },
  { name: "resume", maxCount: 1 },
  { name: "pan_card", maxCount: 1 },
  { name: "aadhaar_card", maxCount: 1 },
  { name: "ten_pass_certificate", maxCount: 1 },
  { name: "twelve_pass_certificate", maxCount: 1 },
  { name: "graduation_certificate", maxCount: 1 },
  { name: "other_certificate", maxCount: 1 },
];

employeeRoute
  .get("/", getEmployee)
  .get("/export-sheet", generateAllEmployeeExcelSheet)
  .get("/marketing-team", getMarketingTeam)
  .get("/:employee_id/document", getEmployeeDocuments)
  .get("/:id", getSingleEmployeeInfo)
  .post("/", upload.fields(uploadFileFilds), addNewEmployee)
  .post("/leave", createEmployeeLeaveRequest)
  .put("/:id", updateEmployee)
  .patch("/:id", updateEmployeeActiveStatus)
  .delete("/:id", removeEmployee)
  .post("/login", loginEmployee);
