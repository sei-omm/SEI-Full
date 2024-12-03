import { Router } from "express";
import {
  getAdmissions,
  // getSingleAdmission,
  saveAdmissionInfo,
  updateEnrollCourseStatus,
  updateFormStatus,
  viewStudentUploadedDocuments,
} from "../controller/admission.controller";
import { upload } from "../middleware/multer";

export const admissionRouter = Router();

admissionRouter
  .get("/", getAdmissions)
  .put(
    "/save",
    upload.fields([
      { name: "id_proof", maxCount: 1 },
      { name: "address_proof", maxCount: 1 },
      { name: "academic_proof", maxCount: 1 },
    ]),
    saveAdmissionInfo
  )
  .patch("/update-form-status", updateFormStatus)
  .get("/student-documents/:student_id", viewStudentUploadedDocuments) //should only access from CRM
  .patch("/enrollment-status/:enroll_id", updateEnrollCourseStatus);
