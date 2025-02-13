import { RootState } from "@/redux/store";
import React from "react";
import { useSelector } from "react-redux";
import DialogBody from "../DialogBody";

export default function ViewRequirementDetailsDialog() {
  const { extraValue } = useSelector((state: RootState) => state.dialogs);
  return (
    <DialogBody className="max-h-[90%] overflow-y-auto min-w-[40rem]">
      <p className="pt-4">{extraValue?.text}</p>
    </DialogBody>
  );
}
