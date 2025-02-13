"use client";

import { BASE_API } from "@/app/constant";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import { beautifyDate } from "@/app/utils/beautifyDate";
import DateDurationFilter from "@/components/DateDurationFilter";
import GenarateExcelReportBtn from "@/components/GenarateExcelReportBtn";
import HandleSuspence from "@/components/HandleSuspence";
import MaintenceStatusBtns from "@/components/Inventory/MaintenceStatusBtns";
import Pagination from "@/components/Pagination";
import MultiMaintenceForm from "@/components/SingleLineForms/MultiMaintenceForm";
import { IError, ISuccess, TMaintenanceRecord } from "@/types";
import { axiosQuery } from "@/utils/axiosQuery";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { useQuery } from "react-query";
import { toast } from "react-toastify";

type TTable = {
  heads: string[];
  body: (string | number | null)[][];
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
      "Action",
    ],
    body: [],
  });

  const { isFetching, error, data, refetch } = useQuery<ISuccess<TMaintenanceRecord[]>>({
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
        record.item_name || record.custom_item,
        record.description_of_work,
        record.work_station,
        record.department,
        record.assigned_person,
        record.approved_by,
        record.cost,
        record.status,
        beautifyDate(record.completed_date),
        record.remark,
        "actionBtn",
      ]);

      setTableDatas({ ...tableDatas, body });
    },
    refetchOnMount: true,
  });

  const { closeDialog, openDialog } = useLoadingDialog();

  const handleDelete = async (rowIndex: number) => {
    if(!confirm("Are you sure you want to delete this item ?")) return;

    openDialog();
    const recordId = data?.data[rowIndex].record_id;
    const { error, response } = await axiosQuery<IError, ISuccess>({
      url: `${BASE_API}/inventory/maintence-record/${recordId}`,
      method: "delete",
    });

    closeDialog();
    if (error) return toast.error(error?.message);

    toast.success(response?.message);
    refetch();
  };

  return (
    <div className="space-y-5">
      <DateDurationFilter />

      <MultiMaintenceForm />

      <div className="flex items-center justify-end gap-6">
        <GenarateExcelReportBtn
          hidden={searchParams.size === 0 || tableDatas.body.length === 0}
          apiPath={
            "/inventory/maintence-record/excel?" + searchParams.toString()
          }
        />
        {/* <Link href={"/dashboard/inventory/maintence-record/add"}>
          <Button className="flex-center gap-3">
            <IoIosAdd size={18} />
            Add New Record
          </Button>
        </Link> */}
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
                            <AiOutlineDelete
                              onClick={() => handleDelete(rowIndex)}
                              size={16}
                              className="cursor-pointer active:scale-90"
                            />
                          </div>
                        ) : columnIndex === 8 ? (
                          <MaintenceStatusBtns
                            id={data?.data[rowIndex].record_id || 0}
                            value={value?.toString() || ""}
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
      <Pagination dataLength={data?.data.length} />
    </div>
  );
}
