"use client";
import React from "react";
import Button from "../Button";
import Input from "../Input";
import Link from "next/link";
import DialogBody from "./DialogBody";

export default function GmailsmtpSetupDialog() {
  return (
    <DialogBody>
      <Input
        required
        label="Host Name"
        placeholder="smtp.gmail.com"
        defaultValue="smtp.gmail.com"
      />
      <Input required label="Port" placeholder="587" defaultValue="587" />
      <Input required label="Gmail Id *" placeholder="yourgmail@gmail.com" />
      <Input required label="Gmail App Password *" placeholder="123456" />
      <Link
        className="text-xs underline text-yellow-700 block text-end"
        href={
          "https://support.cloudways.com/en/articles/5131076-how-to-configure-gmail-smtp"
        }
      >
        How to get app password?
      </Link>
      <Button className="w-full">Save SMTP Setup</Button>
    </DialogBody>
  );
}
