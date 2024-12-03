"use client";

import Button from "../Button";
import ChooseFileInput from "../ChooseFileInput";
import DialogBody from "./DialogBody";
import { useState } from "react";
import SpinnerSvg from "../SpinnerSvg";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API, BASE_API_UPLOAD } from "@/app/constant";
import { IResponse } from "@/app/type";
import HandleLoading from "../HandleLoading";
import { axiosQuery } from "@/app/utils/axiosQuery";
import { getAuthToken } from "@/app/utils/getAuthToken";
import { toast } from "react-toastify";
import { upload } from "@vercel/blob/client";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { setDialog } from "@/app/redux/slice/dialog.slice";

type TRequiredDocuments = {
  course_name: string;
  require_documents: string;
};

type TStudentsUploadedDocuments = {
  student_id: number;
  doc_id: string;
  doc_uri: string;
  doc_name: string;
};

type TReqResponse = {
  courseDocumentsInfo: TRequiredDocuments[];
  studentsUploadedDocuments: TStudentsUploadedDocuments[];
};

type TRequredDocumentsList = {
  courseName: string;
  documentsNeeded: {
    name: string;
    fileName: string;
    label: string;
    fileViewLink?: string | null;
  }[];
};

export default function UploadDocumentsDialog() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dispatch = useDispatch();

  const [requireDocuments, setRequireDocuments] = useState<
    TRequredDocumentsList[]
  >([]);

  const { extraValue } = useSelector((state: RootState) => state.dialog);

  const { isFetching } = useQuery<IResponse<TReqResponse>>({
    queryKey: "get-require-documents",
    queryFn: async () =>
      (
        await axios.get(
          BASE_API +
            `/course/required-documents?course_ids=${extraValue.courseIds}`,
          {
            headers: {
              ...getAuthToken(),
            },
          }
        )
      ).data,
    onSuccess(data) {
      const newArray: TRequredDocumentsList[] = [];
      data.data.courseDocumentsInfo.forEach((item) => {
        newArray.push({
          courseName: item.course_name,
          documentsNeeded: item.require_documents.split(",").map((rditem) => {
            const oneStudentUploadedDocInfo =
              data.data.studentsUploadedDocuments.find(
                (fItem) => fItem.doc_id === rditem
              );

            return {
              name: rditem,
              label: `Upload ${rditem} *`,
              fileName: oneStudentUploadedDocInfo
                ? oneStudentUploadedDocInfo.doc_name
                : "Pick And Upload Document",
              fileViewLink: oneStudentUploadedDocInfo
                ? oneStudentUploadedDocInfo.doc_uri
                : null,
            };
          }),
        });
      });

      setRequireDocuments(newArray);
    },
    refetchOnMount: true,
  });

  const [loadingState, setLoadingState] = useState<{
    state: "null" | "compressing" | "uploading" | "uploaded" | "error";
    progress: number;
    errMsg?: string;
  }>({ state: "null", progress: -1 });

  async function uploadFileToVercel(
    blobData: Blob,
    fileName: string,
    fileId: string
  ) {
    const blob = await upload(fileName, blobData, {
      access: "public",
      onUploadProgress: ({ percentage }) => {
        setLoadingState({
          state: "uploading",
          progress: percentage,
        });
      },
      handleUploadUrl: BASE_API_UPLOAD + "/student/upload", // Endpoint on your server
      clientPayload: JSON.stringify({ size: blobData.size }),
    });

    const { error } = await axiosQuery<IResponse, IResponse>({
      url: BASE_API + "/student/save-doc",
      method: "put",
      headers: {
        "Content-Type": "application/json",
        ...getAuthToken(),
      },
      data: {
        doc_id: fileId,
        doc_uri: blob.url,
        doc_name: blob.pathname,
      },
    });

    if (error) {
      setLoadingState({
        state: "error",
        progress: -1,
        errMsg: error.message,
      });
      return toast.error(error.message);
    }

    setLoadingState({
      state: "uploaded",
      progress: -1,
    });
    toast.success("File Successfully Uploaded");
  }

  const handleFilePicked = async (file: File, fileId: string) => {
    //any image to webp
    const worker = new Worker(
      new URL("../../../public/imageWorker.ts", import.meta.url),
      {
        type: "module",
      }
    );

    setLoadingState({
      state: "compressing",
      progress: 0,
    });

    worker.onmessage = (e: MessageEvent<Blob | { error: string }>) => {
      if ("error" in e.data) {
        setLoadingState({
          state: "error",
          progress: -1,
          errMsg: e.data.error.toString(),
        });
        worker.terminate();
        return;
      }
      // const webpBlob = e.data as Blob;
      uploadFileToVercel(e.data, file.name, fileId);
      // const webpUrl = URL.createObjectURL(webpBlob);
      // console.log(webpUrl)
      // setWebpImageUrl(webpUrl);
      worker.terminate();
    };

    worker.onerror = (err) => {
      setLoadingState({
        state: "error",
        progress: 0,
        errMsg: err.message,
      });
      worker.terminate();
    };

    // Send the image file to the worker
    worker.postMessage(file);
  };

  return (
    <DialogBody
      preventToClose={extraValue?.preventToClose}
      className="w-[45rem] min-h-[50vh] max-h-[90vh] sm:rounded-none overflow-y-auto relative"
    >
      <div
        className={`absolute size-full inset-0 bg-[#000000bd] z-20 gap-2 text-white ${
          loadingState.progress == -1
            ? "hidden"
            : "flex items-center justify-center flex-col"
        }`}
      >
        <SpinnerSvg size="20px" />
        {loadingState.state === "compressing" ? (
          <span>Compressing..</span>
        ) : (
          <span>
            Uploading.. <span>{loadingState.progress}%</span>
          </span>
        )}

        <div
          className={`h-1 w-72 bg-white ${
            loadingState.progress == 0 ? "hidden" : "block"
          }`}
        >
          <div
            style={{ width: `${loadingState.progress}%` }}
            className={`h-full bg-[#E9B858] transition-all duration-700`}
          ></div>
        </div>
      </div>
      <HandleLoading isLoading={isFetching}>
        <div className="pb-4">
          <h2 className="font-semibold text-2xl">
            {requireDocuments.length != 0
              ? requireDocuments[currentIndex].courseName
              : "Loading.."}
          </h2>
          <h3 className="text-gray-400 text-sm">
            Upload Your Required Documents Of This Course
          </h3>
        </div>

        <form className="size-full space-y-5">
          <div className="flex items-start flex-wrap gap-5 size-full">
            {requireDocuments.length != 0
              ? requireDocuments[currentIndex].documentsNeeded.map((item) => (
                  <div key={item.name} className="flex-grow basis-52">
                    <ChooseFileInput
                      onFilePicked={(file) => handleFilePicked(file, item.name)}
                      id={item.name}
                      label={item.label}
                      fileName={item.fileName}
                      name={item.name}
                      accept="image/*"
                      viewOnly={
                        typeof item.fileViewLink === "string" ? true : false
                      }
                      viewLink={item.fileViewLink}
                    />
                  </div>
                ))
              : "Loading.."}
          </div>

          <div className="w-full flex items-center justify-between">
            <Button
              onClick={() =>
                dispatch(
                  setDialog({
                    type: "CLOSE",
                    dialogKey: "upload-documents-dialog",
                    extraValue: { preventToClose: false }
                  })
                )
              }
              type="button"
              varient="new-default"
              className="bg-white active:scale-90"
            >
              Skip For Now
            </Button>
            <Button
              type="button"
              onClick={() =>
                setCurrentIndex((preIndex) => {
                  if (preIndex === requireDocuments.length - 1) {
                    dispatch(
                      setDialog({
                        type: "CLOSE",
                        dialogKey: "",
                        extraValue: { preventToClose: false },
                      })
                    );
                    return preIndex;
                  }
                  return preIndex + 1;
                })
              }
              varient="new-default"
              className="w-60 sm:w-full active:scale-95"
            >
              {currentIndex === requireDocuments.length - 1 ? "Done" : "Next"}
            </Button>
          </div>
        </form>
      </HandleLoading>
    </DialogBody>
  );
}
