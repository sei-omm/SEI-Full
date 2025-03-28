import { Router } from "express";
import {
  addDesignation,
  addNewDepartment,
  deleteDepartment,
  getAllDepartments,
  getAllDesignation,
  getSingleDepartment,
  updateDepartment,
} from "../controller/department.controllers";
import {
  addEarnLeaveToAllEmployee,
  addLeaveValuesYearly,
  generateLeaveReceipt,
  getEachEmployeLeaveDetails,
  getRequestedLeaveLists,
} from "../controller/leave.controller";
import {
  applyJobAsCandidate,
  getAJob,
  getAllJobs,
  getCandidateJobApplication,
  postNewJob,
  removeJobPosting,
  trackJobApplication,
  updateCandidateApplicationStatus,
  updateJobPosting,
} from "../controller/job.controller";
import {
  addNewEmployeeAttendance,
  generateAttendanceSheet,
  getAllEmployeeAllAttendances,
  updateEmployeeAttendance,
} from "../controller/attendance.controller";
import { getHrDashboardInfo } from "../controller/employee.controller";
import {
  addPayscale,
  deletePayscale,
  getPayscale,
  updatePayscale,
} from "../controller/payscale.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { checkPermission } from "../middleware/checkPermission";

export const hrRouter = Router();

hrRouter
  .get("/dashboard", isAuthenticated, checkPermission, getHrDashboardInfo)

  .get("/department", getAllDepartments)
  .get("/department/:department_id", getSingleDepartment)

  .post("/department", isAuthenticated, checkPermission, addNewDepartment)
  .put(
    "/department/:department_id",
    isAuthenticated,
    checkPermission,
    updateDepartment
  )
  .delete(
    "/department/:department_id",
    isAuthenticated,
    checkPermission,
    deleteDepartment
  )

  .get("/payscale", getPayscale)
  .post("/payscale", isAuthenticated, checkPermission, addPayscale)
  .put(
    "/payscale/:payscale_id",
    isAuthenticated,
    checkPermission,
    updatePayscale
  ) // not using
  .delete(
    "/payscale/:item_id",
    isAuthenticated,
    checkPermission,
    deletePayscale
  )

  .get("/leave", isAuthenticated, checkPermission, getRequestedLeaveLists)
  // .get("/leave/other", isAuthenticated, checkPermission, getOthersLeaveList)
  .get(
    "/leave/employees",
    isAuthenticated,
    checkPermission,
    getEachEmployeLeaveDetails
  )
  .get(
    "/leave/receipt/:leave_id",
    isAuthenticated,
    checkPermission,
    generateLeaveReceipt
  )
  // .post("/leave", createLeaveRequest) //this will done by employee
  // .patch("/leave/:id", isAuthenticated, checkPermission, updateLeaveStatus)
  // .delete("/leave/:id", isAuthenticated, checkPermission, removeLeaveRequestRow)
  .post(
    "/leave/add-earn-leave",
    isAuthenticated,
    checkPermission,
    addEarnLeaveToAllEmployee
  ) // triggre this api form github action every month
  .post(
    "/leave/add-yearly-leave",
    isAuthenticated,
    checkPermission,
    addLeaveValuesYearly
  ) // triggre this api form github action every month

  .get("/job", isAuthenticated, checkPermission, getAllJobs)
  .get("/job/:id", isAuthenticated, checkPermission, getAJob)
  .post("/job", isAuthenticated, checkPermission, postNewJob)
  .put("/job/:id", isAuthenticated, checkPermission, updateJobPosting)
  .delete("/job/:id", isAuthenticated, checkPermission, removeJobPosting)
  .get(
    "/job/apply/:job_id",
    isAuthenticated,
    checkPermission,
    getCandidateJobApplication
  )
  .patch(
    "/job/apply/:application_list_id",
    isAuthenticated,
    checkPermission,
    updateCandidateApplicationStatus
  )

  .get("/job/apply/track/:application_id", trackJobApplication)
  .post("/job/apply", applyJobAsCandidate)

  //for attendance system
  .get(
    "/attendance",
    isAuthenticated,
    checkPermission,
    getAllEmployeeAllAttendances
  )
  .get(
    "/attendance/export-sheet",
    isAuthenticated,
    checkPermission,
    generateAttendanceSheet
  )
  .post(
    "/attendance",
    isAuthenticated,
    checkPermission,
    addNewEmployeeAttendance
  )
  .patch(
    "/attendance",
    isAuthenticated,
    checkPermission,
    updateEmployeeAttendance
  )

  .get("/designation", getAllDesignation)
  .post("/designation", addDesignation);
