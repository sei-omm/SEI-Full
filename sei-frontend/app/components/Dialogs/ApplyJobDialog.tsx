"use client";

import React, { useState } from "react";
import { SlCloudUpload } from "react-icons/sl";
import Button from "../Button";
import Input from "../Input";
import DialogBody from "./DialogBody";

export default function ApplyJobDialog() {
  const [file, setFile] = useState<File | undefined>(undefined);

  // const { uploadingState, uploadToVercel } = useUploadVercel();

  const onResumePicked = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    setFile(file);
    if (!confirm("Are you sure you want to upload your cv ?")) return;
    if (!file) return alert("Pick Your Cv First");

    // uploadToVercel({
    //   fileName: file.name,
    //   file,
    //   endPoint: "/job/upload-cv",
    // });
  };

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    alert("We Will Connect Very Soon.." )
  }

  return (
    <DialogBody className="relative overflow-hidden">
      {/* <div
        className={`absolute inset-0 z-20 bg-[#000000a4] ${
          uploadingState.state === "null" || uploadingState.state === "error"
            ? "hidden"
            : "flex"
        } items-center flex-col text-white`}
      >
        <SpinnerSvg size="20px" />
        <span>Uploading..</span>
      </div> */}
      <div className="space-y-1">
        <h2 className="font-bold text-gray-700 text-2xl">
          Upload Your <span className="text-[#e9b858]">Resume</span>
        </h2>
        <p className="text-gray-600 text-sm">
          And if it fullfill the requirement we will contact you.
        </p>
      </div>
      <form onSubmit={handleFormSubmit} className="space-y-2 pt-2">
        <Input
          name="full-name"
          required
          type="text"
          className="outline-none bg-[#e9b9582a] py-2 px-4 w-full"
          placeholder="Enter your full name"
        />
        <Input
          className="outline-none bg-[#e9b9582a] py-2 px-4 w-full"
          name="number"
          required
          type="text"
          maxLength={10}
          title="Please enter a 10 digit valid mobile number"
          pattern="\d{10}"
          placeholder="Enter your contact number"
        />
        <Input
          className="outline-none bg-[#e9b9582a] py-2 px-4 w-full"
          name="email"
          required
          type="email"
          placeholder="Enter your gmail id"
        />

        <label
          htmlFor="resumeUploader"
          className="border-[1px] cursor-pointer border-gray-500 bg-[#e9b9582a] border-dotted h-28 flex-center gap-3 text-gray-500 active:scale-95"
        >
          <input
            accept="application/pdf"
            className="hidden"
            type="file"
            id="resumeUploader"
            onChange={onResumePicked}
            hidden
          />
          <SlCloudUpload />
          <span className="text-sm">
            {file?.name ? file.name : "Click here to upload your resume"}
          </span>
        </label>
        <Button className="!text-foreground !bg-[#e9b858] w-full !mt-3 !border !border-gray-600 hover:!bg-background">
          Submit Resume
        </Button>
      </form>
    </DialogBody>
  );
}
