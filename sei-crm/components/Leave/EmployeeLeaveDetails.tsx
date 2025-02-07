"use client";

import { BASE_API } from "@/app/constant";
import { ISuccess } from "@/types";
import axios from "axios";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { useQuery } from "react-query";
import HandleSuspence from "../HandleSuspence";

type TTable = {
  head: string[];
  body: (string | number)[][];
};

type TEmployeesLeave = {
  name: string;
  profile_image: string;
  cl: number; // Casual Leave
  sl: number; // Sick Leave
  el: number; // Earned Leave
  ml: number; // Maternity Leave (or another type)
};

export default function EmployeeLeaveDetails() {
  const [tableDatas, setTableDatas] = useState<TTable>({
    head: [
      "Name",
      "Casual Leave",
      "Sick Leave",
      "Earned Leave",
      "Paid Maternity Leave",
    ],
    body: [],
  });

  const searchParams = useSearchParams();

  const {
    data: result,
    error,
    isFetching,
  } = useQuery<ISuccess<TEmployeesLeave[]>>({
    queryKey: ["get-all-employee-leave-details", searchParams.toString()],
    queryFn: async () =>
      (
        await axios.get(
          `${BASE_API}/hr/leave/employees?institute=${
            searchParams.get("institute") || "Kolkata"
          }`
        )
      ).data,
    refetchOnMount: true,

    onSuccess(data) {
      setTableDatas((preState) => ({
        ...preState,
        body: data.data.map((item) => [
          item.name,
          item.cl,
          item.sl,
          item.el,
          item.ml,
        ]),
      }));
    },
  });

  return (
    <>
      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={result?.data.length}
      >
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black card-shdow rounded-xl">
          <table className="min-w-max w-full table-auto">
            <thead className="uppercase w-full border-b border-gray-100">
              <tr>
                {tableDatas.head.map((item) => (
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
                <tr key={rowIndex} className="hover:bg-gray-100 group/bodyitem">
                  {itemArray.map((value, colIndex) => (
                    <td
                      className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                      key={value}
                    >
                      <span className="line-clamp-1 inline-flex gap-x-3">
                        {colIndex === 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="size-10 bg-gray-200 overflow-hidden rounded-full">
                              <Image
                                className="size-full object-cover"
                                src={
                                  result?.data?.[rowIndex]?.profile_image || ""
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
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HandleSuspence>
    </>
  );
}
