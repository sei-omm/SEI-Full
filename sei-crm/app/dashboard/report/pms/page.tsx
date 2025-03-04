"use client";

import { BASE_API } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { stickyFirstCol } from "@/app/utils/stickyFirstCol";
import DateDurationFilter from "@/components/DateDurationFilter";
import DropDown from "@/components/DropDown";
import GenarateExcelReportBtn from "@/components/GenarateExcelReportBtn";
import HandleSuspence from "@/components/HandleSuspence";
import Pagination from "@/components/Pagination";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { IError, ISuccess, TPlannedMaintenanceSystem } from "@/types";
import axios, { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";

type TTable = {
  heads: string[];
  body: (string | number)[][];
};

export default function PmsReport() {
  const searchParams = useSearchParams();

  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: [
      "ITEM NAME",
      "CHECKS / MAINTENANCE REQUIRED",
      "FREQUENCY",
      "LAST DONE DATE",
      "NEXT DUE",
      "REMARK",
    ],
    body: [],
  });

  const dispatch = useDispatch();

  const {
    data: report,
    error,
    isFetching,
  } = useQuery<ISuccess<TPlannedMaintenanceSystem[]>, AxiosError<IError>>(
    ["get-receipt-report", searchParams.toString()],
    async () =>
      (await axios.get(`${BASE_API}/report/pms?${searchParams.toString()}`))
        .data,
    {
      onSuccess: (data) => {
        setTableDatas((preState) => ({
          ...preState,
          body: data.data.map((item) => [
            item.item_name,
            item.description,
            item.frequency,
            beautifyDate(item.last_done),
            beautifyDate(item.next_due),
            item.remark,
          ]),
        }));
      },
      enabled: searchParams.size != 0,
      cacheTime: 0,
    }
  );

  return (
    <div className="space-y-10">
      <DateDurationFilter>
        <DropDown
          name="filter_by"
          label="Filter By"
          options={[
            {
              text: "Last Done Date",
              value: "last_done",
            },
            {
              text: "Next Due Date",
              value: "next_due",
            },
          ]}
          defaultValue={searchParams.get("filter_by") || "last_done"}
        />
      </DateDurationFilter>
      <div className="flex items-center justify-end">
        <GenarateExcelReportBtn
          apiPath={`/report/pms/excel?${searchParams.toString()}`}
        />
      </div>

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={report?.data.length}
        noDataMsg="No Record Found"
      >
        <div className="w-full overflow-hidden card-shdow">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
            <table className="min-w-max w-full table-auto">
              <thead className="uppercase w-full border-b border-gray-100">
                <tr>
                  {tableDatas.heads.map((item, headIndex) => (
                    <th
                      className={`text-left text-[14px] font-semibold pb-2 px-5 py-4 ${stickyFirstCol(
                        headIndex
                      )}`}
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
                        className={`text-center text-[14px] py-3 px-5 space-x-3 relative max-w-52 ${stickyFirstCol(
                          columnIndex
                        )}`}
                        key={`${rowIndex}${columnIndex}`}
                      >
                        {columnIndex === 1 ? (
                          <div className="flex items-center gap-2 line-clamp-1">
                            {value.toString().slice(0, 30)}..
                            <MdOutlineRemoveRedEye
                              onClick={() => {
                                dispatch(
                                  setDialog({
                                    type: "OPEN",
                                    dialogId: "view-requirement-details",
                                    extraValue: {
                                      text: value,
                                    },
                                  })
                                );
                              }}
                              className="cursor-pointer"
                              size={16}
                            />
                          </div>
                        ) : (
                          value
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
