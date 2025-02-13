import { Router } from "express";
import {
  getNotification,
  readNotification,
  createAndSendNotification,
  sendNotification,
} from "../controller/notification.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

export const notificationRoutes = Router();

// notificationRoutes.get("/", isAuthenticated, getNotification);
// notificationRoutes.post("/", isAuthenticated, sendNotification);

notificationRoutes
  .get("/", isAuthenticated, getNotification)
  .delete("/read/:notification_sended_id", isAuthenticated, readNotification)
  .post("/create-send", isAuthenticated, createAndSendNotification)
  .post("/send", isAuthenticated, sendNotification)
