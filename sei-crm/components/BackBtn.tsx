"use client";

import React from "react";
import Button from "./Button";
import { IoMdArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";

export default function BackBtn() {
  const route = useRouter();
  return (
    <Button
      type="button"
      onClick={() => {
        route.back();
      }}
      className="flex items-center gap-2"
    >
      <IoMdArrowBack />
      Back
    </Button>
  );
}
