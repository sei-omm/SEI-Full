"use client";

import { FormEvent, useState } from "react";
import Button from "../Button";
import Input from "../Input";
import DialogBody from "./DialogBody";
import { doQuery } from "doquery";
import { BASE_API } from "@/app/constant";
import { toast } from "react-toastify";
import { IResponse } from "@/app/type";
import { useDispatch } from "react-redux";
import { setDialog } from "@/app/redux/slice/dialog.slice";

export default function Otp() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  async function onFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);

    const studentExistInfo = JSON.parse(
      localStorage.getItem("student-info") || ""
    );

    const formData = new FormData(event.currentTarget);
    studentExistInfo.otp = formData.get("otp");

    const { error, response } = await doQuery<IResponse, IResponse>({
      url: BASE_API + "/student/verify-otp",
      method: "POST",
      body: studentExistInfo,
    });

    setIsLoading(false);

    if (error) return toast.error(error.message);
    localStorage.removeItem("student-info");
    toast.success(response?.message);
    dispatch(setDialog({ type: "OPEN", dialogKey: "student-login-dialog" }));
  }

  return (
    <DialogBody>
      <div className="space-y-1">
        <h2 className="font-bold text-gray-700 text-2xl">
          Verify <span className="text-[#e9b858]">Email ID</span>
        </h2>
        <p className="text-gray-600 text-sm">
          Enter otp which we have sended to your register email
        </p>
      </div>
      <form onSubmit={onFormSubmit} className="space-y-2 pt-2">
        <Input name="otp" required type="text" placeholder="OTP" />
        <Button
          isLoading={isLoading}
          disabled={isLoading}
          className="!text-foreground !py-2 !bg-[#e9b858] !mt-3 w-full !border !shadow-none !border-gray-600 hover:!bg-background"
        >
          Verify Otp
        </Button>

        {/* <span
         
          className="block text-center text-sm cursor-pointer"
        >
          Resend Otp?
        </span> */}
      </form>
    </DialogBody>
  );
}
