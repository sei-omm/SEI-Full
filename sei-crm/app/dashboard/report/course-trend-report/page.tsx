"use client";

import { BASE_API } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import Button from "@/components/Button";
import DownloadFormUrl from "@/components/DownloadFormUrl";
import DropDown from "@/components/DropDown";
import HandleSuspence from "@/components/HandleSuspence";
import Pagination from "@/components/Pagination";
import { queryClient } from "@/redux/MyProvider";
import { ISuccess, TCourseDropDown } from "@/types";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { LuFileSpreadsheet } from "react-icons/lu";
import { useQueries, UseQueryResult } from "react-query";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

type TCourseTrendReport = {
  batch_id: number;
  start_date: string;
  end_date: string;
  total_enrollment: number;
  total_approved_enrollment: number;
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function CourseTrendReport() {
  const [tableDatas, setTableDatas] = useState<{
    heads: string[];
    body: (string | number)[][];
  }>({
    heads: [
      "Start Date",
      "End Date",
      "Number of Applied Students",
      "Number of Approved Students",
    ],
    body: [],
  });

  const [barData, setBarData] = useState<any | null>(null);

  const manageBarChat = (response: ISuccess<TCourseTrendReport[]>) => {
    const dataForBarChat = {
      labels: response.data.map((item) => beautifyDate(item.start_date)), // X-axis labels
      datasets: [
        {
          label: "Total Enrollment", // Label for the first dataset
          // data: response.data.map((item) => Math.floor(Math.random() * 1000)), // Data points for Dataset 1
          data: response.data.map((item) => item.total_enrollment),
          borderColor: "rgba(75, 192, 192, 1)", // Line color
          backgroundColor: "rgba(75, 192, 192, 0.2)", // Fill under the line
          borderWidth: 2, // Thickness of the line
          tension: 0.4, // Line smoothness
        },
        {
          label: "Approved Enrollment", // Label for the second dataset
          data: response.data.map((item) => item.total_approved_enrollment), // Data points for Dataset 2
          borderColor: "rgba(255, 99, 132, 1)", // Line color
          backgroundColor: "rgba(255, 99, 132, 0.2)", // Fill under the line
          borderWidth: 2, // Thickness of the line
          tension: 0.4, // Line smoothness
        },
      ],
    };
    setBarData(dataForBarChat);
  };

  const searchParams = useSearchParams();
  const route = useRouter();

  // const {
  //   data: report,
  //   error,
  //   isFetching,
  //   refetch,
  // } = useQuery<ISuccess<TCourseTrendReport[]>, AxiosError<IError>>(
  //   ["get-course-trend-report", searchParams.toString()],
  //   async () =>
  //     (
  //       await axios.get(
  //         `${BASE_API}/report/course-trend-report${
  //           searchParams.size != 0 ? `?${searchParams.toString()}` : ""
  //         }`
  //       )
  //     ).data,
  //   {
  //     onSuccess: (data) => {
  //       const oldStates = { ...tableDatas };
  //       if (data.data.length === 0) return;
  //       // oldStates.heads = Object.keys(data.data[0]);
  //       oldStates.body = data.data.map((item) => {
  //         const newObj = { ...item };
  //         delete (newObj as { profile_image?: string | null }).profile_image;
  //         return Object.values(newObj);
  //       });
  //       // manageLineChat();
  //       setTableDatas(oldStates);
  //     },
  //     enabled: searchParams.size != 0,
  //     cacheTime: 0,
  //   }
  // );

  const [courses, report] = useQueries<
    [
      UseQueryResult<ISuccess<TCourseDropDown[]>>,
      UseQueryResult<ISuccess<TCourseTrendReport[]>>
    ]
  >([
    {
      queryKey: "get-courses-dropdown-trend",
      queryFn: async () =>
        (
          await axios.get(
            `${BASE_API}/course/drop-down?institute=${
              searchParams.get("institute") || "Kolkata"
            }`
          )
        ).data,
    },
    {
      queryKey: ["get-course-trend-report", searchParams.toString()],
      queryFn: async () =>
        (
          await axios.get(
            `${BASE_API}/report/course-trend-report${
              searchParams.size != 0 ? `?${searchParams.toString()}` : ""
            }`
          )
        ).data,
      onSettled(data: any) {
        const finalData = data as ISuccess<TCourseTrendReport[]>;
        const oldStates = { ...tableDatas };
        if (finalData.data.length === 0) return;
        oldStates.body = finalData.data.map((item) => {
          const newObj = { ...item };
          delete (newObj as { profile_image?: string | null }).profile_image;
          return Object.values(newObj);
        });
        // manageLineChat();
        manageBarChat(finalData);
        setTableDatas(oldStates);
      },

      enabled: searchParams.size != 0,
      cacheTime: 0,
    },
  ]);

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const urlSearchParams = new URLSearchParams();
    const formData = new FormData(event.currentTarget);
    formData.entries().forEach(([key, value]) => {
      urlSearchParams.set(key, value.toString());
    });

    route.push(
      "/dashboard/report/course-trend-report?" + urlSearchParams.toString()
    );
    queryClient.invalidateQueries("get-course-trend-report");
  }

  return (
    <div className="space-y-10">
      <form
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

        <DropDown
          name="course_type"
          label="Course Type"
          options={[
            { text: "DGS Approved", value: "DGS Approved" },
            { text: "Value Added", value: "Value Added" },
          ]}
          defaultValue={searchParams.get("course_type") || "DGS Approved"}
        />

        <DropDown
          name="course_id"
          label="Course"
          options={
            courses.data?.data.map((item) => ({
              text: item.course_name,
              value: item.course_id,
            })) || []
          }
          defaultValue={
            searchParams.get("course_id") || courses.data?.data[0]?.course_id
          }
        />

        <DropDown
          name="last_no_of_batches"
          label="Last No of Batches"
          options={[
            { text: "3", value: 3 },
            { text: "6", value: 6 },
            { text: "12", value: 12 },
            { text: "18", value: 18 },
            { text: "24", value: 24 },
            { text: "36", value: 36 },
            { text: "48", value: 48 },
            { text: "96", value: 96 },
          ]}
        />

        <div className="!mb-2 !flex-grow-0 flex items-center gap-5">
          <Button className="">Search</Button>
        </div>
      </form>

      {/* <ManageAdmissionFilter /> */}

      {barData && (
        <Line
          data={barData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "top", // Position of the legend
              },
              title: {
                display: true,
                text: "Batch Trend Report", // Chart title
              },
            },
          }}
        />
      )}

      <div className="flex items-center justify-end">
        <DownloadFormUrl
          className={tableDatas.body.length !== 0 ? "block" : "hidden"}
          urlToDownload={
            BASE_API +
            `/report/course-trend-report/excel?${searchParams.toString()}`
          }
        >
          <Button type="button" className="!bg-[#34A853] flex-center gap-4">
            <LuFileSpreadsheet size={20} />
            Generate Excel Sheet
          </Button>
        </DownloadFormUrl>
      </div>

      <HandleSuspence
        isLoading={report.isFetching}
        error={report.error}
        dataLength={report.data?.data.length}
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
                    {itemArray.map((value, rowIndex) => (
                      <td
                        className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                        key={value}
                      >
                        {rowIndex === 0 || rowIndex === 1
                          ? beautifyDate(value.toString())
                          : value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </HandleSuspence>

      <Pagination dataLength={report.data?.data.length} />
    </div>
  );
}
