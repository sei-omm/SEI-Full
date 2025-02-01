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
  verifyPayment,
  verifyPaymentForPaymentLink,
} from "../controller/payment.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

export const paymentRouter = Router();
paymentRouter
  .get("/test", test)
  .get("/verify", isAuthenticated, verifyPayment)
  .post("/paid-due-online", isAuthenticated, payDueAmount)

  .post("/refund", initiateRefund)
  .put("/refund", updateRefundDetails)
  .get("/refund", getRefundList) // for account team only

  .get("/verify-due-online-payment", isAuthenticated, verifyOnlineDuePayment)
  .get("/get-paid-amount", getStudentPaidPayment)
  .post("/add", addPayment)

  // .get("/pay/:token", servePaymentPage)
  .post("/verify-payment", verifyPaymentForPaymentLink) // verify payment of link generated link
  .post("/link-email", sendPaymentLinkToEmail)
