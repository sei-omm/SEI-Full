"use client";

import { useState } from "react";
import Pagination from "../Pagination";
import TagsBtn from "../TagsBtn";
import Image from "next/image";
import { InfoLayout } from "./InfoLayout";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import HandleSuspence from "../HandleSuspence";
import { ILeave, ISuccess } from "@/types";
import { stickyFirstCol } from "@/app/utils/stickyFirstCol";
import LeaveActionButtons from "../LeaveActionButtons";

type TTable = {
  head: string[];
  body: (string | null)[][];
};

interface IOtherLeave extends ILeave {
  row_id: number;
}

async function getOthersList() {
  return (await axios.get(`${BASE_API}/hr/leave/other`)).data;
}

export default function OtherLeaves() {
  const [leaveTable, setLeaveTable] = useState<TTable>({
    head: ["Name", "Leave From", "Leave To", "Description", "Status", "Action"],
    body: [],
  });

  const { data, isFetching, error } = useQuery<ISuccess<IOtherLeave[]>>({
    queryKey: ["other-leaves"],
    queryFn: getOthersList,
    onSuccess(data) {
      setLeaveTable((preState) => ({
        ...preState,
        body: data.data.map((item) => [
          item.employee_name,
          item.leave_from,
          item.leave_to,
          item.leave_reason,
          item.leave_status,
          "actionBtn",
        ]),
      }));
    },
    refetchOnMount: true,
  });

  return (
    <InfoLayout className="space-y-4">
      <h2 className="text-xl font-semibold">Others Leave Request</h2>
      <HandleSuspence
        isLoading={isFetching}
        noDataMsg="No Leave Request"
        dataLength={data?.data.length}
        error={error}
      >
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black card-shdow rounded-xl">
          <table className="min-w-max w-full table-auto">
            <thead className="uppercase w-full border-b border-gray-100">
              <tr>
                {leaveTable.head.map((item, index) => (
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
              {leaveTable.body.map((itemArray, parentIndex) => (
                <tr
                  key={parentIndex}
                  className="hover:bg-gray-100 group/bodyitem"
                >
                  {itemArray.map((value, childItemIndex) => (
                    <td
                      className={`text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52 ${stickyFirstCol(
                        childItemIndex
                      )}`}
                      key={value}
                    >
                      <span className="line-clamp-1 inline-flex gap-x-3">
                        {value === "actionBtn" ? (
                          <LeaveActionButtons
                            leaveINFO={data?.data[parentIndex]}
                          />
                        ) : childItemIndex === 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="size-10 bg-gray-200 overflow-hidden rounded-full">
                              <Image
                                className="size-full object-cover"
                                src={
                                  data?.data[parentIndex]
                                    ?.employee_profile_image || ""
                                }
                                alt="Employee Image"
                                height={90}
                                width={90}
                                quality={100}
                              />
                            </div>
                            {value}
                          </div>
                        ) : value === "success" ? (
                          <TagsBtn type="SUCCESS">Approve</TagsBtn>
                        ) : value === "decline" ? (
                          <TagsBtn type="FAILED">Decline</TagsBtn>
                        ) : value === "pending" ? (
                          <TagsBtn type="PENDING">Pending</TagsBtn>
                        ) : childItemIndex === 1 || childItemIndex === 2 ? (
                          new Date(value || "").toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        ) : (
                          value
                        )}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HandleSuspence>

      <Pagination dataLength={leaveTable.body.length} />
    </InfoLayout>
  );
}
