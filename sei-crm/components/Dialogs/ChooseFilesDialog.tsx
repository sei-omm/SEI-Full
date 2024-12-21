"use client";

import { SlCloudUpload } from "react-icons/sl";
import DialogBody from "./DialogBody";
import React, { ChangeEvent, useRef, useState } from "react";
import { MdDeleteOutline, MdRemoveRedEye } from "react-icons/md";
import Button from "../Button";
import { uploadToVercel } from "@/utils/uploadToVercel";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { PutBlobResult } from "@vercel/blob";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "react-toastify";
import { queryClient } from "@/redux/MyProvider";
import { setDialog } from "@/redux/slices/dialogs.slice";

export default function ChooseFilesDialog() {
  const { extraValue } = useSelector((state: RootState) => state.dialogs);

  const [files, setFiles] = useState<File[]>([]);

  const [progress, setProgress] = useState({
    percentage: 0,
    forItemIndex: -1,
  });
  const progressForItemIndex = useRef(-1);

  const { mutate, isLoading: isMutating } = useDoMutation();

  function onFilesPicked(event: ChangeEvent<HTMLInputElement>) {
    progressForItemIndex.current = -1;

    const pickedFiles = event.currentTarget.files;
    if (!pickedFiles) return;

    const allFiles: File[] = [...files];
    if (allFiles.length >= 5) alert("No More Can Select");

    for (let i = 0; i < pickedFiles.length; i++) {
      allFiles.push(pickedFiles.item(i) as File);
    }

    setFiles(allFiles);
  }

  const handleViewFile = (index: number) => {
    // Convert the file into a Blob
    const reader = new FileReader();
    reader.onload = () => {
      const blob = new Blob([reader.result as string], {
        type: files[index].type,
      });
      const blobURL = URL.createObjectURL(blob);

      // Open the Blob in a new window
      window.open(blobURL, "_blank");
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert("Failed to process the file.");
    };

    reader.readAsArrayBuffer(files[index]);
  };

  const handleDeleteFile = (index: number) => {
    const oldFiles = [...files];
    oldFiles.splice(index, 1);
    setFiles(oldFiles);
  };

  const saveToDb = async (blobs: PutBlobResult[]) => {
    mutate({
      apiPath: "/storage/file",
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      formData: blobs.map((blob) => {
        const reqBody: any = {
          file_name: blob.pathname.split("/").pop(),
          file_type: blob.contentType,
          file_url: blob.url,
        };
        if (extraValue?.folderId) {
          reqBody.folder_id = extraValue.folderId;
        }
        return reqBody;
      }),
      onSuccess() {
        setDialog({ type: "CLOSE", dialogId: "" });
        queryClient.refetchQueries(["fetch-files-and-folders"]);
      },
    });
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    uploadToVercel({
      file: files,
      fileName: files.map((file) => `storage/${file.name}`),
      endPoint: "/upload/compliance-record",
      onUploadProgress(percentage) {
        if (percentage === 0) {
          progressForItemIndex.current++;
        }
        setProgress({
          percentage: percentage,
          forItemIndex: progressForItemIndex.current,
        });
      },
      onUploaded(blob) {
        progressForItemIndex.current++;
        setProgress({
          percentage: 0,
          forItemIndex: progressForItemIndex.current,
        });
        saveToDb(blob);
      },
      onError(error) {
        toast.error(error.message);
      },
    });
  };

  return (
    <DialogBody>
      <form onSubmit={handleFormSubmit} className="pt-5 space-y-5">
        <div>
          <label
            htmlFor="resumeUploader"
            className="border-[1px] cursor-pointer rounded-xl border-gray-500 bg-[#e9b9582a] border-dotted h-28 flex-center gap-3 text-gray-500 active:scale-95"
          >
            <input
              max={5}
              accept="*/*"
              className="hidden"
              type="file"
              id="resumeUploader"
              onChange={onFilesPicked}
              hidden
              multiple
            />
            <SlCloudUpload />
            <span className="text-sm">Click here to upload file</span>
          </label>

          <ul>
            {files.map((file, index) => (
              <li key={index} className="pt-3 px-2">
                <div className="flex item-center justify-between">
                  <div>
                    <span className="font-semibold text-sm text-gray-500">
                      {progress.forItemIndex > index ? (
                        <span className="float-left mt-[5px] mr-1">
                          <IoCheckmarkDoneCircleSharp className="text-green-700" />
                        </span>
                      ) : null}
                      {file.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 *:cursor-pointer text-gray-500">
                    <MdRemoveRedEye onClick={() => handleViewFile(index)} />
                    <MdDeleteOutline onClick={() => handleDeleteFile(index)} />
                  </div>
                </div>
                {progress.forItemIndex === index ? (
                  <div className="w-full bg-gray-200 h-1 mt-2">
                    <div
                      style={{ width: `${progress.percentage}%` }}
                      className="h-full bg-gray-600 transition-all duration-700"
                    ></div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <Button
          disabled={files.length === 0 || isMutating}
          className={`w-full ${
            files.length === 0 ? "!bg-gray-400 !shdow-none" : ""
          }`}
        >
          Upload
        </Button>
      </form>
    </DialogBody>
  );
}
