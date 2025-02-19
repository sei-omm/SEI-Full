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

type TPMShistory = {
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
    head: ["Last Done Date", "Next Due Date", "Remark"],
    body: [],
  });

  const { data, error, isFetching } = useQuery<ISuccess<TPMShistory[]>>({
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
        ]),
      }));
    },
    refetchOnMount: true,
  });

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
                          {value}
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
