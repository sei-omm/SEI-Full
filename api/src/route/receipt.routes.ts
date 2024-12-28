import { Router } from "express";
import {
  getAdmissionFormReceipt,
  getPaymentReceipt,
} from "../controller/receipt.controller";

export const receiptRoutes = Router();

receiptRoutes
  .get("/payment", getPaymentReceipt)
  .get("/admission", getAdmissionFormReceipt);
