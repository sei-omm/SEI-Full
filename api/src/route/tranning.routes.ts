import { Router } from "express";
import {
  getSingleTranningFormData,
  getTranningList,
  getTranningListEmployee,
  generateForm,
  completeTranning,
  getTranningHistoryList,
  renderGeneratedForm,
} from "../controller/tranning.controllers";
import { isAuthenticated } from "../middleware/isAuthenticated";

export const tranningRoutes = Router();

tranningRoutes
  .get("/", getTranningList)
  .get("/history", getTranningHistoryList)
  .get("/employee", isAuthenticated, getTranningListEmployee)
  .post("/", generateForm)
  .get("/one-form", getSingleTranningFormData)
  .put("/complete/:record_id", completeTranning)
  .get("/render-form/:record_id", renderGeneratedForm)
