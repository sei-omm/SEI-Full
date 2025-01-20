import { ISuccess, TEmployeeDocs, TEmployeeDocsFromDB } from "@/types";
import React, { useState } from "react";
import { InfoLayout } from "./InfoLayout";
import Info from "../Info";
import axios from "axios";
import {
  BASE_API,
  FACULTY_DOC_INFO,
  OFFICE_STAFF_DOC_INFO,
} from "@/app/constant";
import { useQuery } from "react-query";
import HandleSuspence from "../HandleSuspence";
import { getAuthToken } from "@/app/utils/getAuthToken";

interface IProps {
  employeeType?: string;
}

export default function Documentation({ employeeType }: IProps) {
  const [employeeDocsInfo, setEmployeeDocsInfo] = useState<TEmployeeDocs[]>(
    employeeType === "Faculty" ? FACULTY_DOC_INFO : OFFICE_STAFF_DOC_INFO
  );

  const { isFetching, error, data } = useQuery<ISuccess<TEmployeeDocsFromDB[]>>(
    {
      queryKey: "employee_documents",
      queryFn: async () =>
        (
          await axios.get(`${BASE_API}/employee/null/document`, {
            headers: {
              "Content-Type": "application/json",
              ...getAuthToken(),
            },
          })
        ).data,
      onSuccess: (data) => {
        const docsInfo =
          employeeType === "Faculty" ? FACULTY_DOC_INFO : OFFICE_STAFF_DOC_INFO;
        const newEmployeeInfo = [...docsInfo];
        data.data.forEach((item) => {
          const indexToChange = employeeDocsInfo.findIndex(
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
    }
  );

  return (
    <>
      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={data?.data.length}
      >
        <InfoLayout>
          <h2 className="text-2xl font-semibold pb-6">Documentation</h2>

          <div className="flex flex-wrap items-start *:basis-60 *:flex-grow gap-x-8 gap-y-4">
            {employeeDocsInfo.map((docInfo) => (
              <Info
                key={docInfo.doc_id}
                title={docInfo.doc_id || ""}
                value={docInfo.doc_name || "Not Submitted"}
                viewLink={docInfo.doc_uri || ""}
              />
            ))}
          </div>
        </InfoLayout>
      </HandleSuspence>
    </>
  );
}
