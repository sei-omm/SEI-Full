"use client";

import Button from "../Button";
import ChooseFileInput from "../ChooseFileInput";
import DialogBody from "./DialogBody";
import { useState } from "react";
// import SpinnerSvg from "../SpinnerSvg";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
// import { IResponse } from "@/app/type";
// import HandleLoading from "../HandleLoading";
import { getAuthToken } from "@/app/utils/getAuthToken";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "@/app/redux/store";
import { IError, ISuccess, TStudentsUploadedDocuments } from "@/types";
import { RootState } from "@/redux/store";
import { axiosQuery } from "@/utils/axiosQuery";
import HandleSuspence from "../HandleSuspence";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { PutBlobResult } from "@vercel/blob";

type TRequiredDocuments = {
  course_name: string;
  require_documents: string;
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

  const { extraValue } = useSelector((state: RootState) => state.dialogs);

  const { isFetching, error } = useQuery<ISuccess<TReqResponse>>({
    queryKey: "get-require-documents",
    queryFn: async () =>
      (
        await axios.get(
          BASE_API +
            `/course/required-documents?course_ids=${extraValue.courseIds}&student_id=${extraValue.studentId}`,
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

  async function saveToDb(blob: PutBlobResult, fileId: string) {
    const { error } = await axiosQuery<ISuccess, IError>({
      url: BASE_API + "/student/save-doc?student_id=" + extraValue.studentId,
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
      return toast.error(error.message);
    }
    toast.success("File Successfully Uploaded");
  }

  return (
    <DialogBody className="w-[45rem] min-h-[50vh] max-h-[90vh] sm:rounded-none overflow-y-auto relative">
      <HandleSuspence isLoading={isFetching} dataLength={1} error={error}>
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
                      key={item.name}
                      id={item.name}
                      label={item.label}
                      fileName={item.fileName}
                      name={item.name}
                      accept="image/*"
                      viewLink={item.fileViewLink}
                      uploadFolderName="students-document"
                      onUploaded={async (blob, setUploadStatus) => {
                        await saveToDb(blob, item.name);
                        setUploadStatus({ status: "done", progress: 0 });
                      }}
                    />
                  </div>
                ))
              : "Loading.."}
          </div>

          <div className="w-full flex items-center justify-end">
            <Button
              type="button"
              onClick={() =>
                setCurrentIndex((preIndex) => {
                  if (preIndex === requireDocuments.length - 1) {
                    dispatch(setDialog({ type: "CLOSE", dialogId: "" }));
                    return preIndex;
                  }
                  return preIndex + 1;
                })
              }
              className={`max-w-36 sm:w-full`}
            >
              {currentIndex === requireDocuments.length - 1 ? "Done" : "Next"}
            </Button>
          </div>
        </form>
      </HandleSuspence>
    </DialogBody>
  );
}
