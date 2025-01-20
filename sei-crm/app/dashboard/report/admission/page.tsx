"use client";

import { BASE_API } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import HandleSuspence from "@/components/HandleSuspence";
import TagsBtn from "@/components/TagsBtn";
import { IError, ISuccess } from "@/types";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

const fetchData = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
};
export default function AdmissionReport() {
  const [tableDatas, setTableDatas] = useState<{
    heads: string[];
    body: (string | null)[][];
  }>({
    heads: [
      "Enrolled Date",
      "Course Name",
      "Course Fee",
      "Student Due Amount",
      "Student Name",
      "Course Type",
      "Student Email",
      "Student Contact Number",
      "Student Pay For This Course",
      "Student Misc Paid Amount",
      "Total Paid",
    ],
    body: [],
  });

  const searchParams = useSearchParams();

  const {
    data: report,
    error,
    isFetching,
  } = useQuery<ISuccess<TAdmissionReport[]>, AxiosError<IError>>(
    ["fetch-admission-report", searchParams.toString()],
    () =>
      fetchData(
        `${BASE_API}/report/admission${
          searchParams.size != 0 ? `?${searchParams.toString()}` : ""
        }`
      ),
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
      enabled: searchParams.size != 0,
      cacheTime: 0,
    }
  );

  // const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   const formData = new FormData(event.currentTarget);

  //   const searchParams = new URLSearchParams();
  //   searchParams.set("institute", `${formData.get("institute")}`);
  //   searchParams.set("from_date", `${formData.get("from_date")}`);
  //   searchParams.set("to_date", `${formData.get("to_date")}`);
  //   route.push(`/dashboard/report/admission?${searchParams.toString()}`);
  //   refetch();
  // };

  // const data = {
  //   labels: ["Jan", "Fab", "Mar", "Apr", "May", "Jun", "July"],
  //   datasets: [
  //     {
  //       label: "My First Dataset",
  //       data: [65, 59, 80, 81, 56, 55, 40],
  //       fill: false,
  //       borderColor: "rgb(75, 192, 192)",
  //       tension: 0.1,
  //     },
  //   ],
  // };

  // function formatDate(date: Date): string {
  //   const options: Intl.DateTimeFormatOptions = {
  //     day: "2-digit",
  //     month: "short",
  //   };
  //   return date.toLocaleDateString("en-GB", options).replace(",", "");
  // }

  // function getDateRange(startDate: string, endDate: string): string[] {
  //   const dates: string[] = [];
  //   let currentDate: Date = new Date(startDate);
  //   const end: Date = new Date(endDate);

  //   while (currentDate <= end) {
  //     dates.push(beautifyDate(currentDate.toString()));
  //     currentDate.setDate(currentDate.getDate() + 1); // Increment the date by 1
  //   }

  //   return dates;
  // }

  // const [lineData, setLineData] = useState<TLineGrap | null>(null);

  // function manageLineChat() {
  //   const startDate = searchParams.get("from_date");
  //   const endDate = searchParams.get("to_date");

  //   const labels: string[] = getDateRange(startDate || "", endDate || "");

  //   setLineData({
  //     labels: labels,
  //     datasets: [
  //       {
  //         label: "Enrollment",
  //         data: [0, 1, 10, 2, 5, 6, 7],
  //         fill: false,
  //         borderColor: "rgb(75, 192, 192)",
  //         tension: 0.1,
  //       },
  //     ],
  //   });
  // }

  return (
    <div className="space-y-5">
      {/* Filters */}
      {/* <form
        onSubmit={handleFormSubmit}
        className="flex items-end gap-5 *:flex-grow"
      >
        <DropDown
          name="institute"
          label="Campus"
          options={[
            { text: "Kolkata", value: "Kolkata" },
            { text: "Faridabad", value: "Faridabad" },
          ]}
          defaultValue={searchParams.get("institute") || "Kolkata"}
        />

        <DateInput
          required
          label="From Date"
          name="from_date"
          date={searchParams.get("from_date")}
        />

        <DateInput
          required
          label="To Date"
          name="to_date"
          date={searchParams.get("to_date")}
        />

        <div className="!mb-2 !flex-grow-0 flex items-center gap-5">
          <Button className="">Search</Button>
          <DownloadFormUrl
            className={tableDatas.body.length !== 0 ? "block" : "hidden"}
            urlToDownload={
              BASE_API + `/report/admission/excel?${searchParams.toString()}`
            }
          >
            <Button type="button" className="!bg-[#34A853] flex-center gap-4">
              <LuFileSpreadsheet size={20} />
              Generate Excel Sheet
            </Button>
          </DownloadFormUrl>
        </div>
      </form> */}
      <DateDurationFilter withMoreFilter = {true}/>

      <div className="flex items-center justify-end">
        <GenarateExcelReportBtn
          hidden={tableDatas.body.length === 0}
          apiPath={`/report/admission/excel?${searchParams.toString()}`}
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
                      className="text-left text-[14px] font-semibold pb-2 px-5 py-4"
                      key={item}
                    >
                      <span className={`${index === 3 ? "text-red-600" : ""}`}>
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
                        className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
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
                            className={`line-clamp-1 inline-flex gap-x-3 ${
                              columnIndex === 3
                                ? "text-red-600 font-semibold"
                                : ""
                            }`}
                          >
                            {columnIndex === 4 ? (
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
                            ) : columnIndex === 0 ? (
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
