import { Router } from "express";
import { getPaymentReceipt } from "../controller/receipt.controller";

export const receiptRoutes = Router();

receiptRoutes.get("/payment", getPaymentReceipt);
