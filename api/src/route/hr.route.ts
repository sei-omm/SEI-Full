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
import { upload } from "../middleware/multer";
import {
  addNewEmployeeAttendance,
  generateAttendanceSheet,
  getAllEmployeeAllAttendances,
  updateEmployeeAttendance,
} from "../controller/attendance.controller";
import { getHrDashboardInfo } from "../controller/employee.controller";

export const hrRouter = Router();

hrRouter
  .get("/dashboard", getHrDashboardInfo)

  .get("/department", getAllDepartments)
  .post("/department", addNewDepartment)
  .patch("/department/:id", updateDepartment)
  .delete("/department/:id", deleteDepartment)

  .get("/leave", getRequestedLeaveLists)
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
  .post("/job/apply", upload.single("resume"), applyJobAsCandidate)

  //for attendance system
  .get("/attendance", getAllEmployeeAllAttendances)
  .get("/attendance/export-sheet", generateAttendanceSheet)
  .post("/attendance", addNewEmployeeAttendance)
  .patch("/attendance/:employee_id", updateEmployeeAttendance);
