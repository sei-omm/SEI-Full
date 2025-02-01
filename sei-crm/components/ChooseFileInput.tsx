"use client";

import { TSetUploadStatus, TUploadMethod } from "@/types";
import { uploadToVercel } from "@/utils/uploadToVercel";
import { PutBlobResult } from "@vercel/blob";
import { ChangeEvent, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { IoCloudUploadOutline, IoEyeOutline } from "react-icons/io5";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { toast } from "react-toastify";

interface IProps extends Omit<TUploadMethod, "onUploaded"> {
  viewOnly?: boolean;
  accept?: string;
  name?: string;
  fileName?: string;
  label: string;
  id: string;
  disableUpload?: boolean;
  viewLink?: string | null;
  onFilePicked?: (file: File) => void;
  uploadFolderName?: string;
  // onUploadedCompleted?: (
  //   blob: PutBlobResult,
  //   setUploadStatus: TSetUploadStatus
  // ) => void;
  onFileDelete?: (id: string) => void;
  onUploaded?: (blob: PutBlobResult, setUploadStatus: TSetUploadStatus) => void;
}

export default function ChooseFileInput({
  viewOnly,
  id,
  accept,
  fileName,
  disableUpload,
  name,
  label,
  viewLink,
  onFilePicked,
  uploadFolderName,
  // onUploadedCompleted,
  onProcessing,
  onUploaded,
  onError,
  onFileDelete,
}: IProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadFileUrl, setUploadedFileUrl] = useState<string>("");

  const [viewLinkState, setViewLink] = useState(viewLink);
  const [fileNameState, setFileName] = useState(fileName);

  const handleViewFile = () => {
    if (file) {
      const url = URL.createObjectURL(file);
      window.open(url);
    }

    window.open(viewLinkState || "");
  };

  const [uploadStatus, setUploadStatus] = useState<{
    status: "done" | "processing" | "uploading";
    progress: number;
  }>({ status: "done", progress: 0 });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0];

    if (!file) return;

    if (!disableUpload) {
      if (!confirm("Are you sure you want to upload this file")) return;
    }

    setFile(file);
    onFilePicked?.(file);

    if (disableUpload) {
      return;
    }

    uploadToVercel({
      fileName: [`${uploadFolderName ?? "crm-docs"}/${file.name}`],
      file: [file],
      endPoint: "/upload/crm-documents",
      convartToWebp: accept?.includes("image") ? true : false,
      onProcessing: () => {
        setUploadStatus({ progress: 0, status: "processing" });
        onProcessing?.();
      },
      onUploadProgress(percentage) {
        setUploadStatus({ progress: percentage, status: "uploading" });
      },
      onUploaded(blob) {
        // if (!onUploadedCompleted) {
        //   return setUploadStatus({ progress: 0, status: "done" });
        // }
        // onUploadedCompleted(blob, setUploadStatus);
        setUploadStatus({ progress: 0, status: "done" });
        onUploaded?.(blob[0], setUploadStatus);
        setUploadedFileUrl(blob[0].url);
      },
      onError(error) {
        toast.error(error.message);
        onError?.(error);
      },
    });
  };

  return (
    <div className={`space-y-2`}>
      <input
        key={id}
        disabled={viewOnly ?? viewOnly}
        accept={accept}
        onChange={handleInputChange}
        hidden
        id={id}
        type="file"
      />
      <input type="text" name={name} className="hidden" value={uploadFileUrl} />
      <span className="block font-semibold text-sm pl-1">{label}</span>
      <label
        htmlFor={uploadStatus.status === "done" ? id : ""}
        className="flex cursor-pointer relative overflow-hidden items-center justify-between border-2 border-gray-200 text-gray-500 rounded-lg w-full text-sm px-4 py-3"
      >
        {uploadStatus.status === "done" ? (
          <>
            <h2 className="w-full line-clamp-1 break-all whitespace-normal">
              {file ? file.name : fileNameState}
            </h2>
            <div className="flex items-center gap-3 *:cursor-pointer">
              {!file && !viewLinkState ? null : (
                <IoEyeOutline onClick={handleViewFile} size={18} />
              )}

              {!file && !viewLinkState ? (
                <label className={viewOnly ? "hidden" : "inline"} htmlFor={id}>
                  <IoCloudUploadOutline size={18} />
                </label>
              ) : (
                <>
                  <label
                    className={viewOnly ? "hidden" : "inline"}
                    htmlFor={id}
                  >
                    <CiEdit size={18} />
                  </label>
                  <MdOutlineDeleteOutline
                    className={viewOnly ? "hidden" : "inline"}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (!confirm("Are you sure you want to delete ?")) return;

                      onFileDelete?.(id);
                      setFile(null);
                      setViewLink(null);
                      setFileName("Choose File");
                    }}
                    size={18}
                  />
                </>
              )}
            </div>
          </>
        ) : (
          <div className="w-full flex items-center gap-5">
            <h2 className="break-all whitespace-normal min-w-max">
              Uploading...
            </h2>

            <div className="flex items-center gap-3 w-full">
              <div className="w-[80%] bg-slate-300 h-1">
                <div
                  style={{ width: `${uploadStatus.progress}%` }}
                  className="h-full bg-black transition-all duration-700"
                ></div>
              </div>
              <span>{uploadStatus.progress}%</span>
            </div>
          </div>
        )}
      </label>
    </div>
  );
}
