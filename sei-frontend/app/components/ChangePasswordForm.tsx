"use client";

import React from "react";
import Input from "./Input";
import Button from "./Button";
import { BASE_API } from "../constant";
import { IResponse } from "../type";
import { toast } from "react-toastify";
import { doQuery } from "doquery";

interface IProps {
  token: string;
}

export default function ChangePasswordForm({ token }: IProps) {
  const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    if (formData.get("new_password") !== formData.get("re_type_new_password")) {
      return toast.error("Passwords Are Not Same");
    }

    const { error, response } = await doQuery<IResponse, IResponse>({
      url: BASE_API + "/student/set-password",
      method: "PATCH",
      body: {
        new_password: formData.get("new_password"),
        token,
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(response?.message);
  };

  return (
    <form
      onSubmit={onFormSubmit}
      className="main-layout py-10 flex items-end flex-wrap *:basis-96 *:flex-grow gap-5"
    >
      <Input
        required
        name="new_password"
        label="New Password"
        placeholder="Enter your new password"
      />
      <Input
        required
        name="re_type_new_password"
        label="Re-Type New Password"
        placeholder="Re-type your new password"
      />
      <Button className="!text-black !bg-[#E9B858] !border-gray-700">
        Change Password
      </Button>
    </form>
  );
}
