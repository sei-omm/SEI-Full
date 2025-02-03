import { Router } from "express";
import {
  addHolidayList,
  getHolidayListBoth,
} from "../controller/holiday.controller";

export const holidayRoutes = Router();

holidayRoutes.post("/add", addHolidayList).get("/", getHolidayListBoth);
