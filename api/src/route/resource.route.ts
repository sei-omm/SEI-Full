import { Router } from "express";
import { getResources } from "../controller/resource.controller";

export const resourceRouter = Router();

resourceRouter.get("/:filename", getResources);
