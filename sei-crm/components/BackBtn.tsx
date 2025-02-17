"use client";

import React from "react";
import Button from "./Button";
import { IoMdArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";

interface IProps {
  btnText?: string;
  customRoute?: string;
}

export default function BackBtn({ btnText, customRoute }: IProps) {
  const route = useRouter();
  return (
    <Button
      type="button"
      onClick={() => {
        if (customRoute) {
          route.push(customRoute);
        } else {
          route.back();
        }
      }}
      className="flex items-center gap-2"
    >
      <IoMdArrowBack />
      {btnText ?? "Back"}
    </Button>
  );
}
