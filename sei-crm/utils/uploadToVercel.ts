// import { BASE_API } from "@/app/constant";
// import { axiosQuery } from "./axiosQuery";
// import { IError, ISuccess } from "@/types";
// import { upload  } from "@vercel/blob/client";
// import { UploadProgressEvent } from "@vercel/blob";
// import { getAuthToken } from "@/app/utils/getAuthToken";

// type TUploadToVercelArgs = {
//   file: File;
//   fileName: string;
//   clientPayload?: string;
//   onUploadProgress? : (progressEvent : UploadProgressEvent) => void
// };

// export async function uploadToVercel(args: TUploadToVercelArgs) {
//   const blob = await upload(args.fileName, args.file, {
//     access: "public",
//     onUploadProgress: (progressEvent) => {
//       args.onUploadProgress?.(progressEvent)
//     },
//     handleUploadUrl: "http://localhost:8081/api/v1/student/upload", // Endpoint on your server
//     clientPayload: args.clientPayload,
//   });

//   const { error } = await axiosQuery<ISuccess, IError>({
//     url: BASE_API + "/student/save-doc",
//     method: "put",
//     headers: {
//       "Content-Type": "application/json",
//       ...getAuthToken(),
//     },
//     data: {
//       doc_id: fileId,
//       doc_uri: blob.url,
//       doc_name: blob.pathname,
//     },
//   });

//   if (error) {
//     setLoadingState({
//       state: "error",
//       progress: -1,
//       errMsg: error.message,
//     });
//     return toast.error(error.message);
//   }

//   setLoadingState({
//     state: "uploaded",
//     progress: -1,
//   });
//   toast.success("File Successfully Uploaded");
// }
