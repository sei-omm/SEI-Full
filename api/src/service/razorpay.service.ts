import Razorpay from "razorpay";
import { v4 as uuidv4 } from "uuid";

export const createOrder = async (productAmount: number) => {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
  });

  const options = {
    amount: productAmount,
    currency: "INR",
    receipt: uuidv4(),
    payment_capture: 1,
  };

  return razorpay.orders.create(options);
};

export const fetchAnOrderInfo = async (order_id: string) => {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
  });

  return razorpay.orders.fetch(order_id);
};
