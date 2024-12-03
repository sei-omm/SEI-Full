import React from "react";
import DialogBody from "./DialogBody";
import Input from "../Input";
import Button from "../Button";

const fields = [
  "Name",
  "Email",
  "Phone",
  "Description",
  "Source",
  "Status",
  "Assigned",
];

export default function AddContactsDialog() {
  return (
    <DialogBody className="w-[60%]">
      <ul className="flex-center flex-wrap gap-4 w-full">
        {fields.map((fild) => (
          <li key={fild} className="basis-56 flex-grow">
            <Input type="text" placeholder={fild} label={fild} />
          </li>
        ))}
      </ul>
      <Button className="w-full !mt-4 inline-block">Add New Contact</Button>
    </DialogBody>
  );
}
