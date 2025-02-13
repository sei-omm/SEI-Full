"use client";

import { BASE_API } from "@/app/constant";
import Button from "@/components/Button";
import DropDown from "@/components/DropDown";
import HandleSuspence from "@/components/HandleSuspence";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { EmployeeType, ISuccess } from "@/types";
import axios from "axios";
import Image from "next/image";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";
import Pagination from "../Pagination";

type TTraningInfo = {
  employee_id: number;
  profile_image: string | null;
  name: string;
  employee_type: EmployeeType;
};

async function getEmployeeTranningInfo(searchParams: ReadonlyURLSearchParams) {
  return (await axios.get(`${BASE_API}/tranning?${searchParams.toString()}`))
    .data;
}

type TTable = {
  heads: string[];
  body: string[][];
};

export default function GenerateTranning() {
  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: [
      "Employee",
      "Induction Training",
      "Skill Enhancement",
      "Training Requirement",
    ],
    body: [],
  });

  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const {
    data: tranningList,
    error,
    isFetching,
  } = useQuery<ISuccess<TTraningInfo[]>>({
    queryKey: ["get-employee-tranning-info", searchParams.toString()],
    queryFn: () => getEmployeeTranningInfo(searchParams),
    onSuccess(data) {
      setTableDatas((preState) => ({
        ...preState,
        body: data.data.map((item) => [
          item.name,
          "Induction Training",
          "Skill Enhancement",
          "Training Requirement",
        ]),
      }));
    },
    refetchOnMount: true,
  });

  return (
    <div className="space-y-5">
      <DropDown
        changeSearchParamsOnChange
        name="institute"
        wrapperCss="inline-block"
        label="Campus"
        options={[
          { text: "Kolkata", value: "Kolkata" },
          { text: "Faridabad", value: "Faridabad" },
        ]}
        defaultValue={searchParams.get("institute") || "Kolkata"}
      />
      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={tranningList?.data.length}
      >
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black card-shdow rounded-xl">
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
                <tr key={rowIndex} className="hover:bg-gray-100 group/bodyitem">
                  {itemArray.map((value, columnIndex) => (
                    <td
                      className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                      key={value}
                    >
                      {
                        <span className="line-clamp-1 inline-flex gap-x-3">
                          {columnIndex === 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="size-10 bg-gray-200 overflow-hidden rounded-full">
                                <Image
                                  className="size-full object-cover"
                                  src={
                                    tranningList?.data[rowIndex]
                                      ?.profile_image || ""
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
                            <div className="space-y-1">
                              <Button
                                onClick={() => {
                                  dispatch(
                                    setDialog({
                                      dialogId:
                                        columnIndex === 1
                                          ? "Induction Training"
                                          : columnIndex === 2
                                          ? "Skill Enhancement"
                                          : "Training Requirement",
                                      type: "OPEN",
                                      extraValue: {
                                        employee_id:
                                          tranningList?.data[rowIndex]
                                            .employee_id,
                                        btn_type: "Generate",
                                        employee_type:
                                          tranningList?.data[rowIndex]
                                            .employee_type,
                                      },
                                    })
                                  );
                                }}
                              >
                                Generate
                              </Button>
                              {/* //   <div className="flex items-center gap-2 text-green-700">
                                //   <IoCheckmarkDoneCircle />
                                //   <span>Generated At 20 Feb 2025</span>
                                // </div>
                                // <div className="flex items-center gap-2 text-green-700">
                                //   <IoCheckmarkDoneCircle />
                                //   <span>Completed At 20 Feb 2025</span>
                                // </div> */}
                            </div>
                          )}
                        </span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HandleSuspence>
      <Pagination dataLength={tranningList?.data.length} />
    </div>
  );
}
