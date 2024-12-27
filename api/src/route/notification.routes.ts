import { Router } from "express";
import { getNotification, sendNotification } from "../controller/notification.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

export const notificationRoutes = Router();

notificationRoutes.get("/", isAuthenticated, getNotification);
notificationRoutes.post("/", isAuthenticated, sendNotification);

