import { Router } from "express";
import { uploadStudentsFiles } from "../controller/student.controller";

export const studentUploadRouter = Router();

studentUploadRouter.post("/upload", uploadStudentsFiles)