import { upload } from "@vercel/blob/client";
import { BASE_API } from "@/app/constant";
import { convartImgToWebp } from "./convartImgToWebp";
import { TUploadMethod } from "@/types";
import { PutBlobResult } from "@vercel/blob";

interface TUploadArgs extends TUploadMethod {
  fileName: string[];
  file: File[];
  endPoint: string;
  clientPayload?: string;
  convartToWebp?: boolean;
}

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
    let fileToUpload: Blob[] | File[];

    onProcessing?.();
    if (convartToWebp === true) {
      // if (fileName.length > 0 || file.length > 0)
      //   throw new Error("No able to convart multiple image to webp");
      fileToUpload = [await convartImgToWebp(file[0])];
    } else {
      fileToUpload = file;
    }

    const blobs: PutBlobResult[] = [];
    for (let i = 0; i < fileToUpload.length; i++) {
      const blob = await upload(fileName[i], fileToUpload[i], {
        access: "public",
        contentType : fileToUpload[i].type,
        onUploadProgress: (progressInfo) => {
          onUploadProgress?.(progressInfo.percentage);
        },
        handleUploadUrl: BASE_API + endPoint, // Endpoint on your server
        clientPayload,
      });
      blobs.push(blob);
    }
    onUploaded?.(blobs);
    onFinally?.(blobs);
  } catch (error) {
    const err = error as Error;
    onError?.(err);
    onFinally?.(err);
  }
};
