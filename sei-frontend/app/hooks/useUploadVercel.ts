import { upload } from "@vercel/blob/client";
import { useState } from "react";
import { BASE_API_UPLOAD } from "../constant";
import { PutBlobResult } from "@vercel/blob";

type TUploadArgs = {
  fileName: string;
  file: File;
  endPoint: string;
  clientPayload?: string;
  onSuccess?: (blob: PutBlobResult) => void;
};

export const useUploadVercel = () => {
  const [uploadingState, setUploadingState] = useState<{
    state: "null" | "processing" | "uploading" | "uploaded" | "error";
    progress: number;
    errMsg?: string;
  }>({ state: "null", progress: -1 });

  const uploadToVercel = async ({
    fileName,
    file,
    endPoint,
    clientPayload,
    onSuccess,
  }: TUploadArgs) => {
    try {
      const blob = await upload(fileName, file, {
        access: "public",
        onUploadProgress: ({ percentage }) => {
          setUploadingState({
            state: "uploading",
            progress: percentage,
          });
        },
        handleUploadUrl: BASE_API_UPLOAD + endPoint, // Endpoint on your server
        clientPayload,
      });
      onSuccess?.(blob);
      setUploadingState({ state: "uploaded", progress: 0 });
    } catch (error) {
      const err = error as Error;
      setUploadingState({ state: "error", progress: -1, errMsg: err.message });
    }
  };

  return { uploadToVercel, uploadingState };
};
