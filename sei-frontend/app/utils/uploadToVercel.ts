import { PutBlobResult, BlobError } from "@vercel/blob";
import { convartImgToWebp } from "./convartImgToWebp";
import { upload } from "@vercel/blob/client";
import { BASE_API } from "../constant";

type TUploadArgs = {
  fileName: string;
  file: File;
  endPoint: string;
  clientPayload?: string;
  convartToWebp?: boolean;
  onUploaded?: (blob: PutBlobResult) => void;
  onError?: (error: BlobError) => void;
  onProcessing?: () => void;
  onUploadProgress?: (percentage: number) => void;
  onFinally? : (data : PutBlobResult | Error) => void;
};

export const uploadToVercel = async ({
  fileName,
  file,
  endPoint,
  clientPayload,
  onUploaded,
  onUploadProgress,
  onError,
  onProcessing,
  onFinally,
  convartToWebp,
}: TUploadArgs) => {
  try {
    let blobData: Blob | File;
    onProcessing?.();
    if (convartToWebp === true) {
      blobData = await convartImgToWebp(file);
    } else {
      blobData = file;
    }
    const blob = await upload(fileName, blobData, {
      access: "public",
      onUploadProgress: (progressInfo) => {
        onUploadProgress?.(progressInfo.percentage);
      },
      handleUploadUrl: BASE_API + endPoint, // Endpoint on your server
      clientPayload,
    });
    onUploaded?.(blob);
    onFinally?.(blob);
  } catch (error) {
    const err = error as Error;
    onError?.(err);
    onFinally?.(err);
  }
};
