import { Router } from "express";
import {
  addPayment,
  getStudentPaidPayment,
  payDueAmount,
  refundPayment,
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
  .post("/refund", refundPayment)
  .get("/verify-due-online-payment", isAuthenticated, verifyOnlineDuePayment)
  .get("/get-paid-amount", getStudentPaidPayment)
  .post("/add", addPayment);
