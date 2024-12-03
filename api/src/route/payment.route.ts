import { Router } from "express";
import {
  addPayment,
  payDueAmount,
  test,
  verifyOnlineDuePayment,
  verifyPayment,
} from "../controller/payment.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

export const paymentRouter = Router();
paymentRouter
  .get("/test", test)
  .get("/verify", isAuthenticated, verifyPayment)
  .post("/paid-due-online", isAuthenticated, payDueAmount)
  .get("/verify-due-online-payment", isAuthenticated, verifyOnlineDuePayment)
  .post("/add", addPayment);
