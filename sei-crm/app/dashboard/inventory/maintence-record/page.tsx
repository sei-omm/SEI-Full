"use client";

import { BASE_API } from "@/app/constant";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import { beautifyDate } from "@/app/utils/beautifyDate";
import Button from "@/components/Button";
import DateDurationFilter from "@/components/DateDurationFilter";
import DropDown from "@/components/DropDown";
import GenarateExcelReportBtn from "@/components/GenarateExcelReportBtn";
import HandleSuspence from "@/components/HandleSuspence";
import Pagination from "@/components/Pagination";
import MaintenanceBodyItem from "@/components/SingleLineForms/MaintenanceBodyItem";
import MultiMaintenceForm from "@/components/SingleLineForms/MultiMaintenceForm";
import {
  IError,
  ISuccess,
  TMaintenanceRecord,
  TMultiUpdateMantence,
} from "@/types";
import { axiosQuery } from "@/utils/axiosQuery";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "react-query";
import { toast } from "react-toastify";

type TTable = {
  heads: string[];
  body: (string | number | null)[][];
};

export default function MaintenceRecord() {
  const searchParams = useSearchParams();
  const [currentCampus, setCurrentCampus] = useState("Kolkata");
  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: [
      "MAINTENANCE Date",
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

  // const multiUpdateDataArray = useRef<TMultiUpdateMantence[]>([]);

  const [multiUpdateDataArray, setMultiUpdateDataArray] = useState<
    TMultiUpdateMantence[]
  >([]);

  const { isFetching, error, data, refetch } = useQuery<
    ISuccess<TMaintenanceRecord[]>
  >({
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
        record.completed_date ? beautifyDate(record.completed_date) : "NA",
        record.remark,
        "actionBtn",
      ]);

      setTableDatas({ ...tableDatas, body });
    },
    refetchOnMount: true,
  });

  const { closeDialog, openDialog } = useLoadingDialog();

  const handleDelete = async (record_id: number) => {
    if (!confirm("Are you sure you want to delete this item ?")) return;

    openDialog();
    const { error, response } = await axiosQuery<IError, ISuccess>({
      url: `${BASE_API}/inventory/maintence-record/${record_id}`,
      method: "delete",
    });

    closeDialog();
    if (error) return toast.error(error?.message);

    toast.success(response?.message);
    refetch();
  };

  const handleBulkUpdate = async () => {
    if (!confirm("Are You Sure You Want To Update")) return;
    openDialog();
    const { error, response } = await axiosQuery<IError, ISuccess>({
      url: `${BASE_API}/inventory/maintence-record`,
      method: "put",
      data: multiUpdateDataArray,
    });

    closeDialog();
    if (error) return toast.error(error.message);

    toast.success(response?.message);
    setMultiUpdateDataArray([]);
  };

  return (
    <div className="space-y-5">
      <DateDurationFilter onCampusChange={(campus) => setCurrentCampus(campus)}>
        <DropDown
          name="filter_by"
          label="Filter By"
          options={[
            { text: "Maintenance Date", value: "maintenance_date" },
            { text: "Completed Date", value: "completed_date" },
          ]}
          defaultValue={searchParams.get("filter_by") || "maintenance_date"}
        />
        <DropDown
          name="status"
          label="Choose Status"
          options={[
            { text: "Completed", value: "Completed" },
            { text: "Pending", value: "Pending" },
          ]}
          defaultValue={searchParams.get("status") || "Completed"}
        />
      </DateDurationFilter>

      <MultiMaintenceForm currentCampus={currentCampus} />

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
                {tableDatas.body.map((columnArray, rowIndex) => (
                  <MaintenanceBodyItem
                    key={rowIndex}
                    columnArray={columnArray}
                    multiUpdateDataArray={multiUpdateDataArray}
                    setMultiUpdateDataArray={setMultiUpdateDataArray}
                    onDeleteBtnClick={() => {
                      handleDelete(data?.data[rowIndex].record_id || 0);
                    }}
                    serverData={data?.data[rowIndex]}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </HandleSuspence>
      {multiUpdateDataArray.length > 0 && (
        <div className="flex items-center justify-end">
          <Button onClick={handleBulkUpdate}>Save Edited Records</Button>
        </div>
      )}
      <Pagination dataLength={data?.data.length} />
    </div>
  );
}
