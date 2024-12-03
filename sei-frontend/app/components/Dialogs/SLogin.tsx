"use client";

import Button from "../Button";
import OpenDialogButton from "../OpenDialogButton";
import Input from "../Input";
import DialogBody from "./DialogBody";
import { FormEvent, useState } from "react";
import { doQuery } from "doquery";
import { BASE_API } from "@/app/constant";
import { IResponse, TLoginSuccess } from "@/app/type";
import { toast } from "react-toastify";
import { setInfo } from "@/app/utils/saveInfo";
import { useDispatch } from "react-redux";
import { setDialog } from "@/app/redux/slice/dialog.slice";
import { setLoginStatus } from "@/app/redux/slice/loginStatus";
import { useRouter } from "next/navigation";

export default function SLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const route = useRouter();

  const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setIsLoading(true);

    const { error, response } = await doQuery<
      IResponse<TLoginSuccess>,
      IResponse<null>
    >({
      url: BASE_API + "/student/login",
      method: "POST",
      body: {
        email: formData.get("email"),
        password: formData.get("password"),
      },
    });

    if (error != null) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    // await setInfo("login-token", response?.data.token as string);
    // await setInfo("profile-image", response?.data.profile_image as string);
    await setInfo("login-info", JSON.stringify(response?.data));
    dispatch(setDialog({ type: "CLOSE", dialogKey: "student-login-dialog" }));
    toast.success(response?.message);
    setIsLoading(false);
    route.push("/");
    dispatch(setLoginStatus({ status: "login" }));
    dispatch(setDialog({ type: "OPEN", dialogKey: "select-our-center" }));
  };

  return (
    <DialogBody>
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
          label="Email / Indos Number *"
          name="email"
          required
          type="text"
          placeholder="somnathgupta112@gmail.com"
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
            New Student <span className="text-blue-600">Register Here</span>
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
