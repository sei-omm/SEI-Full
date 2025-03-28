"use client";

import { BASE_API, TIME_PERIOD } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { stickyFirstCol } from "@/app/utils/stickyFirstCol";
import BackBtn from "@/components/BackBtn";
import Button from "@/components/Button";
import Campus from "@/components/Campus";
import DateInput from "@/components/DateInput";
import GenarateExcelReportBtn from "@/components/GenarateExcelReportBtn";
import HandleSuspence from "@/components/HandleSuspence";
import Pagination from "@/components/Pagination";
import { usePurifySearchParams } from "@/hooks/usePurifySearchParams";
import { ISuccess, TVirtualTable } from "@/types";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useQuery } from "react-query";

async function getTimeTableReport(searchParams: URLSearchParams) {
  return (
    await axios.get(`${BASE_API}/report/time-table?${searchParams.toString()}`)
  ).data;
}

type TTimeTableReport = {
  date: string;
  time_table_data: string;
  total_rows: number;
  institute: string;
};

type TFinalData = {
  date: string;
  table: {
    head: string[];
    body: string[][];
  };
};

export default function Report() {
  const searchParams = usePurifySearchParams();
  const route = useRouter();

  const [finalData, setFinalData] = useState<TFinalData[]>([]);
  // const [parseTimeTableData, setParaseTimeTableData] = useState<
  //   TTimeTableParseData2[][]
  // >([]);

  const handleTimeTableGeneratorBtn = (formData: FormData) => {
    const urlSearchParams = new URLSearchParams();
    formData.forEach((value, key) => {
      urlSearchParams.set(key, value.toString());
    });
    route.push(`/time-table/report?${urlSearchParams.toString()}`);
  };

  const prevData = [...finalData];
  const { data, error, isFetching } = useQuery<ISuccess<TTimeTableReport[]>>({
    queryKey: ["get-time-table-report", searchParams.toString()],
    queryFn: () => getTimeTableReport(searchParams),
    onSuccess(data) {
      data.data.map((item) => {
        const parseData = JSON.parse(item.time_table_data) as TVirtualTable;
        const array = new Array(item.total_rows).fill(1);
        prevData.push({
          date: item.date,
          table: {
            head: ["COURSE NAME", ...TIME_PERIOD],
            body: array.map((_, rowIndex) => [
              parseData[`${rowIndex}:${0}`]?.course_name,
              ...[0, 1, 2, 3, 4, 5, 6, 7].map((colIndex) => {
                const cell = parseData[`${rowIndex}:${colIndex}`];
                return (
                  cell?.subject +
                  "<?>" +
                  cell.fac?.faculty_name +
                  "<?>" +
                  cell.fac?.profile_image
                );
              }),
            ]),
          },
        });
      });

      setFinalData(prevData);
    },

    enabled: searchParams.size > 1,
  });

  return (
    <div>
      <section className="h-screen w-full p-8 space-y-6">
        <div className="flex items-end justify-between">
          <form
            action={handleTimeTableGeneratorBtn}
            className="flex items-end gap-3"
          >
            <Campus />
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
            {finalData.map((item) => (
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
                                <div className="w-full bg-[#D6CEFF] py-3 px-3 rounded-md relative overflow-hidden group/edit flex items-center">
                                  <div className="size-8 border border-white rounded-full overflow-hidden">
                                    <Image
                                      className="size-full object-cover"
                                      src={
                                        value.split("<?>")[2] !== "undefined"
                                          ? value.split("<?>")[2]
                                          : "/placeholder_image.jpg"
                                      }
                                      alt="Faculty Image"
                                      height={32}
                                      width={32}
                                      quality={100}
                                    />
                                  </div>
                                  <div className="flex flex-col px-3">
                                    <h2>{value.split("<?>")[0]}</h2>
                                    <h3>
                                      {value.split("<?>")[1] !== "undefined"
                                        ? value.split("<?>")[1]
                                        : ""}
                                    </h3>
                                  </div>
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
              </li>
            ))}
          </ul>
        </HandleSuspence>

        <div className="pb-3 flex items-center justify-between">
          <BackBtn btnText="Back To Dashboard" customRoute="/dashboard" />
          <Pagination className="!w-auto" dataLength={data?.data.length} />
        </div>
      </section>
    </div>
  );
}
