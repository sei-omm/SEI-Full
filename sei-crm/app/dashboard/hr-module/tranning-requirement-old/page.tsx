"use client";

import { BASE_API } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import Button from "@/components/Button";
import DropDown from "@/components/DropDown";
import HandleSuspence from "@/components/HandleSuspence";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { ISuccess } from "@/types";
import axios from "axios";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";

type TType = {
  head: string[];
  body: (string | null)[][];
};

type TTraningInfo = {
  employee_id: number;
  it_completed_date: string | null;
  se_completed_date: string | null;
  tr_generated_date: string | null;
  tr_completed_date: string | null;
  created_at: string;
};

type TTranningList = {
  employee_id: number;
  profile_image: string;
  name: string;
  employee_type: string;
  training_info: TTraningInfo[];
};

async function getTranningList(institute: string | null) {
  return (
    await axios.get(
      `${BASE_API}/tranning${institute ? `?institute=${institute}` : ""}`
    )
  ).data;
}

export default function TeacherTraining() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [tableDatas, setTableDatas] = useState<TType>({
    head: [
      "Employee",
      "Induction Training",
      "Skill Enhancement",
      "Training Requirement",
    ],
    body: [[]],
  });

  const {
    data: tranningList,
    error,
    isFetching,
  } = useQuery<ISuccess<TTranningList[]>>({
    queryKey: ["tranning-list", searchParams.toString()],
    queryFn: () => getTranningList(searchParams.get("institute")),
    onSuccess(data) {
      setTableDatas((preState) => ({
        ...preState,
        body: data.data.map((item) => [
          item.name,
          "it_completed_date",
          "se_completed_date",
          "tr_generated_date-tr_completed_date",
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
                              {columnIndex === 1 &&
                              tranningList?.data[rowIndex].training_info[0]
                                ?.it_completed_date ? (
                                <div className="flex items-center gap-2 text-green-700">
                                  <IoCheckmarkDoneCircle />
                                  <span>
                                    Completed At{" "}
                                    {beautifyDate(
                                      tranningList?.data[rowIndex]
                                        .training_info[0].it_completed_date
                                    )}
                                  </span>
                                </div>
                              ) : columnIndex === 2 &&
                                tranningList?.data[rowIndex].training_info[0]
                                  ?.se_completed_date ? (
                                <div className="flex items-center gap-2 text-green-700">
                                  <IoCheckmarkDoneCircle />
                                  <span>
                                    Completed At{" "}
                                    {beautifyDate(
                                      tranningList?.data[rowIndex]
                                        .training_info[0].se_completed_date
                                    )}
                                  </span>
                                </div>
                              ) : columnIndex === 3 &&
                                tranningList?.data[rowIndex].training_info[0]
                                  ?.tr_generated_date &&
                                tranningList?.data[rowIndex].training_info[0]
                                  ?.tr_completed_date ? (
                                <>
                                  <div className="flex items-center gap-2 text-green-700">
                                    <IoCheckmarkDoneCircle />
                                    <span>
                                      Generated At{" "}
                                      {beautifyDate(
                                        tranningList?.data[rowIndex]
                                          .training_info[0].tr_generated_date
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-green-700">
                                    <IoCheckmarkDoneCircle />
                                    <span>
                                      Completed At{" "}
                                      {beautifyDate(
                                        tranningList?.data[rowIndex]
                                          .training_info[0].tr_completed_date
                                      )}
                                    </span>
                                  </div>
                                </>
                              ) : columnIndex === 3 &&
                                tranningList?.data[rowIndex].training_info[0]
                                  ?.tr_generated_date ? (
                                <div className="flex items-center gap-2 text-green-700">
                                  <IoCheckmarkDoneCircle />
                                  <span>Generated At 20 Feb 2025</span>
                                </div>
                              ) : columnIndex === 3 &&
                                tranningList?.data[rowIndex].training_info[0]
                                  ?.tr_completed_date ? (
                                <div className="flex items-center gap-2 text-green-700">
                                  <IoCheckmarkDoneCircle />
                                  <span>Completed At 20 Feb 2025</span>
                                </div>
                              ) : (
                                <Button
                                  onClick={() => {
                                    dispatch(
                                      setDialog({
                                        dialogId:
                                          columnIndex === 1
                                            ? "induction-tranning-form"
                                            : columnIndex === 2
                                            ? "skill-enhancement-form"
                                            : "training-requirement-form",
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
                              )}

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
    </div>
  );
}
