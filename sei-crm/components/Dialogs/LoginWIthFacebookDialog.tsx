"use client";

import React from "react";
import Button from "../Button";
import DialogBody from "./DialogBody";

export default function LoginWIthFacebookDialog() {
  return (
    <DialogBody>
      <div className="pt-1"></div>
      <Button className="w-full">Login With Facebook</Button>
    </DialogBody>
  );
}
