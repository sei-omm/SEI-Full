import React, { useState } from "react";
import DialogBody from "./DialogBody";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { ISuccess } from "@/types";
import HandleSuspence from "../HandleSuspence";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { AiOutlineDelete } from "react-icons/ai";
import { axiosQuery } from "@/utils/axiosQuery";
import { toast } from "react-toastify";
import Spinner from "../Spinner";

type TPMShistory = {
  pms_history_id: number;
  last_done: string;
  next_due: string;
  remark: string;
};

type TTable = {
  head: string[];
  body: string[][];
};

export default function ViewPmsHistoryDialog() {
  const { extraValue } = useSelector((state: RootState) => state.dialogs);
  const { planned_maintenance_system_id, item_name } = extraValue;
  const [currentPage, setCurrentPage] = useState(1);

  const [tableDatas, setTableDatas] = useState<TTable>({
    head: ["Last Done Date", "Next Due Date", "Remark", "Action"],
    body: [],
  });

  const { data, error, isFetching, refetch } = useQuery<ISuccess<TPMShistory[]>>({
    queryKey: ["get-pms-history", currentPage],
    queryFn: async () =>
      (
        await axios.get(
          `${BASE_API}/inventory/planned-maintenance-system/history/${planned_maintenance_system_id}?page=${currentPage}`
        )
      ).data,

    onSuccess(data) {
      setTableDatas((preState) => ({
        ...preState,
        body: data.data.map((item) => [
          beautifyDate(item.last_done),
          beautifyDate(item.next_due),
          item.remark,
          "actionBtn",
        ]),
      }));
    },
    refetchOnMount: true,
  });

  const [deletingRowIndex, setDeletingRowIndex] = useState(-1);

  const handlePmsHistoryDelete = async (
    pmsHistoryId: number,
    rowIndex: number
  ) => {
    if (
      !confirm(
        "Are you sure you want to delete this history ?"
      )
    )
      return;

    setDeletingRowIndex(rowIndex);
    const { error } = await axiosQuery({
      url: `${BASE_API}/inventory/planned-maintenance-system/history/${pmsHistoryId}`,
      method: "delete",
    });

    // closeDialog();
    setDeletingRowIndex(-1);
    if (error) {
      return toast.error("Something went wrong while deleting");
    }

    toast.success("Record Successfully Removed");
    refetch();
  };

  return (
    <DialogBody className="min-w-[60rem] max-h-[90vh] overflow-y-auto">
      <div className="space-y-4">
        <h2 className="font-semibold text-xl">{item_name}</h2>
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
                    {tableDatas.head.map((item) => (
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
                      {itemArray.map((value) => (
                        <td
                          className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                          key={value}
                        >
                          {value === "actionBtn" ? (
                            <>
                              {deletingRowIndex === rowIndex ? (
                                <Spinner size="15px"/>
                              ) : (
                                <AiOutlineDelete
                                  onClick={() =>
                                    handlePmsHistoryDelete(
                                      data?.data[rowIndex].pms_history_id || 0,
                                      rowIndex
                                    )
                                  }
                                  size={16}
                                  className="active:scale-90 cursor-pointer"
                                />
                              )}
                            </>
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

        <div className="flex text-center gap-2 p-3 *:cursor-pointer">
          <GrFormPrevious
            onClick={() => {
              if (currentPage === 1) return;
              setCurrentPage(currentPage - 1);
            }}
            className={`${currentPage === 1 ? "opacity-50" : "opacity-100"}`}
          />
          <GrFormNext
            onClick={() => {
              if (data?.data.length === 0) return;
              setCurrentPage(currentPage + 1);
            }}
            className={`${
              data?.data.length === 0 ? "opacity-50" : "opacity-100"
            }`}
          />
        </div>
      </div>
    </DialogBody>
  );
}
