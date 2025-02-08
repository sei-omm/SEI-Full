import { Router } from "express";
import {
  getSingleTranningFormData,
  getTranningList,
  getTranningRequirementListEmployee,
  sendFormData,
} from "../controller/tranning.controllers";
import { isAuthenticated } from "../middleware/isAuthenticated";

export const tranningRoutes = Router();

tranningRoutes
  .get("/", getTranningList)
  .get("/employee", isAuthenticated, getTranningRequirementListEmployee)
  .post("/", sendFormData)
  .get("/one-tranning-form", getSingleTranningFormData)
