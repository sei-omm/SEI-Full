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
import { ILeave, ISuccess, TEmployeeLeave } from "@/types";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { getAuthToken } from "@/app/utils/getAuthToken";
import { FaCircleNotch } from "react-icons/fa6";

export default function LeaveRequest() {
  const dispatch = useDispatch();

  const {
    data: leaveData,
    isFetching,
    error,
  } = useQuery<
    ISuccess<{ leave_request_list: ILeave[]; leave_details: TEmployeeLeave[] }>
  >({
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
                    extraValue : {
                      leave_details : leaveData?.data.leave_details
                    }
                  })
                )
              }
              className="absolute right-0 top-0 flex-center gap-2"
            >
              <IoIosAdd size={15} />
              Add Leave Request
            </Button>
          </div>

          <ul className="flex items-center justify-center gap-4 flex-wrap">
            <li className="flex items-center  gap-2 text-sm">
              <FaCircleNotch />
              <span>
                <span className="font-semibold">Casual Leave</span> :{" "}
                {leaveData?.data.leave_details[0]?.cl}
              </span>
            </li>
            <li className="flex items-center  gap-2 text-sm">
              <FaCircleNotch />
              <span>
                <span className="font-semibold">Sick Leave</span> :{" "}
                {leaveData?.data.leave_details[0]?.sl}
              </span>
            </li>
            <li className="flex items-center  gap-2 text-sm">
              <FaCircleNotch />
              <span>
                <span className="font-semibold">Earned Leave</span> :{" "}
                {leaveData?.data.leave_details[0]?.el}
              </span>
            </li>
            <li className="flex items-center  gap-2 text-sm">
              <FaCircleNotch />
              <span>
                <span className="font-semibold">Maternity Leave</span> :{" "}
                {leaveData?.data.leave_details[0]?.ml}
              </span>
            </li>
          </ul>

          <HandleSuspence
            noDataMsg="No Leave Request Avilable"
            isLoading={isFetching}
            dataLength={leaveData?.data.leave_request_list.length}
            error={error}
          >
            <ul className="space-y-5">
              {leaveData?.data?.leave_request_list?.map((leave) => (
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
