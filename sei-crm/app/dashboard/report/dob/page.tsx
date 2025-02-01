"use client";

import { BASE_API } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import Button from "@/components/Button";
import DateInput from "@/components/DateInput";
import DownloadFormUrl from "@/components/DownloadFormUrl";
import HandleSuspence from "@/components/HandleSuspence";
import TagsBtn from "@/components/TagsBtn";
import { IError, ISuccess } from "@/types";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { LuFileSpreadsheet } from "react-icons/lu";
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
import { RiMailSendLine } from "react-icons/ri";
import { useDoMutation } from "@/app/utils/useDoMutation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type TDobReport = {
  name: string;
  profile_image: string | null;
  email: string;
  mobile_number: string;
  dob: string;
  action?: string;
};

// type TLineGrap = {
//   labels: string[];
//   datasets: {
//     label: string;
//     data: number[];
//     fill: boolean;
//     borderColor: string;
//     tension: number;
//   }[];
// };

const fetchData = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
};
export default function DobReport() {
  const [tableDatas, setTableDatas] = useState<{
    heads: string[];
    body: (string | null)[][];
  }>({
    heads: [
      "Student Name",
      "Student Date Of Birth",
      "Student Email",
      "Student Contact Number",
      "Action",
    ],
    body: [],
  });

  const searchParams = useSearchParams();
  const route = useRouter();

  const {
    data: report,
    error,
    isFetching,
  } = useQuery<ISuccess<TDobReport[]>, AxiosError<IError>>(
    ["fetch-dob-report", searchParams.toString()],
    () =>
      fetchData(
        `${BASE_API}/report/dob${
          searchParams.size != 0 ? `?${searchParams.toString()}` : ""
        }`
      ),
    {
      onSuccess: (data) => {
        const oldStates = { ...tableDatas };
        oldStates.body = data.data.map((item) => {
          const newObj = { ...item };
          newObj.action = "actionBtn";
          delete (newObj as { profile_image?: string | null }).profile_image;
          return Object.values(newObj);
        });
        setTableDatas(oldStates);
      },
      enabled: searchParams.size != 0,
      cacheTime: 0,
    }
  );

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const searchParams = new URLSearchParams();
    searchParams.set("birth_date", `${formData.get("birth_date")}`);
    route.push(`/dashboard/report/dob?${searchParams.toString()}`);
  };

  const { mutate, isLoading: isSendingEmail } = useDoMutation();

  const handleSendEmail = (rowIndex: number) => {
    const formData = new FormData();
    formData.append("student_name", `${report?.data[rowIndex].name}`);
    formData.append("student_email", `${report?.data[rowIndex].email}`);
    mutate({
      apiPath: "/report/dob/send-wish",
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      formData,
    });
  };
  return (
    <div className="space-y-12">
      {/* Filters */}
      <form
        onSubmit={handleFormSubmit}
        className="flex items-end gap-5 *:flex-grow"
      >
        <DateInput
          required
          label="Birth Date"
          name="birth_date"
          type="date"
          date={searchParams.get("birth_date")}
        />

        <div className="!mb-2 !flex-grow-0 flex items-center gap-5">
          <Button className="">Search</Button>
          <DownloadFormUrl
            className={tableDatas.body.length !== 0 ? "block" : "hidden"}
            urlToDownload={
              BASE_API + `/report/dob/excel?${searchParams.toString()}`
            }
          >
            <Button type="button" className="!bg-[#34A853] flex-center gap-4">
              <LuFileSpreadsheet size={20} />
              Generate Excel Sheet
            </Button>
          </DownloadFormUrl>
        </div>
      </form>

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
                    {itemArray.map((value, columnIndex) => (
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
                        ) : value === "actionBtn" ? (
                          <div>
                            <Button
                              disabled={isSendingEmail}
                              onLoadingRemoveContent={true}
                              loading={isSendingEmail}
                              onClick={() => handleSendEmail(rowIndex)}
                              className="!bg-transparent !shadow-none !text-black"
                            >
                              <RiMailSendLine size={18} title="Send Email" />
                            </Button>
                          </div>
                        ) : (
                          <span className="line-clamp-1 inline-flex gap-x-3">
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
    </div>
  );
}
