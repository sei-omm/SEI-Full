"use client";

import { FormEvent, useEffect, useState } from "react";
import Button from "../Button";
import Input from "../Input";
import DialogBody from "./DialogBody";
import { doQuery } from "doquery";
import { BASE_API } from "@/app/constant";
import { toast } from "react-toastify";
import { IResponse } from "@/app/type";
import { useDispatch, useSelector } from "react-redux";
import { setDialog } from "@/app/redux/slice/dialog.slice";
import { RootState } from "@/app/redux/store";
import { useDoMutation } from "@/app/hooks/useDoMutation";
import SpinnerSvg from "../SpinnerSvg";

export default function Otp() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const [coundown, setCoundown] = useState(-1);
  const countdownDuration = 60000;

  const handleCoundown = (startTime: number) => {
    const interval = setInterval(() => {
      const currentTime = new Date().getTime(); // Get current time
      const elapsedTime = currentTime - startTime; // Calculate elapsed time
      const remainingTime = countdownDuration - elapsedTime; // Calculate remaining time

      if (remainingTime <= 0) {
        clearInterval(interval); // Stop countdown when it reaches zero
        setCoundown(0);
        localStorage.removeItem("resend-time");
      } else {
        const secondsLeft = Math.ceil(remainingTime / 1000); // Convert to seconds
        setCoundown(secondsLeft);
      }
    }, 1000); // Update every second
  };

  const { extraValue } = useSelector((state: RootState) => state.dialog);

  async function onFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    const studentExistInfo = {...extraValue};

    const formData = new FormData(event.currentTarget);
    studentExistInfo.otp = formData.get("otp");

    const { error, response } = await doQuery<IResponse, IResponse>({
      url: BASE_API + "/student/verify-otp",
      method: "POST",
      body: studentExistInfo,
    });

    setIsLoading(false);

    if (error) return toast.error(error.message);
    // localStorage.removeItem("student-info");
    toast.success(response?.message);
    dispatch(setDialog({ type: "OPEN", dialogKey: "student-login-dialog" }));
  }

  useEffect(() => {
    const resendTime = localStorage.getItem("resend-time");
    if (resendTime !== null) {
      const currentTime = new Date().getTime();
      const elapsedTime = currentTime - parseInt(resendTime);
      const remainingTime = countdownDuration - elapsedTime;
      setCoundown(Math.ceil(remainingTime / 1000));
      handleCoundown(parseInt(resendTime));
    }
  }, []);

  const { isLoading: isResending, mutate: resend } = useDoMutation();
  const handleResendOtp = async () => {
    resend({
      apiPath: "/student/resend-otp",
      method: "post",
      formData: {
        mobile_number: extraValue.mobile_number,
      },
      onSuccess() {
        localStorage.setItem("resend-time", new Date().getTime().toString());
        setCoundown(60);
        handleCoundown(new Date().getTime());
      },
    });
  };

  return (
    <DialogBody preventToClose preventToCloseOnSideClick>
      <div className="space-y-1">
        <h2 className="font-bold text-gray-700 text-2xl">
          Verify <span className="text-[#e9b858]">Email ID</span>
        </h2>
        <p className="text-gray-600 text-sm">
          Enter otp which we have sent to this{" "}
          <span className="underline">{extraValue?.mobile_number}</span> mobile
          number
        </p>
      </div>
      <form onSubmit={onFormSubmit} className="space-y-2 pt-2">
        <Input name="otp" required type="text" placeholder="OTP" />
        <Button
          isLoading={isLoading}
          disabled={isLoading || isResending}
          className="!text-foreground !py-2 !bg-[#e9b858] !mt-3 w-full !border !shadow-none !border-gray-600 hover:!bg-background"
        >
          Verify Otp
        </Button>

        {coundown <= 0 ? (
          <div className="flex items-center justify-center">
            {isResending ? (
              <SpinnerSvg size="15px" />
            ) : (
              <button
                disabled={isResending}
                onClick={handleResendOtp}
                type="button"
                className="block text-sm cursor-pointer font-semibold text-green-700"
              >
                Resend otp
              </button>
            )}
          </div>
        ) : (
          <span className="block text-center">
            Resend OTP again after {coundown}
          </span>
        )}
      </form>
    </DialogBody>
  );
}
