"use client";

import { BASE_API } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { getAuthToken } from "@/app/utils/getAuthToken";
import DropDown from "@/components/DropDown";
import HandleSuspence from "@/components/HandleSuspence";
import { ISuccess } from "@/types";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { IoPrintSharp } from "react-icons/io5";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useQuery } from "react-query";

type TTable = {
  head: string[];
  body: string[][];
};

type TAppraisalEvery = {
  appraisal_id: number;
  created_at: string;
  appraisal_of_employee_id: string;
  appraisal_of: string;
  profile_image: string;
  email_address: string;
};

async function getAppraisal(searchParams: ReadonlyURLSearchParams) {
  return (
    await axios.get(
      `${BASE_API}/employee/appraisal?type=Admin&institute=${
        searchParams.get("institute") || "Kolkata"
      }`,
      {
        headers: {
          ...getAuthToken(),
        },
      }
    )
  ).data;
}

export default function PerformanceManagement() {
  const [appraisalList, setAppraisalList] = useState<TTable>({
    head: ["Appraisal Of", "Email", "Generated At", "Action"],
    body: [],
  });

  const searchParams = useSearchParams();

  const {
    data: appraisal,
    error,
    isFetching,
  } = useQuery<ISuccess<TAppraisalEvery[]>>({
    queryKey: ["appraisal", searchParams.get("institute")],
    queryFn: () => getAppraisal(searchParams),
    onSuccess(data) {
      setAppraisalList((preState) => ({
        ...preState,
        body: data.data.map((item) => [
          item.appraisal_of,
          item.email_address,
          beautifyDate(item.created_at),
          "actionBtn",
        ]),
      }));
    },
    refetchOnMount: true,
  });

  return (
    <div className="space-y-6">
      <div className="inline-block">
        <DropDown
          changeSearchParamsOnChange
          name="institute"
          label="Campus"
          options={[
            { text: "Kolkata", value: "Kolkata" },
            { text: "Faridabad", value: "Faridabad" },
          ]}
          defaultValue={searchParams.get("institute") || "Kolkata"}
        />
      </div>
      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={appraisal?.data.length}
        noDataMsg="No Appraisal Found"
      >
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black card-shdow rounded-xl">
          <table className="min-w-max w-full table-auto">
            <thead className="uppercase w-full border-b border-gray-100">
              <tr>
                {appraisalList.head.map((item) => (
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
              {appraisalList.body.map((itemArray, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-100 group/bodyitem">
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
                      ) : (
                        <span className="line-clamp-1 inline-flex gap-x-3">
                          {value === "actionBtn" ? (
                            <div className="flex-center gap-4">
                              <Link
                                href={`/dashboard/hr-module/performance-management/view?id=${appraisal?.data?.[rowIndex].appraisal_id}`}
                              >
                                <MdOutlineRemoveRedEye
                                  size={18}
                                  className="cursor-pointer"
                                />
                              </Link>
                              <Link
                                target="__blank"
                                href={`${BASE_API}/employee/appraisal/print/${appraisal?.data?.[rowIndex].appraisal_id}`}
                              >
                                <IoPrintSharp
                                  size={18}
                                  className="cursor-pointer"
                                />
                              </Link>
                            </div>
                          ) : columnIndex === 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="size-10 bg-gray-200 overflow-hidden rounded-full">
                                <Image
                                  className="size-full object-cover"
                                  src={
                                    appraisal?.data?.[rowIndex].profile_image ||
                                    ""
                                  }
                                  alt="Employee Image"
                                  height={90}
                                  width={90}
                                  quality={100}
                                />
                              </div>
                              {value}
                            </div>
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
      </HandleSuspence>
    </div>
  );
}
