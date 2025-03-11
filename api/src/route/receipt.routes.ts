import { Router } from "express";
import {
  getAdmissionFormReceipt,
  paymentReceipt,
} from "../controller/receipt.controller";

export const receiptRoutes = Router();

receiptRoutes
  .get("/payment", paymentReceipt)
  .post("/payment", paymentReceipt)
  .get("/admission", getAdmissionFormReceipt);
