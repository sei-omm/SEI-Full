"use client";

import Button from "../Button";
import UploadDocumentsItems from "../UploadDocumentsItems";
import DialogBody from "./DialogBody";
import { OptionsType } from "@/app/type";

export default function UploadDocumentsDialog() {
  const filesTypes: OptionsType[] = [
    { text: "Id Proof", value: "id-proof" },
    { text: "Address Proof", value: "address-proof" },
    { text: "Academic Proof", value: "academic-proof" },
  ];
  return (
    <DialogBody className="w-[45rem] max-h-[90vh] sm:rounded-none overflow-y-auto">
      <form className="size-full space-y-5">
        <div className="size-full space-y-6">
          {filesTypes.map((item) => (
            <UploadDocumentsItems key={item.value} filesTypes={filesTypes} />
          ))}
        </div>

        <Button varient="new-default" className="w-60 sm:w-full">
          Save Changes
        </Button>
      </form>
    </DialogBody>
  );
}
