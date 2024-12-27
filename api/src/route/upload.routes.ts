import { Router } from "express";
import { uploadCandidateResume, uploadDocsFromCRM, uploadStudentDocument, uploadToComplianceRecord } from "../controller/upload.controller";

export const uploadRoute = Router();

uploadRoute
  .post("/student-documents", uploadStudentDocument)
  .post("/student-profile", uploadStudentDocument)
  .post("/employee-profile", uploadStudentDocument)
  .post("/crm-documents", uploadDocsFromCRM)
  .post("/compliance-record", uploadToComplianceRecord)
  .post("/candidate-resume", uploadCandidateResume);
