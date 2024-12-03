import { Router } from "express";
import { uploadCv } from "../controller/job.controller";

export const jobRoute = Router();

jobRoute.post("/upload-cv", uploadCv)