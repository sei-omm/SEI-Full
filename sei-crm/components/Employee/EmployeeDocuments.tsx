"use client";

import React, { useState } from "react";
import ChooseFileInput from "../ChooseFileInput";
import { PutBlobResult } from "@vercel/blob";
import {
  ISuccess,
  TEmployeeDocs,
  TEmployeeDocsFromDB,
  TSetUploadStatus,
} from "@/types";
import { useQuery } from "react-query";
import axios from "axios";
import {
  BASE_API,
  FACULTY_DOC_INFO,
  OFFICE_STAFF_DOC_INFO,
} from "@/app/constant";
import HandleSuspence from "../HandleSuspence";
import { getAuthToken } from "@/app/utils/getAuthToken";

interface IProps {
  employeeId: number;
  employeeDocsInfoState: React.MutableRefObject<TEmployeeDocs[]>;
  employeeType: "Faculty" | "Office Staff" | undefined;
}

export default function EmployeeDocuments({
  employeeDocsInfoState,
  employeeId,
  employeeType,
}: IProps) {
  const [employeeDocsInfo, setEmployeeDocsInfo] = useState<TEmployeeDocs[]>(employeeType === "Faculty" ? FACULTY_DOC_INFO : OFFICE_STAFF_DOC_INFO);

  const { isFetching, error } = useQuery<ISuccess<TEmployeeDocsFromDB[]>>({
    queryKey: "employee_documents",
    queryFn: async () =>
      (
        await axios.get(`${BASE_API}/employee/${employeeId}/document`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthToken(),
          },
        })
      ).data,
    onSuccess: (data) => {
      const docsInfo = employeeType === "Faculty" ? FACULTY_DOC_INFO : OFFICE_STAFF_DOC_INFO;
      const newEmployeeInfo = [...docsInfo];
      data.data.forEach((item) => {
        const indexToChange = docsInfo.findIndex(
          (findIndexItem) => findIndexItem.doc_id === item.doc_id
        );
        newEmployeeInfo[indexToChange] = {
          doc_id: item.doc_id,
          doc_name: item.doc_name,
          doc_uri: item.doc_uri,
        };
      });
      setEmployeeDocsInfo(newEmployeeInfo);
    },

    refetchOnMount: true,
    enabled: employeeId !== -1 && employeeType !== undefined,
  });

  async function onUploadedCompleted(
    blob: PutBlobResult,
    setUploadStatus: TSetUploadStatus,
    docs: TEmployeeDocs
  ) {
    const allDocuemnts = [...employeeDocsInfo];
    const currentDocIndex = allDocuemnts.findIndex(
      (item) => item.doc_id === docs.doc_id
    );
    allDocuemnts[currentDocIndex] = {
      ...allDocuemnts[currentDocIndex],
      doc_uri: blob.url,
      doc_name: blob.pathname,
    };
    setEmployeeDocsInfo(allDocuemnts);
    employeeDocsInfoState.current = allDocuemnts;
    setUploadStatus({ status: "done", progress: 0 });
  }

  return (
    <HandleSuspence isLoading={isFetching} dataLength={1} error={error}>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-4">
        {employeeDocsInfo.map((docs) => (
          <li key={docs.doc_id}>
            <ChooseFileInput
              key={docs.doc_id}
              id={docs.doc_id}
              label={docs.doc_id}
              // name={docs.doc_id}
              fileName={docs.doc_name ?? `Choose ${docs.doc_id}`}
              viewLink={docs.doc_uri}
              uploadFolderName="employee-documents"
              onUploaded={(blob, setUploadStatus) => {
                onUploadedCompleted(blob, setUploadStatus, docs);
              }}
              onFileDelete={(id) => {
                const index = employeeDocsInfo.findIndex(
                  (item) => item.doc_id === id
                );
                const newInfo = [...employeeDocsInfo];
                newInfo[index] = {
                  doc_id: docs.doc_id,
                  doc_name: null,
                  doc_uri: null,
                };
                setEmployeeDocsInfo(newInfo);
                employeeDocsInfoState.current = newInfo;
              }}
            />
          </li>
        ))}
      </ul>
    </HandleSuspence>
  );
}
