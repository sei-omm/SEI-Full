"use client";

import React, { useRef, useState } from "react";
import Button from "../Button";
import Input from "../Input";
import DialogBody from "./DialogBody";
import ChooseFileInput from "../ChooseFileInput";
import { useDoMutation } from "@/app/hooks/useDoMutation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { uploadToVercel } from "@/app/utils/uploadToVercel";
import { toast } from "react-toastify";
import { setDialog } from "@/app/redux/slice/dialog.slice";

export default function ApplyJobDialog() {
  const { mutate, isLoading: isMutating } = useDoMutation();

  const { extraValue } = useSelector((state: RootState) => state.dialog);

  const [file, setFile] = useState<File | null>(null);

  const isUploading = useRef(false);

  const dispatch = useDispatch();

  const [status, setStatus] = useState<{
    state: "done" | "processing" | "uploading" | "error";
    progress: number;
    errMsg?: string;
  }>({ state: "done", progress: 0 });

  async function handleFormSubmit(formData: FormData) {
    if (!file) return alert("Please Choose Your Resume First");

    uploadToVercel({
      fileName: `candidate-resume/${file.name}`,
      file: file,
      endPoint: "/upload/candidate-resume",
      convartToWebp: false,
      onProcessing: () => {
        isUploading.current = true;
        setStatus({
          progress: 0,
          state: "processing",
        });
      },
      onUploadProgress(percentage) {
        setStatus({
          progress: percentage,
          state: "uploading",
        });
      },
      onError(error) {
        isUploading.current = false;
        toast.error(error.message);
        setStatus({
          progress: 0,
          state: "error",
          errMsg: error.message,
        });
      },
      onUploaded(blob) {
        isUploading.current = false;
        formData.set("job_id", extraValue?.job_id.toString());
        formData.set("resume", blob.url);
        setStatus({
          progress: 0,
          state: "done",
        });
        mutate({
          apiPath: "/hr/job/apply",
          method: "post",
          formData,
          onSuccess: () => {
            dispatch(setDialog({ type: "CLOSE", dialogKey: "" }));
            alert("We Will Contact You Soon..");
          },
        });
      },
    });
  }

  return (
    <DialogBody className="relative overflow-hidden min-w-[50rem]">
      <div className="space-y-1">
        <h2 className="font-bold text-gray-700 text-2xl">
          Upload Your <span className="text-[#e9b858]">Resume</span>
        </h2>
        <p className="text-gray-600 text-sm">
          And if it fullfill the requirement we will contact you.
        </p>
      </div>
      <form action={handleFormSubmit} className="space-y-2 pt-2">
        <div className="flex flex-wrap items-start gap-5 *:flex-grow *:basis-60">
          <Input
            required
            label="Full Name *"
            name="name"
            type="text"
            className="outline-none bg-[#e9b9582a] py-2 px-4 w-full"
            placeholder="Somnath Gupta"
          />
          <Input
            required
            label="Email *"
            className="outline-none bg-[#e9b9582a] py-2 px-4 w-full"
            name="email"
            type="email"
            placeholder="youremail@gmail.com"
          />
          <Input
            required
            label="Contact Number *"
            className="outline-none bg-[#e9b9582a] py-2 px-4 w-full"
            name="contact_number"
            type="text"
            maxLength={10}
            title="Please enter a 10 digit valid mobile number"
            pattern="\d{10}"
            placeholder="8487845784"
          />

          <Input required label="Date Of Birth *" name="dob" type="date" />

          <Input
            required
            label="Work Exprience *"
            name="work_experience"
            type="text"
            placeholder="2 years"
          />

          <ChooseFileInput
            onFilePicked={(file) => setFile(file)}
            id="resumeUploader"
            name="resume"
            label="Upload Resume *"
            accept="application/pdf"
            fileName="Click here to upload your resume"
          />
        </div>

        <div
          className={`flex items-center gap-3 ${
            status.state === "done" ? "hidden" : ""
          }`}
        >
          <div className="w-full h-3 bg-gray-200 rounded-full">
            <div
              className="h-full bg-[#e9b858] rounded-full"
              style={{ width: `${status.progress}%` }}
            ></div>
          </div>
          <span className="text-sm">{status.progress}%</span>
        </div>

        <Button
          isLoading={isMutating || isUploading.current}
          disabled={isMutating || isUploading.current}
          className="!text-foreground !bg-[#e9b858] !mt-3 !border !border-gray-600 hover:!bg-background"
        >
          Submit Application
        </Button>
      </form>
    </DialogBody>
  );
}
