import { Router } from "express";
import {
  addNewEmployee,
  assignAssets,
  assignFacultyCourseSubject,
  checkHoi,
  // createAppraisal,
  deleteAssignAssets,
  employeeLogout,
  // generateAllEmployeeExcelSheet,
  generateAppraisal,
  getAppraisalList,
  getAssignedAssets,
  getEmployee,
  getEmployeeDocuments,
  getFacultyCourseSubject,
  getMarketingTeam,
  getSingleAppraisal,
  getSingleEmployeeInfo,
  isLogin,
  loginEmployee,
  removeEmployee,
  removeFacultyCourseSubject,
  searchEmployeeName,
  // updateAppraisalReport,
  updateAssetReturnDate,
  updateEmployee,
  updateEmployeeActiveStatus,
} from "../controller/employee.controller";
import {
  getEmployeeLeaveRequest,
} from "../controller/leave.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { checkPermission } from "../middleware/checkPermission";

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
  .get("/", isAuthenticated, checkPermission, getEmployee)
  // .get("/export-sheet", generateAllEmployeeExcelSheet)
  .get("/marketing-team", getMarketingTeam)
  .get("/leave", isAuthenticated, checkPermission, getEmployeeLeaveRequest)
  .get("/search", searchEmployeeName)

  .get("/appraisal", isAuthenticated, checkPermission, getAppraisalList)
  .get("/appraisal/print/:appraisal_id", isAuthenticated, checkPermission, generateAppraisal)
  .get("/appraisal/:appraisal_id", isAuthenticated, checkPermission, getSingleAppraisal)
  // .post("/appraisal", isAuthenticated, checkPermission, createAppraisal)
  // .put("/appraisal/:appraisal_id", isAuthenticated, checkPermission, updateAppraisalReport)

  .get("/assets/:employee_id", isAuthenticated, checkPermission, getAssignedAssets)
  .post("/assets", isAuthenticated, checkPermission, assignAssets)
  .delete("/assets/:assets_id", isAuthenticated, checkPermission, deleteAssignAssets)
  .patch("/assets/:assets_id", isAuthenticated, checkPermission, updateAssetReturnDate)

  .get("/:employee_id/document", isAuthenticated, checkPermission, getEmployeeDocuments)

  .post("/", isAuthenticated, checkPermission, addNewEmployee)
  .put("/:id", updateEmployee)
  .patch("/:id", updateEmployeeActiveStatus)
  .delete("/:id", removeEmployee)
  .post("/login", loginEmployee)
  .post("/logout", employeeLogout)
  .get("/faculty-assign-course/:faculty_id", getFacultyCourseSubject)
  .post("/faculty-assign-course", assignFacultyCourseSubject)
  .delete(
    "/faculty-assign-course/:faculty_id/:course_id",
    removeFacultyCourseSubject
  )
  .get("/is-hoi-exist", checkHoi)
  .get("/is-login", isAuthenticated, isLogin)
  
  .get("/:id", isAuthenticated, checkPermission, getSingleEmployeeInfo);
