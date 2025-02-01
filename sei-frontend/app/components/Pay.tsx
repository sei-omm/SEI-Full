"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRazorpay } from "react-razorpay";
import SpinnerSvg from "./SpinnerSvg";
import { axiosQuery } from "../utils/axiosQuery";
import { IResponse } from "../type";
import { BASE_API } from "../constant";
import { useRouter } from "next/navigation";

interface IProps {
  amount: number;
  razorpay_key: string;
  order_id: string;
  token: string;
}

export type RazorpaySuccesshandlerTypes = {
  razorpay_signature: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
};

export default function Pay({ amount, razorpay_key, order_id, token }: IProps) {
  const { Razorpay } = useRazorpay();
  const [isLoading, setIsLoading] = useState(true);
  const route = useRouter();

  const handlePaymentSuccess = async (
    rezorpayInof: RazorpaySuccesshandlerTypes
  ) => {
    const { error, response } = await axiosQuery<IResponse, IResponse>({
      url: `${BASE_API}/payment/verify-payment`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        token,
        payment_id: rezorpayInof.razorpay_payment_id,
      },
    });

    if (error !== null) {
      toast.error(error.message);
      return route.push("/payment-failed");
    }

    toast.success(response?.message);
    route.push("/payment-success");
  };

  const openPaymentDialog = () => {
    const razorpay = new Razorpay({
      key: razorpay_key,
      amount: amount,
      currency: "INR",
      name: "Paying",
      order_id: order_id,
      handler: handlePaymentSuccess,
      description: `Online Payment Form Website`,
    });

    razorpay.on("payment.failed", (response) => {
      toast.error(response.error.description);
      route.push("/payment-failed");
    });

    razorpay.open();
  };

  useEffect(() => {
    const interVelId = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        openPaymentDialog();
        clearInterval(interVelId);
        setIsLoading(false);
      } else {
        console.error("Razorpay SDK not loaded.");
      }
    }, 500);

    return () => clearInterval(interVelId);
  }, []);

  return (
    <div className="flex items-center justify-center flex-col py-5 gap-3">
      {isLoading ? (
        <>
          <SpinnerSvg size="30px" />
          <p>Processing Please Wait...</p>
        </>
      ) : (
        <>
          <p className="font-semibold">
            Click The Button Bellow To Fullfill Your Payment
          </p>
          <button
            className="bg-gray-900 text-white min-w-40 py-3 rounded-lg shadow-xl"
            onClick={openPaymentDialog}
          >
            Pay Now
          </button>
        </>
      )}
    </div>
  );
}
