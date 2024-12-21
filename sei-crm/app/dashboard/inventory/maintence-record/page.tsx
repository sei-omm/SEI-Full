"use client";

import { BASE_API } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import Button from "@/components/Button";
import DateDurationFilter from "@/components/DateDurationFilter";
import GenarateExcelReportBtn from "@/components/GenarateExcelReportBtn";
import HandleSuspence from "@/components/HandleSuspence";
import MaintenceStatusBtns from "@/components/Inventory/MaintenceStatusBtns";
import { ISuccess, TMaintenanceRecord } from "@/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CiEdit } from "react-icons/ci";
import { IoIosAdd } from "react-icons/io";
import { useQuery } from "react-query";

type TTable = {
  heads: string[];
  body: (string | number)[][];
};

export default function MaintenceRecord() {
  const searchParams = useSearchParams();
  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: [
      "Maintence Date",
      "Item Name",
      "Description of Work",
      "Work Station",
      "Department",
      "Assigned Personnel/Contractor",
      "Approved by",
      "Cost (Approx)",
      "Status",
      "Complete Date",
      "Remarks",
    ],
    body: [],
  });

  const { isFetching, error, data } = useQuery<ISuccess<TMaintenanceRecord[]>>({
    queryKey: ["maintence-record", searchParams.toString()],
    queryFn: async () => {
      const res = await fetch(
        BASE_API + "/inventory/maintence-record?" + searchParams.toString()
      );
      return res.json();
    },
    onSuccess(data) {
      const body = data.data.map((record) => [
        beautifyDate(record.maintence_date),
        record.item_name,
        record.description_of_work,
        record.work_station,
        record.department,
        record.assigned_person,
        record.approved_by,
        record.cost,
        record.status,
        beautifyDate(record.completed_date),
        record.remark,
      ]);

      setTableDatas({ ...tableDatas, body });
    },
    refetchOnMount: true,
  });

  return (
    <div className="space-y-5">
      <DateDurationFilter />

      <div className="flex items-center justify-end gap-6">
        <GenarateExcelReportBtn
          hidden={tableDatas.body.length === 0}
          apiPath={
            "/inventory/maintence-record/excel?" + searchParams.toString()
          }
        />
        <Link href={"/dashboard/inventory/maintence-record/add"}>
          <Button className="flex-center gap-3">
            <IoIosAdd size={18} />
            Add New Record
          </Button>
        </Link>
      </div>

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
                              href={`/dashboard/inventory/consumable/`}
                            >
                              <CiEdit className="cursor-pointer" size={18} />
                            </Link>
                          </div>
                        ) : columnIndex === 8 ? (
                          <MaintenceStatusBtns
                            id={data?.data[rowIndex].record_id || 0}
                            value={value.toString()}
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
        </div>
      </HandleSuspence>
    </div>
  );
}
