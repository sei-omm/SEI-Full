"use client";

import { BASE_API } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { stickyFirstCol } from "@/app/utils/stickyFirstCol";
import ManageAdmissionFilter from "@/components/Admission/ManageAdmissionFilter";
import Button from "@/components/Button";
import DownloadFormUrl from "@/components/DownloadFormUrl";
import HandleSuspence from "@/components/HandleSuspence";
import Pagination from "@/components/Pagination";
import { usePurifyCampus } from "@/hooks/usePurifyCampus";
import { IError, ISuccess } from "@/types";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { LuFileSpreadsheet } from "react-icons/lu";
import { useQuery } from "react-query";

type TBatch = {
  form_id: string;
  name: string;
  batch_fee: number;
  total_paid: string;
  total_due: string;
  total_misc_payment: string;
  form_status: string;
  indos_number: string;
  mobile_number: string;
  email: string;
  payment_types: string;
  payment_modes: string;
  payment_ids: string;
  remarks: string;
};

export default function BatchReport() {
  const searchParams = useSearchParams();
  const [tableDatas, setTableDatas] = useState<{
    heads: string[];
    body: (string | null | number)[][];
  }>({
    heads: [
      "STUDENT NAME",
      "FORM ID",
      "BATCH DATE",
      "BATCH FEE",
      "AMOUNT PAID",
      "DUE AMOUNT",
      "MISC PAID AMOUNT",
      "DISCOUNT",
      "FORM STATUS",
      "INDOS NUMBER",
      "MOBILE NUMBER",
      "EMAIL",
      "PAYMENT TYPE",
      "PAYMENT MODE",
      "PAYMENT IDS",
      "REMARKS",
    ],
    body: [],
  });

  const { campus } = usePurifyCampus(searchParams);

  const {
    data: report,
    error,
    isFetching,
  } = useQuery<ISuccess<TBatch[]>, AxiosError<IError>>(
    ["get-dgs-indos-reports", searchParams.toString()],
    async () => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('institute', campus);
      return (
        await axios.get(
          `${BASE_API}/report/batch?${newSearchParams.toString()}`
        )
      ).data;
    },
    {
      onSuccess: (data) => {
        const oldStates = { ...tableDatas };
        if (data.data.length === 0) return;
        // oldStates.heads = Object.keys(data.data[0]);
        oldStates.body = data.data.map((item) => {
          const newObj = { ...item };
          delete (newObj as { profile_image?: string | null }).profile_image;
          return Object.values(newObj);
        });
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
            BASE_API + `/report/batch/excel?${searchParams.toString()}`
          }
        >
          <Button type="button" className="!bg-[#34A853] flex-center gap-4">
            <LuFileSpreadsheet size={20} />
            Generate Excel Sheet
          </Button>
        </DownloadFormUrl>
      </div>

      <HandleSuspence
        error={error}
        isLoading={isFetching}
        dataLength={report?.data.length}
      >
        <div className="w-full overflow-hidden card-shdow">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
            <table className="min-w-max w-full table-auto">
              <thead className="uppercase w-full border-b border-gray-100">
                <tr>
                  {tableDatas.heads.map((item, index) => (
                    <th
                      className={`text-left text-[14px] font-semibold pb-2 px-5 py-4 ${
                        index === 5 ? "text-red-600" : ""
                      } ${stickyFirstCol(index)}`}
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
                    {itemArray.map((value, colIndex) => (
                      <td
                        className={`text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52 ${
                          colIndex === 5 && parseInt(value as string) > 0
                            ? "text-red-600"
                            : ""
                        } ${stickyFirstCol(colIndex)}`}
                        key={value}
                      >
                        {typeof value != "number" && value?.includes("@") ? (
                          <Link
                            className="text-[#346FD8] font-medium"
                            href={`mailto:${value}`}
                          >
                            {value}
                          </Link>
                        ) : colIndex === 2 ? (
                          beautifyDate(value?.toString() || "")
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

      <Pagination dataLength={report?.data.length} />
    </div>
  );
}
