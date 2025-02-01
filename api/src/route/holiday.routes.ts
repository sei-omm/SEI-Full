import { Router } from "express";
import { addHolidayList } from "../controller/holiday.controller";

export const holidayRoutes = Router();

holidayRoutes.post("/add", addHolidayList);