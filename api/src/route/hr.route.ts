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
  getEachEmployeLeaveDetails,
  getRequestedLeaveLists,
  removeLeaveRequestRow,
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
import {
  addPayscale,
  deletePayscale,
  getPayscale,
  updatePayscale,
} from "../controller/payscale.controller";

export const hrRouter = Router();

hrRouter
  .get(
    "/dashboard",
    roles({
      roles: ["Admin"],
    }),
    getHrDashboardInfo
  )

  .get("/department", getAllDepartments)
  .get("/department/:department_id", getSingleDepartment)
  .post("/department", addNewDepartment)
  .put("/department/:department_id", updateDepartment)
  .delete("/department/:department_id", deleteDepartment)

  .get("/payscale", getPayscale)
  .post("/payscale", addPayscale)
  .put("/payscale/:payscale_id", updatePayscale) // not using
  .delete("/payscale/:item_id", deletePayscale)

  .get(
    "/leave",
    roles({
      roles: ["Admin"],
    }),
    getRequestedLeaveLists
  )
  .get("/leave/employees", getEachEmployeLeaveDetails)
  // .post("/leave", createLeaveRequest) //this will done by employee
  .patch("/leave/:id", updateLeaveStatus)
  .delete("/leave/:id", removeLeaveRequestRow)
  .post("/leave/add-earn-leave", addEarnLeaveToAllEmployee) // triggre this api form github action every month
  .post("/leave/add-yearly-leave", addLeaveValuesYearly) // triggre this api form github action every month

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
  .patch("/attendance", updateEmployeeAttendance)

  .get("/designation", getAllDesignation)
  .post("/designation", addDesignation);
