"use client";

import { BASE_API } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import Button from "@/components/Button";
import DownloadFormUrl from "@/components/DownloadFormUrl";
import DropDown from "@/components/DropDown";
import HandleSuspence from "@/components/HandleSuspence";
import { IError, ISuccess } from "@/types";
import axios, { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { LuFileSpreadsheet } from "react-icons/lu";
import { useQuery } from "react-query";

type TCourseTrendReport = {
  batch_id: number;
  start_date: string;
  end_date: string;
  total_enrolled: number;
  total_approved_enrollment: number;
};

export default function CourseTrendReport() {
  const [tableDatas, setTableDatas] = useState<{
    heads: string[];
    body: (string | number)[][];
  }>({
    heads: [],
    body: [],
  });

  const searchParams = useSearchParams();
  const route = useRouter();
  const [selectedCourse, setSelectedCourse] = useState(0);

  const { data: dropDownCoursesInfo } = useQuery<
    ISuccess<{ course_id: number; course_name: string }[]>
  >({
    queryKey: "get-course-names",
    queryFn: async () => (await axios.get(BASE_API + "/course/drop-down")).data,
    onSuccess: (cData) => {
      if (searchParams.get("course_id")) {
        setSelectedCourse(parseInt(`${searchParams.get("course_id")}`));
      } else {
        setSelectedCourse(cData.data[0].course_id);
      }
    },
  });

  const {
    data: report,
    error,
    isFetching,
    refetch,
  } = useQuery<ISuccess<TCourseTrendReport[]>, AxiosError<IError>>(
    ["get-course-trend-report", searchParams.toString()],
    async () =>
      (
        await axios.get(
          `${BASE_API}/report/course-trend-report${
            searchParams.size != 0 ? `?${searchParams.toString()}` : ""
          }`
        )
      ).data,
    {
      onSuccess: (data) => {
        const oldStates = { ...tableDatas };
        if (data.data.length === 0) return;
        oldStates.heads = Object.keys(data.data[0]);
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
    refetch();
  }

  return (
    <div className="space-y-10">
      <form
        onSubmit={handleFormSubmit}
        className="flex items-end gap-5 *:flex-grow"
      >
        <DropDown
          name="institute"
          label="Institute"
          options={[
            { text: "Kolkata", value: "Kolkata" },
            { text: "Faridabad", value: "Faridabad" },
          ]}
          defaultValue={searchParams.get("institute")}
        />

        <DropDown
          name="course_type"
          label="Course Type"
          options={[
            { text: "DGS Approved", value: "DGS Approved" },
            { text: "Value Added", value: "Value Added" },
          ]}
          defaultValue={searchParams.get("course_type")}
        />

        <DropDown
          name="course_id"
          label="Course"
          options={
            dropDownCoursesInfo?.data.map((item) => ({
              text: item.course_name,
              value: item.course_id,
            })) || []
          }
          defaultValue={selectedCourse}
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
        errorMsg={
          error
            ? error.response?.data.message
            : tableDatas.body.length === 0
            ? "No Response"
            : report?.data.length === 0
            ? "No Data Found"
            : ""
        }
        isLoading={isFetching}
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
    </div>
  );
}
