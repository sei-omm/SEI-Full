import { Router } from "express";
import {
  getAdmissions,
  // getSingleAdmission,
  saveAdmissionInfo,
  updateEnrollCourseStatus,
  updateFormStatus,
  viewStudentUploadedDocuments,
} from "../controller/admission.controller";

export const admissionRouter = Router();

admissionRouter
  .get("/", getAdmissions)
  .put(
    "/save",
    saveAdmissionInfo
  )
  .patch("/update-form-status", updateFormStatus)
  .get("/student-documents/:student_id", viewStudentUploadedDocuments) //should only access from CRM
  .patch("/enrollment-status/:enroll_id", updateEnrollCourseStatus);
