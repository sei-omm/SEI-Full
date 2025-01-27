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
  getRequestedLeaveLists,
  updateLeaveStatus,
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
import { roles } from "../middleware/roles";
import { addPayscale, deletePayscale, getPayscale, updatePayscale } from "../controller/payscale.controller";

export const hrRouter = Router();

hrRouter
  .get("/dashboard", getHrDashboardInfo)

  .get("/department", getAllDepartments)
  .get("/department/:department_id", getSingleDepartment)
  .post("/department", addNewDepartment)
  .put("/department/:department_id", updateDepartment)
  .delete("/department/:department_id", deleteDepartment)

  .get("/payscale", getPayscale)
  .post("/payscale", addPayscale)
  .put("/payscale/:payscale_id", updatePayscale) // not using
  .delete("/payscale/:item_id", deletePayscale)

  .get("/leave", roles(["Admin"]), getRequestedLeaveLists)
  // .post("/leave", createLeaveRequest) //this will done by employee
  .patch("/leave/:id", updateLeaveStatus)

  .get("/job", getAllJobs)
  .get("/job/:id", getAJob)
  .post("/job", postNewJob)
  .put("/job/:id", updateJobPosting)
  .delete("/job/:id", removeJobPosting)

  .get("/job/apply/:job_id", getCandidateJobApplication)
  .patch("/job/apply/:application_list_id", updateCandidateApplicationStatus)
  .get("/job/apply/track/:application_id", trackJobApplication)
  .post("/job/apply", applyJobAsCandidate)

  //for attendance system
  .get("/attendance", getAllEmployeeAllAttendances)
  .get("/attendance/export-sheet", generateAttendanceSheet)
  .post("/attendance", addNewEmployeeAttendance)
  .patch("/attendance/:employee_id", updateEmployeeAttendance)

  .get("/designation", getAllDesignation)
  .post("/designation", addDesignation);
