import React from "react";
import { InfoLayout } from "./InfoLayout";
import Button from "../Button";
import { IoIosAdd } from "react-icons/io";
import { CiCalendarDate } from "react-icons/ci";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import HandleSuspence from "../HandleSuspence";
import { ILeave, ISuccess } from "@/types";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { getAuthToken } from "@/app/utils/getAuthToken";

export default function LeaveRequest() {
  const dispatch = useDispatch();

  const {
    data: leaveRequest,
    isFetching,
    error,
  } = useQuery<ISuccess<ILeave[]>>({
    queryKey: ["employee-leave-request"],
    queryFn: async () =>
      (
        await axios.get(`${BASE_API}/employee/leave`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthToken(),
          },
        })
      ).data,
  });

  return (
    <>
      <InfoLayout>
        <div className="relative pb-6 space-y-5">
          <div>
            <h2 className="text-2xl font-semibold">Leave Requests</h2>
            <Button
              onClick={() =>
                dispatch(
                  setDialog({
                    dialogId: "add-leave-request",
                    type: "OPEN",
                  })
                )
              }
              className="absolute right-0 top-0 flex-center gap-2"
            >
              <IoIosAdd size={15} />
              Add Leave Request
            </Button>
          </div>

          <HandleSuspence
            isLoading={isFetching}
            dataLength={leaveRequest?.data.length}
            error={error}
          >
            <ul className="space-y-5">
              {leaveRequest?.data?.map((leave) => (
                <li
                  key={leave.id}
                  className="space-y-1 relative border-b-2 pb-5"
                >
                  <h3 className="text-sm font-semibold">
                    Leave Request{" "}
                    <span
                      className={`${
                        leave.leave_status === "pending"
                          ? "text-yellow-600"
                          : leave.leave_status === "success"
                          ? "text-green-600"
                          : "text-red-600"
                      } font-semibold`}
                    >
                      {leave.leave_status === "pending"
                        ? "Pending"
                        : leave.leave_status === "success"
                        ? "Approved"
                        : "Decline"}
                    </span>
                  </h3>
                  <h4 className="text-xs text-gray-500">
                    {leave.leave_reason}
                  </h4>
                  <ul className="flex items-center gap-3 flex-wrap">
                    <li className="flex items-center gap-1 text-xs">
                      <CiCalendarDate size={15} />
                      <span className="font-semibold">From :</span>
                      <span>{beautifyDate(leave.leave_from)}</span>
                    </li>
                    <li className="flex items-center gap-1 text-xs">
                      <CiCalendarDate size={15} />
                      <span className="font-semibold">To :</span>
                      <span>{beautifyDate(leave.leave_to)}</span>
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
          </HandleSuspence>
        </div>
      </InfoLayout>
    </>
  );
}
