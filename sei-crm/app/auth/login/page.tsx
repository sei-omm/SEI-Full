"use client";

import { useDoMutation } from "@/app/utils/useDoMutation";
import { setInfo } from "@/app/utils/saveInfo";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { ISuccess } from "@/types";
import { useRouter } from "next/navigation";
import React from "react";

export default function Login() {
  const { mutate, isLoading } = useDoMutation();

  const route = useRouter();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    mutate({
      apiPath: "/employee/login",
      method: "post",
      formData,
      headers: {
        "Content-Type": "application/json",
      },
      onSuccess: async (
        data: ISuccess<{ token: string; profile_image: string; name: string }>
      ) => {
        await setInfo("login-token", data.data.token);
        await setInfo(
          "employee-info",
          JSON.stringify({
            name: data.data.name,
            profile_image: data.data.profile_image,
          })
        );

        route.push("/dashboard");
      },
    });
  };

  return (
    <main className="h-screen w-screen flex-center flex-col">
      <form
        onSubmit={handleFormSubmit}
        className="card-shdow min-w-[35rem] p-10 *:w-full space-y-3 rounded-2xl border"
      >
        <div className="space-y-1 pb-3">
          <h2 className="text-3xl font-semibold">Login</h2>
          <p className="text-sm text-gray-500">
            {/* Use you registered email and password to login to your account */}
            Ask your Admin for login email and password
          </p>
        </div>
        <Input
          type="email"
          placeholder="somnathgupta112@gmail.com"
          label="Your email"
          name="login_email"
        />
        <Input
          name="login_password"
          type="text"
          placeholder="123$hh@p)"
          label="Your password"
        />
        <Button className="flex-center" loading={isLoading}>
          LOGIN
        </Button>
        <div className="text-center text-sm font-semibold">
          Ask Your HR For Login Credentials
        </div>
      </form>
    </main>
  );
}
