import React, { useRef, useState } from "react";
import DialogBody from "./DialogBody";
import Button from "../Button";
import { RadioInput } from "../RadioInput";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { getAuthToken } from "@/app/utils/getAuthToken";
import { BASE_API } from "@/app/constant";
import { IResponse, RazorpaySuccesshandlerTypes } from "@/app/type";
import { axiosQuery } from "@/app/utils/axiosQuery";
import { useRazorpay } from "react-razorpay";
import { toast } from "react-toastify";
import { setDialog } from "@/app/redux/slice/dialog.slice";

type EnrollCourseType = {
  order_id: number;
  amount: number;
  razorpay_key: number;
};

export default function ProcessPaymentDialog() {
  const { extraValue } = useSelector((state: RootState) => state.dialog);
  const [paymentModeIndex, setPaymentModeIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { Razorpay } = useRazorpay();

  const dispatch = useDispatch();

  const instituteName = useRef<string>("");

  const batchIdsInString = extraValue.batch_ids;
  const courseIds = extraValue.course_ids;
  const isInWaitingLists = extraValue.isInWaitingLists;
  // const instituteNames = extraValue.institutes;

  const handlePaymentSuccess = async (res: RazorpaySuccesshandlerTypes) => {
    const { error, response } = await axiosQuery<IResponse, IResponse>({
      url: `${BASE_API}/payment/verify?order_id=${res.razorpay_order_id}&batch_ids=${batchIdsInString}&course_ids=${courseIds}&institute=${instituteName.current}&is_in_waiting_list=${isInWaitingLists}`,
      method: "get",
      headers: {
        "Content-Type": "application/json",
        ...getAuthToken(),
      },
    });

    if (error !== null) {
      return toast.error(error.message);
    }

    dispatch(
      setDialog({
        type: "OPEN",
        dialogKey: "upload-documents-dialog",
        extraValue: { courseIds, preventToClose: true },
      })
    );

    toast.success(response?.message);
  };

  const openRazorpayPaymentPopup = (options: EnrollCourseType | undefined) => {
    const razorpay = new Razorpay({
      key: `${options?.razorpay_key}`,
      amount: options?.amount || 0,
      currency: "INR",
      name: "Paying",
      order_id: `${options?.order_id}`,
      handler: handlePaymentSuccess,
      description: `Online Payment Form Website`,
    });

    razorpay.on("payment.failed", () => {
      toast.error("Error While Proccess Your Payment");
    });

    razorpay.open();
  };

  const handlePayAndEnrollBtn = async () => {
    const userSelectedInstitute = localStorage.getItem(
      "user-selected-institute"
    );

    if (!userSelectedInstitute) {
      dispatch(setDialog({ type: "OPEN", dialogKey: "select-our-center" }));
      return;
    }

    instituteName.current = userSelectedInstitute;

    const formData = new FormData(extraValue.currentTarget ?? undefined);
    setIsLoading(true);

    formData.append(
      "payment_mode",
      paymentModeIndex === 0 ? "Part-Payment" : "Full-Payment"
    );

    const { error, response } = await axiosQuery<
      IResponse,
      IResponse<EnrollCourseType>
    >({
      url: `${BASE_API}/course/enroll?batch_ids=${batchIdsInString}`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        ...getAuthToken(),
      },
      data: formData,
      // signal : controllerRef.current.signal
    });

    setIsLoading(false);

    if (error !== null) {
      if (error === undefined) {
        return toast.error("Request Has Canceled");
      }
      return toast.error(error.message);
    }

    openRazorpayPaymentPopup(response?.data);
  };

  return (
    <DialogBody className="w-[30rem] space-y-5">
      <span className="block mt-10 text-2xl">
        <span>Course Fee : </span>
        <span className="font-inter">₹</span>
        {extraValue.totalPrice}
        {/* {course.total_price} */}
      </span>

      {/* Payment Mode */}
      <div className="text-xl flex items-center flex-wrap gap-x-7 gap-y-5">
        <h2>Payment Mode : </h2>

        <RadioInput
          onClick={() => setPaymentModeIndex(0)}
          className="!text-sm"
          label="Part Payment"
          checked={paymentModeIndex === 0 ? true : false}
        />
        <RadioInput
          onClick={() => setPaymentModeIndex(1)}
          className="!text-sm"
          label="Full Payment"
          checked={paymentModeIndex === 1 ? true : false}
        />
      </div>

      {/* {course.min_pay_percentage} */}

      {/* {paymentModeIndex === 1 ? (
        <div className="space-y-3">
          <Input
            name="student_paying"
            type="number"
            onChange={(e) => setUserPayingValue(parseInt(e.target.value) || 0)}
            defaultValue={course.total_price?.toString()}
            placeholder="Enter amount you want to pay"
          />
          <p
            className={`font-medium ${
              userPayingValue < minPayingValue ||
              userPayingValue > course.total_price
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            You are paying : <span className="font-serif">₹</span>
            {userPayingValue}
          </p>
          <p className="text-green-600 font-medium">
            Minimum to pay : <span className="font-serif">₹</span>
            {minPayingValue}
          </p>
        </div>
      ) : null} */}

      <Button
        disabled={isLoading}
        isLoading={isLoading}
        onClick={handlePayAndEnrollBtn}
        className="!border !border-gray-400 !bg-[#E9B858] !text-black card-shdow !min-w-60 active:scale-75"
      >
        <span>
          Pay{" "}
          <span className="font-inter font-semibold">
            ₹
            {paymentModeIndex === 0
              ? extraValue.minToPay
              : extraValue.totalPrice}
          </span>{" "}
          To Enroll
        </span>
      </Button>
    </DialogBody>
  );
}
