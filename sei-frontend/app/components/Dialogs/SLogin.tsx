"use client";

import Button from "../Button";
import OpenDialogButton from "../OpenDialogButton";
import Input from "../Input";
import DialogBody from "./DialogBody";
import { FormEvent } from "react";
import { IResponse, TLoginSuccess } from "@/app/type";
import { setInfo } from "@/app/utils/saveInfo";
import { useDispatch } from "react-redux";
import { setDialog } from "@/app/redux/slice/dialog.slice";
import { setLoginStatus } from "@/app/redux/slice/loginStatus";
import { useRouter } from "next/navigation";
import { useDoMutation } from "@/app/hooks/useDoMutation";

export default function SLogin() {
  const dispatch = useDispatch();
  const route = useRouter();

  const { isLoading, mutate } = useDoMutation();

  const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    mutate({
      apiPath: "/student/login",
      method: "post",
      formData,
      onSuccess: async (response: IResponse<TLoginSuccess>) => {
        await setInfo("login-token", response.data.token as string);
        await setInfo("profile-image", response.data.profile_image as string);
        await setInfo("login-info", JSON.stringify(response.data));
        dispatch(
          setDialog({ type: "CLOSE", dialogKey: "student-login-dialog" })
        );
        route.push(window.location.href);
        dispatch(setLoginStatus({ status: "login" }));
        dispatch(setDialog({ type: "OPEN", dialogKey: "select-our-center" }));
      },
    });
  };

  return (
    <DialogBody withoutDimBackground preventToCloseOnSideClick>
      <div className="space-y-1">
        <h2 className="font-bold text-gray-700 text-2xl">
          Student <span className="text-[#e9b858]">Login</span>
        </h2>
        <p className="text-gray-600 text-sm">
          Enter your username and password to login
        </p>
      </div>
      <form onSubmit={onFormSubmit} className="space-y-2 pt-2">
        <Input
          // label="Email / Indos Number *"
          label="Mobile Number *"
          name="email"
          required
          type="text"
          pattern="^\d{10}$"
          title="Please enter a 10-digit mobile number."
          // placeholder="somnathgupta112@gmail.com"
          placeholder="Enter Your 10-digit mobile number"
        />
        <Input
          label="Password *"
          name="password"
          required
          type="text"
          placeholder="a@admin%^"
        />
        <Button
          isLoading={isLoading}
          disabled={isLoading}
          className="!text-foreground !py-2 !bg-[#e9b858] !mt-3 w-full !border !shadow-none !border-gray-600 hover:!bg-background"
        >
          Login
        </Button>
        {/* <OpenDialogButton
          className="w-full"
          type="OPEN"
          dialogKey="student-register-dialog"
        >
          <Button
            disabled={isLoading}
            className="!text-foreground !py-2 !shadow-none w-full !border !border-gray-600 hover:!bg-background"
          >
            New Student Register Here
          </Button>
        </OpenDialogButton> */}
        <OpenDialogButton
          className="w-full"
          type="OPEN"
          dialogKey="student-register-dialog"
        >
          <span className="block text-center">
            New Student <span className="text-red-600 font-semibold underline animate-pulse">Register Here</span>
          </span>
        </OpenDialogButton>
        <OpenDialogButton
          className="w-full"
          dialogKey="forgot-password-dialog"
          type="OPEN"
        >
          <span className="block text-center text-sm">Forgot Password?</span>
        </OpenDialogButton>
      </form>
    </DialogBody>
  );
}
