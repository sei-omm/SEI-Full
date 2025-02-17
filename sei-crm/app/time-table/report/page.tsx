"use client";

import { BASE_API } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { stickyFirstCol } from "@/app/utils/stickyFirstCol";
import BackBtn from "@/components/BackBtn";
import Button from "@/components/Button";
import DateInput from "@/components/DateInput";
import DropDown from "@/components/DropDown";
import GenarateExcelReportBtn from "@/components/GenarateExcelReportBtn";
import HandleSuspence from "@/components/HandleSuspence";
import Pagination from "@/components/Pagination";
import TimeTableReportCell from "@/components/TimeTableReportCell";
import { ISuccess, TTimeTableParseData } from "@/types";
import axios from "axios";
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import React, { useState } from "react";
import { useQuery } from "react-query";

async function getTimeTableReport(searchParams: ReadonlyURLSearchParams) {
  return (
    await axios.get(`${BASE_API}/report/time-table?${searchParams.toString()}`)
  ).data;
}

type TTimeTableReport = {
  date: string;
  time_table_data: string;
  institute: string;
};

type TFinalData = {
  date: string;
  table: {
    head: string[];
    body: string[][];
  };
};

export default function TimeTableReport() {
  const route = useRouter();
  const searchParams = useSearchParams();

  const handleTimeTableGeneratorBtn = (formData: FormData) => {
    const urlSearchParams = new URLSearchParams();
    formData.forEach((value, key) => {
      urlSearchParams.set(key, value.toString());
    });
    route.push(`/time-table/report?${urlSearchParams.toString()}`);
  };

  const [finalData, setFinalData] = useState<TFinalData[]>([]);
  const [parseTimeTableData, setParaseTimeTableData] = useState<
    TTimeTableParseData[][]
  >([]);

  const { data, error, isFetching } = useQuery<ISuccess<TTimeTableReport[]>>({
    queryKey: ["get-time-table-report"],
    queryFn: () => getTimeTableReport(searchParams),
    onSuccess(data) {
      const fData: TFinalData[] = [];
      const parsedData: TTimeTableParseData[][] = [];

      data.data.forEach((item) => {
        const currentPraseData = JSON.parse(
          item.time_table_data
        ) as TTimeTableParseData[];
        parsedData.push(currentPraseData);
        fData.push({
          date: item.date,
          table: {
            head: [
              "Course Name",
              "09:30 am - 10:30 am",
              "10:30 am - 11:30 am",
              "11:45 am - 12:45 pm",
              "01:15 pm - 02:15 pm",
              "02:15 pm - 03:15 pm",
              "03:30 pm - 04:30 pm",
              "04:30 pm - 05:30 pm",
              "05:30 pm - 06:30 pm",
            ],
            body: currentPraseData.map((tableinfo) => [
              tableinfo.course_name,
              ...tableinfo.subjects,
            ]),
          },
        });
      });
      setFinalData(fData);
      setParaseTimeTableData((preState) => [...preState, ...parsedData]);
    },

    enabled: searchParams.size !== 0,
  });

  return (
    <section className="h-screen w-full p-8 space-y-6">
      <div className="flex items-end justify-between">
        <form
          action={handleTimeTableGeneratorBtn}
          className="flex items-end gap-3"
        >
          <DropDown
            name="institute"
            label="Choose Campus *"
            options={[
              {
                text: "Kolkata",
                value: "Kolkata",
              },
              {
                text: "Faridabad",
                value: "Faridabad",
              },
            ]}
            defaultValue={searchParams.get("institute") || "Kolkata"}
          />
          <DateInput
            required
            name="from_date"
            label="Choose From Date *"
            date={searchParams.get("from_date")}
          />
          <DateInput
            required
            name="to_date"
            label="Choose To Date *"
            date={searchParams.get("to_date")}
          />
          <Button className="mb-[0.45rem]">Search</Button>
        </form>

        <GenarateExcelReportBtn
          apiPath={`/report/time-table/excel?${searchParams.toString()}`}
          text="Download Excel Report"
        />
      </div>

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={finalData.length}
      >
        <ul className="space-y-5">
          {finalData.map((item, pLoopIndex) => (
            <li key={item.date} className="space-y-3">
              <h2 className="font-semibold text-xl">
                {beautifyDate(item.date)}
              </h2>

              <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black card-shdow rounded-xl">
                <table className="min-w-max w-full table-auto">
                  <thead className="uppercase w-full border-b border-gray-100">
                    <tr>
                      {item.table.head.map((item, index) => (
                        <th
                          className={`text-left text-[14px] font-semibold pb-2 px-5 py-4 ${stickyFirstCol(
                            index
                          )}`}
                          key={item}
                        >
                          {item}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {item.table.body.map((itemArray, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="hover:bg-gray-100 group/bodyitem"
                      >
                        {itemArray.map((value, columnIndex) => (
                          <td
                            className={`text-left text-[14px] py-3 px-5 space-x-3 relative ${stickyFirstCol(
                              columnIndex
                            )}`}
                            key={`${rowIndex}${columnIndex}`}
                          >
                            {columnIndex !== 0 ? (
                              <TimeTableReportCell
                                parseData={parseTimeTableData[pLoopIndex]}
                                value={value}
                                rowIndex={rowIndex}
                                colIndex={columnIndex}
                              />
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
            </li>
          ))}
        </ul>
      </HandleSuspence>

      <div className="pb-3 flex items-center justify-between">
        <BackBtn btnText="Back To Dashboard" customRoute="/dashboard" />
        <Pagination className="!w-auto" dataLength={data?.data.length} />
      </div>
    </section>
  );
}
