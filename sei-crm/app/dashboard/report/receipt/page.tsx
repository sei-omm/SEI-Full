"use client";

import { BASE_API } from "@/app/constant";
import { stickyFirstCol } from "@/app/utils/stickyFirstCol";
import DateDurationFilter from "@/components/DateDurationFilter";
import GenarateExcelReportBtn from "@/components/GenarateExcelReportBtn";
import HandleSuspence from "@/components/HandleSuspence";
import Pagination from "@/components/Pagination";
import { IError, ISuccess } from "@/types";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { useQuery } from "react-query";

export default function ReceiptReport() {
  const searchParams = useSearchParams();

  const [tableDatas, setTableDatas] = useState<{
    heads: string[];
    body: (string | null)[][];
  }>({
    heads: [
      "STUDENT NAME",
      "DUE AMOUNT",
      "INDOS NUMBER",
      "MOBILE NUMBER",
      "EMAIL",
      "PAYMENT TYPE",
      "PAYMENT MODE",
      "AMOUNT PAID",
      "PAYMENT ID",
      "PAYMENT REMARK",
      "BANK TRANSACTION ID",
      "MISC PAID AMOUNT",
      "MISC REMARK",
      "RECEIPT NUMBER",
      "RECEIPT DATE",
      "DISCOUNT AMOUNT",
      "DISCOUNT REMARK",
    ],
    body: [],
  });

  const {
    data: report,
    error,
    isFetching,
  } = useQuery<ISuccess<any[]>, AxiosError<IError>>(
    ["get-receipt-report", searchParams.toString()],
    async () =>
      (
        await axios.get(
          `${BASE_API}/report/receipt${
            searchParams.size != 0 ? `?${searchParams.toString()}` : ""
          }`
        )
      ).data,
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
        // manageLineChat();

        setTableDatas(oldStates);
      },
      enabled: searchParams.size != 0,
      cacheTime: 0,
    }
  );

  return (
    <div className="space-y-10">
      <DateDurationFilter />
      <div className="flex items-center justify-end">
        <GenarateExcelReportBtn
          apiPath={`/report/receipt/excel?${searchParams.toString()}`}
          hidden = {report?.data.length === 0}
        />
      </div>

      <HandleSuspence
        isLoading={isFetching}
        dataLength={report?.data.length}
        error={error}
      >
        <div className="w-full overflow-hidden card-shdow">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
            <table className="min-w-max w-full table-auto">
              <thead className="uppercase w-full border-b border-gray-100">
                <tr>
                  {tableDatas.heads.map((item, index) => (
                    <th
                      className={`text-left text-[14px] font-semibold pb-2 px-5 py-4 ${
                        index === 1 ? "text-red-600" : ""
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
                          colIndex === 1 && parseInt(value as string) > 0
                            ? "text-red-600"
                            : ""
                        } ${stickyFirstCol(colIndex)}`}
                        key={`${rowIndex}${colIndex}`}
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
      <Pagination dataLength={report?.data.length} />
    </div>
  );
}
