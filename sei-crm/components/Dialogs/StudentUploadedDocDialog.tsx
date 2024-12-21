"use client";

import { useQuery } from "react-query";
import ChooseFileInput from "../ChooseFileInput";
import DialogBody from "./DialogBody";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { ISuccess, TStudentsUploadedDocuments } from "@/types";
import HandleSuspence from "../HandleSuspence";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function StudentUploadedDocDialog() {
  const { extraValue } = useSelector((state: RootState) => state.dialogs);

  const { data, isFetching, error } = useQuery<ISuccess<TStudentsUploadedDocuments[]>>(
    {
      queryKey: "get-students-uploaded-docs-list",
      queryFn: async () =>
        (
          await axios.get(
            `${BASE_API}/admission/student-documents/${extraValue.studentId}`
          )
        ).data,
      refetchOnMount: true,
    }
  );

  return (
    <DialogBody className="max-h-[90vh] overflow-y-auto">
      <HandleSuspence isLoading={isFetching} dataLength={data?.data.length} error={error}>
        {data?.data.map((item) => (
          <div key={item.doc_id} className="w-full">
            <ChooseFileInput
              viewOnly={true}
              id={item.doc_id}
              label={item.doc_id}
              fileName={item.doc_name}
              name={item.doc_id}
              viewLink={item.doc_uri}
            />
          </div>
        ))}
      </HandleSuspence>
    </DialogBody>
  );
}
