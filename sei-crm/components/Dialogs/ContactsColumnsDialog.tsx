"use client";

import React from "react";
import CheckBox from "../CheckBox";
import Input from "../Input";
import Button from "../Button";
import { CiEdit } from "react-icons/ci";
import { MdOutlineDeleteOutline } from "react-icons/md";
import DialogBody from "./DialogBody";

const columns = [
  "Date",
  "Name",
  "Email",
  "Phone",
  "Description",
  "Source",
  "Status",
  "Assigned",
];

export default function ContactsColumnsDialog() {

  return (
    <DialogBody>
      <h2 className="font-semibold mt-3">Default Columns</h2>

      <ul className="w-full flex flex-wrap gap-4 mt-3">
        {columns.map((column) => (
          <li
            key={column}
            className="flex items-center gap-x-2 text-sm cursor-pointer group/columnitems"
          >
            <CheckBox defaultChecked={true} />
            <span className="font-semibold uppercase text-sm">{column}</span>
            <CiEdit />
            <MdOutlineDeleteOutline />
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <h2 className="font-semibold">Add Custom Columns</h2>
        <form action="">
          <Input type="text" placeholder="Column Name" />
          <Input type="text" placeholder="Column ID" />

          <Button className="w-full mt-4">Add Column</Button>

          <Button className="w-full mt-2 !text-black bg-transparent border border-black">
            Save Changes
          </Button>
        </form>
      </div>
    </DialogBody>
  );
}
