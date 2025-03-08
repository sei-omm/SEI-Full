import { Router } from "express";
import {
  addPayment,
  getRefundList,
  getStudentPaidPayment,
  initiateRefund,
  payDueAmount,
  sendPaymentLinkToEmail,
  test,
  updateRefundDetails,
  verifyOnlineDuePayment,
  verify,
} from "../controller/payment.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

export const paymentRouter = Router();
paymentRouter
  .get("/test", test)
  .post("/verify", verify)
  .post("/paid-due-online", isAuthenticated, payDueAmount)

  .post("/refund", initiateRefund)
  .put("/refund", updateRefundDetails)
  .get("/refund", getRefundList) // for account team only

  .get("/verify-due-online-payment", isAuthenticated, verifyOnlineDuePayment)
  .get("/get-paid-amount", getStudentPaidPayment)
  .post("/add", addPayment)

  // .get("/pay/:token", servePaymentPage)
  .post("/link-email", sendPaymentLinkToEmail)
