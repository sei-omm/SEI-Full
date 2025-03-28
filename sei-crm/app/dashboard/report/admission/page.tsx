"use client";

import { BASE_API } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import HandleSuspence from "@/components/HandleSuspence";
import TagsBtn from "@/components/TagsBtn";
import { IError, ISuccess } from "@/types";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { useQuery } from "react-query";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import DateDurationFilter from "@/components/DateDurationFilter";
import GenarateExcelReportBtn from "@/components/GenarateExcelReportBtn";
import Pagination from "@/components/Pagination";
import { stickyFirstCol } from "@/app/utils/stickyFirstCol";
import { usePurifyCampus } from "@/hooks/usePurifyCampus";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type TAdmissionReport = {
  created_at: string;
  course_name: string;
  course_fee: string;
  course_type: string;
  name: string;
  profile_image: string | null;
  email: string;
  mobile_number: string;
  paid_amount_for_course: string;
  total_misc_amount: string;
  due_amount_for_course: string;
  total_paid: string;
};

const fetchData = async (searchParams: ReadonlyURLSearchParams, campus : string) => {
  const newSearchParams = new URLSearchParams(searchParams);
  newSearchParams.set("institute", campus)
  const response = await axios.get(
    `${BASE_API}/report/admission${newSearchParams.toString()}`
  );
  return response.data;
};
export default function AdmissionReport() {
  const [tableDatas, setTableDatas] = useState<{
    heads: string[];
    body: (string | null)[][];
  }>({
    heads: [
      "Student Name",
      "Batch Date",
      "Course Name",
      "Course Fee",
      "Student Due Amount",
      "Course Type",
      "Student Email",
      "Student Contact Number",
      "Amount Paid",
      "Misc Amount Paid",
      "Total Paid",
      "Discount Amount",
    ],
    body: [],
  });

  const searchParams = useSearchParams();
  const { campus } = usePurifyCampus(searchParams)

  const {
    data: report,
    error,
    isFetching,
  } = useQuery<ISuccess<TAdmissionReport[]>, AxiosError<IError>>(
    ["fetch-admission-report", searchParams?.toString()],
    () => fetchData(searchParams, campus),
    {
      onSuccess: (data) => {
        const oldStates = { ...tableDatas };
        oldStates.body = data.data.map((item) => {
          const newObj = { ...item };
          delete (newObj as { profile_image?: string | null }).profile_image;
          return Object.values(newObj);
        });
        // manageLineChat();
        setTableDatas(oldStates);
      },
      enabled: searchParams?.size != 0,
      cacheTime: 0,
    }
  );

  return (
    <div className="space-y-5">
      {/* Filters */}
      <DateDurationFilter
        withMoreFilter={true}
        withStudentRank={true}
        withCourse={true}
      />

      <div className="flex items-center justify-end">
        <GenarateExcelReportBtn
          hidden={tableDatas.body.length === 0}
          apiPath={`/report/admission/excel?${searchParams?.toString()}`}
        />
      </div>

      {/* chat view */}
      {/* {lineData === null ? null : (
        <div className="w-[550px]">
          <Line data={lineData} />
        </div>
      )} */}

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
                      className={`text-left text-[14px] font-semibold pb-2 px-5 py-4 ${stickyFirstCol(
                        index
                      )}`}
                      key={item}
                    >
                      <span
                        className={`${
                          index === 4 ? "text-red-600" : "text-black"
                        }`}
                      >
                        {item}
                      </span>
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
                    {itemArray.map((value, columnIndex) => (
                      <td
                        className={`text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52 ${stickyFirstCol(
                          columnIndex
                        )}`}
                        key={value}
                      >
                        {typeof value !== "number" && value?.includes("@") ? (
                          <Link
                            className="text-[#346FD8] font-medium"
                            href={`mailto:${value}`}
                          >
                            {value}
                          </Link>
                        ) : (
                          <span
                            className={`line-clamp-1 inline-flex gap-x-3  ${
                              columnIndex === 4 && parseInt(value as any) > 0
                                ? "text-red-600 font-semibold"
                                : ""
                            }`}
                          >
                            {columnIndex === 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="size-10 bg-gray-200 overflow-hidden rounded-full">
                                  {!report ||
                                  report.data[rowIndex].profile_image ===
                                    null ? null : (
                                    <Image
                                      className="size-full object-cover"
                                      src={
                                        report.data[rowIndex].profile_image ||
                                        ""
                                      }
                                      alt="Student Image"
                                      height={90}
                                      width={90}
                                      quality={100}
                                    />
                                  )}
                                </div>
                                {value}
                              </div>
                            ) : value === "Approved" ? (
                              <TagsBtn type="SUCCESS">Approved</TagsBtn>
                            ) : value === "Cancelled" ? (
                              <TagsBtn type="FAILED">Cancelled</TagsBtn>
                            ) : value === "Pending" || value === null ? (
                              <TagsBtn type="PENDING">Pending</TagsBtn>
                            ) : columnIndex === 1 ? (
                              beautifyDate(value)
                            ) : (
                              value
                            )}
                          </span>
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
