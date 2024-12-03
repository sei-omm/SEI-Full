"use client";

import { useRazorpay } from "react-razorpay";
import Button from "../Button";
import { IResponse, RazorpaySuccesshandlerTypes } from "@/app/type";
import { toast } from "react-toastify";
import { axiosQuery } from "@/app/utils/axiosQuery";
import { BASE_API } from "@/app/constant";
import { getAuthToken } from "@/app/utils/getAuthToken";
import { useState } from "react";

interface IProps {
  due_amount: number;
  batch_id: number;
}

type EnrollCourseType = {
  order_id: number;
  amount: number;
  razorpay_key: number;
};

export default function PayDueAmountBtn({ batch_id, due_amount }: IProps) {
  const { Razorpay } = useRazorpay();

  const [btnProgress, setBtnProgress] = useState(false);

  const handleDueOnlinePaymentSuccess = async (
    res: RazorpaySuccesshandlerTypes
  ) => {
    const { response, error } = await axiosQuery<IResponse, IResponse>({
      url: `${BASE_API}/payment/verify-due-online-payment?order_id=${res.razorpay_order_id}&batch_id=${batch_id}`,
      method: "get",
      headers: {
        "Content-Type": "application/json",
        ...getAuthToken(),
      },
    });

    if (error !== null) {
      return toast.error(error.message);
    }

    toast.success(response?.message);
  };

  const openRazorpayPaymentPopup = (options: EnrollCourseType | undefined) => {
    const razorpay = new Razorpay({
      key: `${options?.razorpay_key}`,
      amount: options?.amount || 0,
      currency: "INR",
      name: "Paying",
      order_id: `${options?.order_id}`,
      handler: handleDueOnlinePaymentSuccess,
      description: `Paying Due Amount`,
    });

    razorpay.on("payment.failed", () => {
      toast.error("Error While Proccess Your Payment");
    });

    razorpay.open();
  };

  const handlePayDueAmount = async () => {
    setBtnProgress(true);
    const { response, error } = await axiosQuery<
      IResponse,
      IResponse<EnrollCourseType>
    >({
      url: `${BASE_API}/payment/paid-due-online`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        ...getAuthToken(),
      },
      data: {
        batch_id,
      },
    });

    setBtnProgress(false);

    if (error !== null) {
      if (error === undefined) {
        return toast.error("Request Has Canceled");
      }
      return toast.error(error.message);
    }

    openRazorpayPaymentPopup(response?.data);
  };

  return (
    <Button
      spinnerSize="15px"
      isLoading={btnProgress}
      onClick={handlePayDueAmount}
      className="!bg-[#ff22227e] !text-black !border-gray-500 !py-3 font-semibold text-[13px] active:scale-95"
    >
      Pay Due Amount <span className="font-inter">₹{due_amount}</span>
    </Button>
  );
}
