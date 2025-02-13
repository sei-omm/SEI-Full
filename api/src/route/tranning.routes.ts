import { Router } from "express";
import {
  getSingleTranningFormData,
  getTranningList,
  getTranningListEmployee,
  generateForm,
  completeTranning,
  getTranningHistoryList,
} from "../controller/tranning.controllers";
import { isAuthenticated } from "../middleware/isAuthenticated";

export const tranningRoutes = Router();

tranningRoutes
  .get("/", getTranningList)
  .get("/history", getTranningHistoryList)
  .get("/employee", isAuthenticated, getTranningListEmployee)
  .post("/", generateForm)
  .get("/one-form", getSingleTranningFormData)
  .put("/complete/:record_id", completeTranning);
