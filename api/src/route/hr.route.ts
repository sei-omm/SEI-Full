import { Router } from "express";
import {
  addNewDepartment,
  deleteDepartment,
  getAllDepartments,
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

export const hrRouter = Router();

hrRouter
  .get("/dashboard", getHrDashboardInfo)

  .get("/department", getAllDepartments)
  .post("/department", addNewDepartment)
  .patch("/department/:id", updateDepartment)
  .delete("/department/:id", deleteDepartment)

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
  .patch("/attendance/:employee_id", updateEmployeeAttendance);
