"use client";

import React from "react";
import Input from "../Input";
import Button from "../Button";

import DialogBody from "./DialogBody";

export default function MailGunApiSetupDialog() {
  return (
    <DialogBody>
      <Input
        label="Add Your Mail Gun Api Key"
        placeholder="A64aAtFYEALw_wcB&gclsrc"
      />
      <Button className="w-full">Save Api Key</Button>
    </DialogBody>
  );
}
