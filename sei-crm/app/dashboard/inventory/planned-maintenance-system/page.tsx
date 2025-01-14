"use client";

import { BASE_API } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import HandleSuspence from "@/components/HandleSuspence";
import Pagination from "@/components/Pagination";
import MultiPlannedMaintenanceSystem from "@/components/SingleLineForms/MultiPlannedMaintenanceSystem";
import { ISuccess, TPlannedMaintenanceSystem } from "@/types";
import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CiEdit } from "react-icons/ci";
import { useQuery } from "react-query";
type TTable = {
  heads: string[];
  body: (string | number)[][];
};
export default function PlannedMaintenanceSystem() {
  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: [
      "ITEM NAME",
      "CHECKS / MAINTENANCE REQUIRED",
      "FREQUENCY",
      "LAST DONE",
      "NEXT DUE",
      "REMARKS",
      "ACTION",
    ],
    body: [],
  });
  const searchParams = useSearchParams();

  const { data, isFetching, error } = useQuery<
    ISuccess<TPlannedMaintenanceSystem[]>
  >({
    queryKey: ["get-planned-maintenance-system", searchParams.toString()],
    queryFn: async () =>
      (
        await axios.get(
          BASE_API +
            "/inventory/planned-maintenance-system?" +
            searchParams.toString()
        )
      ).data,
    onSuccess: (data) => {
      setTableDatas({
        ...tableDatas,
        body: data?.data?.map((item) => [
          item.item_name,
          item.description,
          item.frequency,
          item.last_done,
          item.next_due,
          item.remark,
          "actionBtn",
        ]),
      });
    },

    refetchOnMount: true,
  });

  return (
    <div className="space-y-5">
      {/* <div className="flex items-center justify-end gap-6">
        <Link href={"/dashboard/inventory/planned-maintenance-system/add"}>
          <Button className="flex-center gap-3">
            <IoIosAdd size={18} />
            Add New Record
          </Button>
        </Link>
      </div> */}
      <MultiPlannedMaintenanceSystem />

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={data?.data.length}
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
                        className="text-center text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                        key={value}
                      >
                        {value === "actionBtn" ? (
                          <div className="flex items-center gap-3">
                            <Link
                              className="active:scale-90"
                              href={`/dashboard/inventory/planned-maintenance-system/${data?.data[rowIndex].planned_maintenance_system_id}`}
                            >
                              <CiEdit className="cursor-pointer" size={18} />
                            </Link>
                          </div>
                        ) : columnIndex === 3 || columnIndex === 4 ? (
                          <span className="text-gray-500">
                            {beautifyDate(value.toString())}
                          </span>
                        ) : columnIndex === 1 ? (
                          <div className="flex flex-col gap-1">
                            {value
                              .toString()
                              .split("\n")
                              .slice(0, 2)
                              .map((item, index) => (
                                <p key={index}>{item}</p>
                              ))}
                            ...
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
      <Pagination dataLength={data?.data.length} />
    </div>
  );
}
