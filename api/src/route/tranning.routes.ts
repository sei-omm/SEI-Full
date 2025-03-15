import { Router } from "express";
import {
  getSingleTranningFormData,
  getTranningList,
  // getTranningListEmployee,
  generateForm,
  completeTranning,
  getTranningHistoryList,
  renderGeneratedForm,
} from "../controller/tranning.controllers";

export const tranningRoutes = Router();

tranningRoutes
  .get("/", getTranningList)
  .get("/history", getTranningHistoryList)
  // .get("/employee", getTranningListEmployee) //isAuthenticated needed but i set it globally in index.ts
  .post("/", generateForm)
  .get("/one-form", getSingleTranningFormData)
  .put("/complete/:record_id", completeTranning)
  .get("/render-form/:record_id", renderGeneratedForm)
