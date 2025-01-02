import React, { FormEvent, useState } from "react";
import Button from "../Button";
import OpenDialogButton from "../OpenDialogButton";
import Input from "../Input";
import DialogBody from "./DialogBody";
import { doQuery } from "doquery";
import { IResponse } from "@/app/type";
import { BASE_API } from "@/app/constant";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setDialog } from "@/app/redux/slice/dialog.slice";

export default function SRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setIsLoading(true);

    const reqBody = {
      name: formData.get("name"),
      email: formData.get("email"),
      mobile_number: formData.get("mobile_number"),
      dob: formData.get("dob"),
      password: formData.get("password"),
      indos_number: formData.get("indos_number"),
    };

    const { error, response } = await doQuery<
      IResponse<string>,
      IResponse<null>
    >({
      url: BASE_API + "/student/register",
      method: "POST",
      body: reqBody,
    });

    setIsLoading(false);

    if (error != null) return toast.error(error.message);

    toast.success(response?.message);
    localStorage.setItem("student-info", JSON.stringify(reqBody));
    dispatch(setDialog({ type: "OPEN", dialogKey: "otp" }));
  };

  return (
    <DialogBody className="min-w-[40rem] sm:min-w-full" preventToCloseOnSideClick>
      <div className="space-y-1">
        <h2 className="font-bold text-gray-700 text-2xl">
          Student <span className="text-[#e9b858]">Registration</span>
        </h2>
        <p className="text-gray-600 text-sm">
          Enter your details for registration
        </p>
      </div>
      <form
        onSubmit={onFormSubmit}
        className="pt-2 flex items-start flex-wrap gap-2 *:basis-52 *:flex-grow"
      >
        <Input
          label="Full Name *"
          name="name"
          required
          type="text"
          placeholder="Somnath Gupta"
        />
        <Input
          label="Email Address *"
          name="email"
          required
          type="email"
          placeholder="somnathgupta112@gmail.com"
        />
        <Input
          label="Mobile Number *"
          name="mobile_number"
          required
          type="text"
          maxLength={10}
          title="Please enter a 10 digit valid mobile number"
          pattern="\d{10}"
          placeholder="Mobile number"
        />
        <Input
          label="Indos Number"
          name="indos_number"
          type="text"
          placeholder="Indos No"
        />
        <Input label="Date Of Birth *" name="dob" required type="date" />
        <Input
          label="Password *"
          name="password"
          required
          type="text"
          placeholder="Password"
        />
        <Button
          disabled={isLoading}
          isLoading={isLoading}
          className="!text-foreground !py-2 !bg-[#e9b858] !mt-3 w-full !border !shadow-none !border-gray-600 hover:!bg-background"
        >
          Verify And Register
        </Button>
      </form>
      <OpenDialogButton
        className="w-full"
        type="OPEN"
        dialogKey="student-login-dialog"
      >
        <span className="block text-center mt-2">
          Registered Student
          <span className="text-blue-600"> Login Here</span>
        </span>
      </OpenDialogButton>
    </DialogBody>
  );
}
