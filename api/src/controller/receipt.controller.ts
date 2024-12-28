import asyncErrorHandler from "../middleware/asyncErrorHandler";

export const getPaymentReceipt = asyncErrorHandler(async (req, res) => {
  res.render("payment_recipt");
});
