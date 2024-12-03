import { Router } from "express";
import { setupDB } from "../controller/setupdb.controller";

export const setupDbRoute = Router();

setupDbRoute.get("/setup", setupDB);
