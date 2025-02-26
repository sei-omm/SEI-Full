import { Router } from "express";
import {
  addNewEmployee,
  assignAssets,
  assignFacultyCourseSubject,
  checkHoi,
  createAppraisal,
  deleteAssignAssets,
  generateAllEmployeeExcelSheet,
  generateAppraisal,
  getAppraisalList,
  getAssignedAssets,
  getEmployee,
  getEmployeeDocuments,
  getFacultyCourseSubject,
  getMarketingTeam,
  getSingleAppraisal,
  getSingleEmployeeInfo,
  loginEmployee,
  removeEmployee,
  removeFacultyCourseSubject,
  searchEmployeeName,
  updateAppraisalReport,
  updateAssetReturnDate,
  updateEmployee,
  updateEmployeeActiveStatus,
} from "../controller/employee.controller";
import { upload } from "../middleware/multer";
import {
  createEmployeeLeaveRequest,
  getEmployeeLeaveRequest,
} from "../controller/leave.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { roles } from "../middleware/roles";

export const employeeRoute = Router();

// const uploadFileFilds = [
//   { name: "profile_image", maxCount: 1 },
//   { name: "resume", maxCount: 1 },
//   { name: "pan_card", maxCount: 1 },
//   { name: "aadhaar_card", maxCount: 1 },
//   { name: "ten_pass_certificate", maxCount: 1 },
//   { name: "twelve_pass_certificate", maxCount: 1 },
//   { name: "graduation_certificate", maxCount: 1 },
//   { name: "other_certificate", maxCount: 1 },
// ];

employeeRoute
  .get("/", getEmployee)
  .get("/export-sheet", generateAllEmployeeExcelSheet)
  .get("/marketing-team", getMarketingTeam)
  .get("/leave", isAuthenticated, getEmployeeLeaveRequest)
  .get("/search", searchEmployeeName)

  .get("/appraisal", isAuthenticated, getAppraisalList)
  .get("/appraisal/print/:appraisal_id", generateAppraisal)
  .get("/appraisal/:appraisal_id", getSingleAppraisal)
  .post("/appraisal", isAuthenticated, createAppraisal)
  .put("/appraisal/:appraisal_id", isAuthenticated, updateAppraisalReport)

  .get("/assets/:employee_id", getAssignedAssets)
  .post("/assets", assignAssets)
  .delete("/assets/:assets_id", deleteAssignAssets)
  .patch("/assets/:assets_id", updateAssetReturnDate)

  .get("/:employee_id/document", isAuthenticated, getEmployeeDocuments)

  .post("/", addNewEmployee)
  .post("/leave", isAuthenticated, createEmployeeLeaveRequest)
  .put("/:id", updateEmployee)
  .patch("/:id", updateEmployeeActiveStatus)
  .delete("/:id", removeEmployee)
  .post("/login", loginEmployee)
  .get("/faculty-assign-course/:faculty_id", getFacultyCourseSubject)
  .post("/faculty-assign-course", assignFacultyCourseSubject)
  .delete(
    "/faculty-assign-course/:faculty_id/:course_id",
    removeFacultyCourseSubject
  )
  .get("/is-hoi-exist", checkHoi)

  .get("/:id", isAuthenticated, getSingleEmployeeInfo);
