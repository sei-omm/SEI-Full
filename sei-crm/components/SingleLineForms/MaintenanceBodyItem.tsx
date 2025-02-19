import React, { SetStateAction, useState } from "react";
import MaintenceStatusBtns from "../Inventory/MaintenceStatusBtns";
import { AiOutlineDelete } from "react-icons/ai";
import { TMaintenanceRecord, TMultiUpdateMantence } from "@/types";
import { getDate } from "@/app/utils/getDate";

interface IProps {
  columnArray: (string | number | null)[];
  onDeleteBtnClick: () => void;
  multiUpdateDataArray: TMultiUpdateMantence[];
  setMultiUpdateDataArray: React.Dispatch<
    SetStateAction<TMultiUpdateMantence[]>
  >;
  serverData?: TMaintenanceRecord;
}

export default function MaintenanceBodyItem({
  columnArray,
  onDeleteBtnClick,
  multiUpdateDataArray,
  setMultiUpdateDataArray,
  serverData,
}: IProps) {
  const [currentStatus, setCurrentStatus] = useState(serverData?.status || "");

  const [completedDate, setCompletedDate] = useState(
    serverData?.completed_date
      ? serverData.completed_date
      : new Date().toISOString().split("T")[0]
  );

  return (
    <tr className="hover:bg-gray-100 group/bodyitem">
      {columnArray.map((value, columnIndex) => (
        <td
          className="text-center text-[14px] py-3 px-5 space-x-3 relative max-w-52"
          key={`${serverData?.record_id}${columnIndex}`}
        >
          {value === "actionBtn" ? (
            <div className="flex items-center gap-3">
              <AiOutlineDelete
                onClick={onDeleteBtnClick}
                size={16}
                className="cursor-pointer active:scale-90"
              />
            </div>
          ) : columnIndex === 8 ? (
            <MaintenceStatusBtns
              status={currentStatus as any}
              onStatusChange={(status) => {
                const preState = [...multiUpdateDataArray];

                const alreadyExistIndex = preState.findIndex(
                  (item) => item.record_id === (serverData?.record_id || 0)
                );

                if (alreadyExistIndex !== -1) {
                  preState[alreadyExistIndex].status = status;
                } else {
                  preState.push({
                    record_id: serverData?.record_id || 0,
                    status: status,
                    completed_date: completedDate,
                  });
                }
                setMultiUpdateDataArray(preState);
                setCurrentStatus(status);
              }}
            />
          ) : columnIndex === 9 && currentStatus === "Completed" ? (
            <input
              onBlur={() => {
                const preState = [...multiUpdateDataArray];

                const alreadyExistIndex = preState.findIndex(
                  (item) => item.record_id === (serverData?.record_id || 0)
                );

                if (alreadyExistIndex !== -1) {
                  preState[alreadyExistIndex].completed_date = completedDate;
                } else {
                  preState.push({
                    record_id: serverData?.record_id || 0,
                    status: "Completed",
                    completed_date: completedDate,
                  });
                }
                setMultiUpdateDataArray(preState);
              }}
              onChange={(e) => setCompletedDate(e.currentTarget.value)}
              type="date"
              defaultValue={getDate(new Date(completedDate))}
              disabled={serverData?.status === "Completed"}
            />
          ) : (
            value
          )}
        </td>
      ))}
    </tr>
  );
}
