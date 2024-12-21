"use client";

import { BASE_API } from "@/app/constant";
import ManageAdmissionFilter from "@/components/Admission/ManageAdmissionFilter";
import Button from "@/components/Button";
import DownloadFormUrl from "@/components/DownloadFormUrl";
import HandleSuspence from "@/components/HandleSuspence";
import { IError, ISuccess } from "@/types";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { LuFileSpreadsheet } from "react-icons/lu";
import { useQuery } from "react-query";

type TDGSReport = {
  name: string;
  indos_number: string;
  mobile_number: string;
  email: string;
};

export default function DGSINDOSReport() {
  const [tableDatas, setTableDatas] = useState<{
    heads: string[];
    body: (string | null)[][];
  }>({
    heads: [],
    body: [],
  });

  const searchParams = useSearchParams();

  const {
    data: report,
    error,
    isFetching,
    // refetch,
  } = useQuery<ISuccess<TDGSReport[]>, AxiosError<IError>>(
    ["get-dgs-indos-reports", searchParams.toString()],
    async () =>
      (
        await axios.get(
          `${BASE_API}/report/dgs${
            searchParams.size != 0 ? `?${searchParams.toString()}` : ""
          }`
        )
      ).data,
    {
      onSuccess: (data) => {
        const oldStates = { ...tableDatas };
        if (data.data.length === 0) return;
        oldStates.heads = Object.keys(data.data[0]);
        let indosNumbers = "";
        oldStates.body = data.data.map((item, index) => {
          indosNumbers += (index === 0 ? "" : ",") + item.indos_number;
          const newObj = { ...item };
          delete (newObj as { profile_image?: string | null }).profile_image;
          return Object.values(newObj);
        });
        // manageLineChat();
        alert(indosNumbers);
        setTableDatas(oldStates);
      },
      enabled: searchParams.size != 0,
      cacheTime: 0,
    }
  );

  return (
    <div className="space-y-10">
      <ManageAdmissionFilter />
      <div className="flex items-center justify-end">
        <DownloadFormUrl
          className={tableDatas.body.length !== 0 ? "block" : "hidden"}
          urlToDownload={
            BASE_API + `/report/dgs/excel?${searchParams.toString()}`
          }
        >
          <Button type="button" className="!bg-[#34A853] flex-center gap-4">
            <LuFileSpreadsheet size={20} />
            Generate Excel Sheet
          </Button>
        </DownloadFormUrl>
      </div>
      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={report?.data.length}
      >
        <div className="w-full overflow-hidden card-shdow">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
            <table className="min-w-max w-full table-auto">
              <thead className="uppercase w-full border-b border-gray-100">
                <tr>
                  {tableDatas.heads.map((item) => (
                    <th
                      className="text-left text-[14px] font-semibold pb-2 px-5 py-4"
                      key={item}
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableDatas.body.map((itemArray, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-100 group/bodyitem"
                  >
                    {itemArray.map((value) => (
                      <td
                        className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                        key={value}
                      >
                        {value?.includes("@") ? (
                          <Link
                            className="text-[#346FD8] font-medium"
                            href={`mailto:${value}`}
                          >
                            {value}
                          </Link>
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </HandleSuspence>
    </div>
  );
}
