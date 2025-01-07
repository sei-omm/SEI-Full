"use client";

import { BASE_API } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import CourseWithBatchFilter from "@/components/Filters/CourseWithBatchFilter";
import CourseWithDateRange from "@/components/Filters/CourseWithDateRange";
import GenarateExcelReportBtn from "@/components/GenarateExcelReportBtn";
import HandleSuspence from "@/components/HandleSuspence";
import Pagination from "@/components/Pagination";
import { ISuccess, TRefundReport } from "@/types";
import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "react-query";

export default function RefundReport() {
  const [tableDatas, setTableDatas] = useState<{
    heads: string[];
    body: (string | null)[][];
  }>({
    heads: [
      "CANDIDATE NAME",
      "COURSE",
      "BATCH DATE",
      "PAYMENT DETAILS",
      "TOTAL AMOUNT",
      "ORDER ID",
      "PAYMENT DATE",
      "RECEIPT NO",
      "PAYMENT TYPE",
      "REFUND AMOUNT",
      "REASON",
      "BANK DETAILS",
      "REFUND DATE",
      "EXECUTIVE NAME",
      "REFUND ID",
    ],
    body: [],
  });

  const searchParams = useSearchParams();

  const {
    data: report,
    isFetching,
    error,
  } = useQuery<ISuccess<TRefundReport[]>>({
    queryKey: ["fetch-refund-report", searchParams.toString()],
    queryFn: async () =>
      (await axios.get(`${BASE_API}/report/refund?${searchParams.toString()}`))
        .data,
    enabled: searchParams.size !== 0,
    onSuccess: (data) => {
      setTableDatas((preState) => ({
        ...preState,
        body: data.data.map((item) => [
          item.name,
          item.course_name,
          item.start_date,
          item.payment_details,
          item.total_amount,
          item.order_ids,
          item.payment_dates,
          item.receipt_nos,
          item.payment_types,
          item.refund_amount,
          item.refund_reason,
          item.bank_details,
          item.created_at,
          item.executive_name,
          item.refund_id,
        ]),
      }));
    },
  });

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        <CourseWithBatchFilter />
        <span className="text-center block text-sm text-gray-500">OR</span>
        <CourseWithDateRange />

        <div className="flex items-center justify-end">
          <GenarateExcelReportBtn
            apiPath={`/report/refund/excel?${searchParams.toString()}`}
            hidden={tableDatas.body.length === 0}
          />
        </div>
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
                    {itemArray.map((value, colIndex) => (
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
                        ) : colIndex === 2 || colIndex === 12 ? (
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
