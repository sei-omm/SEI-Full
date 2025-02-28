"use client";

import { BASE_API } from "@/app/constant";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { getDate } from "@/app/utils/getDate";
import { stickyFirstCol } from "@/app/utils/stickyFirstCol";
import HandleSuspence from "@/components/HandleSuspence";
import Pagination from "@/components/Pagination";
import MultiPlannedMaintenanceSystem from "@/components/SingleLineForms/MultiPlannedMaintenanceSystem";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { ISuccess, TPlannedMaintenanceSystem, TPmsFrequency } from "@/types";
import { axiosQuery } from "@/utils/axiosQuery";
import { getNextDueDate } from "@/utils/getNextDueDate";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { MdOutlineHistory, MdOutlineRemoveRedEye } from "react-icons/md";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

type TTable = {
  heads: string[];
  body: (string | number)[][];
};

export default function PlannedMaintenanceSystem() {
  const [dateAndId, setDateAndId] = useState<{
    date: string;
    pms_id: number;
    frequency: TPmsFrequency;
  }>({
    date: "",
    pms_id: 0,
    frequency: "Daily",
  });
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

  const dispatch = useDispatch();

  const { data, isFetching, error, refetch } = useQuery<
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

  const handleLastDoneDateChange = (
    date: string,
    pms_id: number,
    frequency: TPmsFrequency
  ) => {
    setDateAndId({
      date,
      pms_id,
      frequency,
    });
  };

  const { openDialog, closeDialog } = useLoadingDialog();

  const handleLastDoneChangeBlur = async () => {
    if (
      getNextDueDate(dateAndId.date, dateAndId.frequency).toString() ===
      "Invalid Date"
    )
      return;

    if (!confirm("Are you sure you want to update the last done date ?"))
      return;

    openDialog();
    const { error } = await axiosQuery({
      url: `${BASE_API}/inventory/planned-maintenance-system/${dateAndId.pms_id}`,
      method: "patch",
      data: {
        last_done: dateAndId.date,
        next_due: getNextDueDate(dateAndId.date, dateAndId.frequency),
      },
    });

    closeDialog();
    if (error) {
      return toast.error("Something went wrong while updating last done date");
    }

    toast.success("Last Done Date Successfully Changed");
    refetch();
  };

  const handleDeleteItem = async (pmsItemId: number) => {
    if (!confirm("Are you sure you want to delete this? Doing so will remove the entire PMS record.")) return;

    openDialog();
    const { error } = await axiosQuery({
      url: `${BASE_API}/inventory/planned-maintenance-system/${pmsItemId}`,
      method: "delete",
    });

    closeDialog();
    if (error) {
      return toast.error("Something went wrong while deleting");
    }

    toast.success("Record Successfully Removed");
    refetch();
  };

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
                        key={value}
                      >
                        {value === "actionBtn" ? (
                          <div className="flex items-center gap-3">
                            <MdOutlineHistory
                              onClick={() =>
                                dispatch(
                                  setDialog({
                                    type: "OPEN",
                                    dialogId: "view-pms-history",
                                    extraValue: {
                                      item_name: data?.data[rowIndex].item_name,
                                      planned_maintenance_system_id:
                                        data?.data[rowIndex]
                                          .planned_maintenance_system_id,
                                    },
                                  })
                                )
                              }
                              title="View History"
                              size={18}
                              className="cursor-pointer active:scale-90"
                            />

                            <AiOutlineDelete
                              size={16}
                              className="cursor-pointer"
                              onClick={() =>
                                handleDeleteItem(
                                  data?.data[rowIndex]
                                    ?.planned_maintenance_system_id as any
                                )
                              }
                            />
                          </div>
                        ) : columnIndex === 3 || columnIndex === 4 ? (
                          <span className="text-gray-500 flex items-center gap-2">
                            {columnIndex === 3 ? (
                              <>
                                <input
                                  min={getDate(new Date(value))}
                                  onBlur={handleLastDoneChangeBlur}
                                  onChange={(e) =>
                                    handleLastDoneDateChange(
                                      e.currentTarget.value,
                                      // data?.data[rowIndex]
                                      //   ?.pms_history_id as any,
                                      data?.data[rowIndex]?.planned_maintenance_system_id as any,
                                      data?.data[rowIndex]
                                        .frequency as TPmsFrequency
                                    )
                                  }
                                  className="bg-transparent cursor-pointer"
                                  type="date"
                                  defaultValue={getDate(new Date(value))}
                                />
                              </>
                            ) : (
                              beautifyDate(value.toString())
                            )}
                          </span>
                        ) : columnIndex === 1 ? (
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
      <Pagination dataLength={data?.data.length} />
    </div>
  );
}
