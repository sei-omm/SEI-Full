import React from "react";
import Button from "../Button";
import DialogBody from "./DialogBody";

export default function LoginWithGoogleDialog() {
  return (
    <DialogBody>
      <div className="pt-1"></div>
      <Button className="w-full">Login With Google</Button>
    </DialogBody>
  );
}
