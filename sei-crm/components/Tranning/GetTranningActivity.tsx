"use client";

import Image from "next/image";
import { useState } from "react";
import HandleSuspence from "../HandleSuspence";
import { EmployeeType, ISuccess } from "@/types";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { IoCheckmarkDoneCircle, IoOpenOutline } from "react-icons/io5";
import { MdOutlinePendingActions } from "react-icons/md";
import Button from "../Button";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useDispatch } from "react-redux";
import Pagination from "../Pagination";
import { LuPrinter } from "react-icons/lu";
import Link from "next/link";
import { usePurifySearchParams } from "@/hooks/usePurifySearchParams";

type TTable = {
  heads: string[];
  body: (string | null)[][];
};

type TTranningHistroyList = {
  record_id: number;
  employee_id: number;
  name: string;
  profile_image: string;
  tranning_name: string;
  created_at: string; // ISO date string
  completed_at: string | null; // ISO date string
  employee_visibility: boolean;
  employee_type: EmployeeType;
};

async function getTranningHistroyList(searchParams: URLSearchParams) {
  return (
    await axios.get(`${BASE_API}/tranning/history?${searchParams.toString()}`)
  ).data;
}

export default function GetTranningActivity() {
  const searchParams = usePurifySearchParams();

  const dispatch = useDispatch();

  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: [
      "Employee",
      "Training Name",
      "Generated On",
      "Completed On",
      "Action",
    ],
    body: [],
  });

  const {
    data: tranningHistoryList,
    error,
    isFetching,
  } = useQuery<ISuccess<TTranningHistroyList[]>>({
    queryKey: ["get-tranning-history", searchParams.toString()],
    queryFn: () => getTranningHistroyList(searchParams),
    onSuccess(data) {
      setTableDatas((preState) => ({
        ...preState,
        body: data.data.map((item) => [
          item.name,
          item.tranning_name,
          beautifyDate(item.created_at),
          item.completed_at
            ? beautifyDate(item.completed_at)
            : item.employee_visibility === true
            ? "WAITING"
            : "NULL",
          "actionBtn",
        ]),
      }));
    },
    refetchOnMount: true,
  });

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-lg text-gray-600 opacity-70">
        Training History
      </h2>

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={tranningHistoryList?.data.length}
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
                                    tranningHistoryList?.data[rowIndex]
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
                              {columnIndex === 2 ? (
                                <div className="flex items-center gap-2 text-green-700">
                                  <IoCheckmarkDoneCircle />
                                  <span>{value}</span>
                                </div>
                              ) : columnIndex === 3 && value === "WAITING" ? (
                                <div className="flex items-center gap-2 text-yellow-600">
                                  <MdOutlinePendingActions />
                                  <span>Waiting</span>
                                </div>
                              ) : columnIndex === 3 && value === "NULL" ? (
                                <div className="flex items-center justify-center">
                                  <Button
                                    onClick={() => {
                                      dispatch(
                                        setDialog({
                                          dialogId: tranningHistoryList?.data[
                                            rowIndex
                                          ]?.tranning_name as any,
                                          type: "OPEN",
                                          extraValue: {
                                            employee_id:
                                              tranningHistoryList?.data[
                                                rowIndex
                                              ]?.employee_id,
                                            btn_type: "Accepte",
                                            employee_type:
                                              tranningHistoryList?.data[
                                                rowIndex
                                              ]?.employee_type,
                                          },
                                        })
                                      );
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <IoOpenOutline />
                                    View & Complete
                                  </Button>
                                </div>
                              ) : value === "actionBtn" ? (
                                <Link
                                  href={`${BASE_API}/tranning/render-form/${tranningHistoryList?.data[rowIndex]?.record_id}`}
                                  target="__blank"
                                >
                                  <LuPrinter
                                    className="active:scale-90"
                                    size={16}
                                  />
                                </Link>
                              ) : (
                                <div className="flex items-center gap-2 text-green-700">
                                  <IoCheckmarkDoneCircle />
                                  <span>{value}</span>
                                </div>
                              )}
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

      <Pagination dataLength={tranningHistoryList?.data.length} />
    </div>
  );
}
