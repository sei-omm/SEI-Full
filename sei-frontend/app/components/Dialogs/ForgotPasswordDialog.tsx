"use client";

import Input from "../Input";
import Button from "../Button";
import { IoCloseOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { setDialog } from "@/app/redux/slice/dialog.slice";
import DialogBody from "./DialogBody";
import { FormEvent, useState } from "react";
import { IResponse } from "@/app/type";
import { doQuery } from "doquery";
import { BASE_API } from "@/app/constant";
import { toast } from "react-toastify";

export default function ForgotPasswordDialog() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const closeDialog = () => {
    dispatch(
      setDialog({
        type: "CLOSE",
        dialogKey: "",
      })
    );
  };

  async function onFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    const { error, response } = await doQuery<IResponse, IResponse>({
      url: BASE_API + "/student/forgot-password",
      method: "POST",
      body: {
        email: formData.get("email"),
      },
    });

    setIsLoading(false);

    if (error) return toast.error(error.message);
    toast.success(response?.message);
    dispatch(setDialog({ type: "CLOSE", dialogKey: "" }));
  }

  return (
    <DialogBody>
      <IoCloseOutline
        onClick={closeDialog}
        size={20}
        className="absolute top-6 right-6 cursor-pointer active:scale-75"
      />
      <div className="space-y-1">
        <h2 className="font-bold text-gray-700 text-2xl">
          Forgot <span className="text-[#e9b858]">Password</span>
        </h2>
        <p className="text-gray-600 text-sm">
          Enter your registered email address
        </p>
      </div>
      <form onSubmit={onFormSubmit} className="space-y-2 pt-2">
        <Input
          name="email"
          required
          type="email"
          placeholder="Registered email address"
        />
        <Button
          disabled={isLoading}
          isLoading={isLoading}
          className="!text-foreground !py-2 !bg-[#e9b858] !mt-3 w-full !border !shadow-none !border-gray-600 hover:!bg-background"
        >
          Send Verification Email
        </Button>
      </form>
    </DialogBody>
  );
}
