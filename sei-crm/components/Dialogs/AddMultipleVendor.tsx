import React from "react";
import DialogBody from "./DialogBody";
import MultiVendorForm from "../SingleLineForms/MultiVendorForm";
import Button from "../Button";

export default function AddMultipleVendor() {
  return (
    <DialogBody className="min-w-[80vw]">
      <MultiVendorForm />
      <Button>Save Info</Button>
    </DialogBody>
  );
}
