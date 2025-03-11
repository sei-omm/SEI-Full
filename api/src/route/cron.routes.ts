import { Router } from "express";
import { updateInventoryInfoDaily } from "../controller/cron.controller";

export const cronRouter = Router();

cronRouter
    .get("/inventory/update", updateInventoryInfoDaily)