"use client";

import { BASE_API } from "@/app/constant";
import { stickyFirstCol } from "@/app/utils/stickyFirstCol";
import Button from "@/components/Button";
import OccupancyChat from "@/components/ChatView/OccupancyChat";
import DateInput from "@/components/DateInput";
import DropDown from "@/components/DropDown";
import GenarateExcelReportBtn from "@/components/GenarateExcelReportBtn";
import HandleSuspence from "@/components/HandleSuspence";
import Pagination from "@/components/Pagination";
import { IError, ISuccess, TOccupancyReport } from "@/types";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "react-query";

const fetchData = async (
  params: string
): Promise<ISuccess<TOccupancyReport[]>> => {
  const response = await fetch(BASE_API + `/report/occupancy?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch occupancy report");
  }

  return response.json();
};

export default function OccupancyReport() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tableDatas, setTableDatas] = useState<{
    heads: string[];
    body: (string | null)[][];
  }>({
    heads: [
      "Course Name",
      "Course Code",
      "Maximum Batch This Month",
      "Batch Conducted This Month",
      "Candidate Strength",
      "Occupency",
      "% Of Occupency",
      "Executive Name",
      "Fee Collection",
      "Fee Collection After Discount",
    ],
    body: [],
  });

  const {
    data: report,
    error,
    isFetching,
  } = useQuery<ISuccess<TOccupancyReport[]>, AxiosError<IError>>(
    ["fetch-occupancy-report", searchParams.toString()],
    () => fetchData(searchParams.toString()),
    {
      onSuccess(data) {
        const oldTableData = { ...tableDatas };
        oldTableData.body = data.data.map((item) => [
          item.course_name,
          item.course_code,
          item.max_batch_per_month.toString(),
          item.batch_conducted.toString(),
          item.student_capacity.toString(),
          item.occupancy.toString(),
          `${item.occupancy_percentage.toString()}%`,
          item.executive_name,
          item.total_fee_collection.toString(),
          item.after_discount_fee_collection.toString(),
        ]);

        setTableDatas(oldTableData);
      },
      enabled: searchParams.size !== 0,
    }
  );

  function handleFilterSubmit(formData: FormData) {
    const urlSearchParams = new URLSearchParams();

    formData.forEach((value, key) => {
      urlSearchParams.set(key, value.toString());
    });

    router.push(`/dashboard/report/occupancy?${urlSearchParams.toString()}`);
  }

  return (
    <div className="space-y-6">
      <form
        action={handleFilterSubmit}
        className="flex items-end justify-between *:flex-grow gap-4"
      >
        <DropDown
          label="Campus"
          name="institute"
          options={[
            { text: "Kolkata", value: "Kolkata" },
            { text: "Faridabad", value: "Faridabad" },
          ]}
          defaultValue={searchParams.get("institute") || "Kolkata"}
        />
        <DateInput
          required
          label="Start Date"
          name="start_date"
          date={searchParams.get("start_date")}
        />
        <DateInput
          required
          label="End Date"
          name="end_date"
          date={searchParams.get("end_date")}
        />

        <Button type="submit" className="mb-2">
          Search
        </Button>
      </form>

      {report ? <OccupancyChat data={report.data} /> : null}

      <div className="flex justify-end">
        <GenarateExcelReportBtn
          apiPath={`/report/occupancy/excel?${searchParams.toString()}`}
          text="Generate Occupancy Report"
          hidden={searchParams.size === 0}
        />
      </div>

      {/* Total Occupancy Info  */}
      {/* <ul className="flex items-center justify-center gap-4 flex-wrap">
        <li className="card-shdow flex items-center gap-4 p-3">
          <BiCollection />
          <span className="font-semibold">
            Total Occupency : <span className="font-normal">30</span>
          </span>
        </li>
        <li className="card-shdow flex items-center gap-4 p-3">
          <BiCollection />
          <span className="font-semibold">
            Total Fee Collection : <span className="font-normal">30</span>
          </span>
        </li>
        <li className="card-shdow flex items-center gap-4 p-3">
          <BiCollection />
          <span className="font-semibold">
            Total Fee Collection After Discount :{" "}
            <span className="font-normal">30</span>
          </span>
        </li>
      </ul> */}

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={tableDatas.body.length}
      >
        <div className="w-full overflow-hidden card-shdow">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
            <table className="min-w-max w-full table-auto">
              <thead className="uppercase w-full border-b border-gray-100">
                <tr>
                  {tableDatas.heads.map((item, index) => (
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
                {tableDatas.body.map((itemArray, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-100 group/bodyitem"
                  >
                    {itemArray.map((value, colIndex) => (
                      <td
                        className={`text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52 ${stickyFirstCol(
                          colIndex
                        )}`}
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
