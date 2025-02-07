import React, { useState } from "react";
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
import { ILeave, ISuccess, TEmployeeLeave, TLeaveDetails } from "@/types";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { getAuthToken } from "@/app/utils/getAuthToken";


export default function LeaveRequest() {
  const dispatch = useDispatch();

  const [leaves, setLeaves] = useState<TLeaveDetails[]>([]);

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
    refetchOnMount: true,
    onSuccess(data) {
      const leaveArray = [
        {
          type: "cl",
          label: "Casual Leave",
          value: data.data.leave_details[0].cl,
          status: "Remaining",
        },
        {
          type: "sl",
          label: "Sick Leave",
          value: data.data.leave_details[0].sl,
          status: "Remaining",
        },
        {
          type: "el",
          label: "Earned Leave",
          value: data.data.leave_details[0].el,
          status: "Remaining",
        },
      ];

      if (data.data.leave_details[0]?.ml !== null) {
        leaveArray.push({
          type: "ml",
          label: "Maternity Leave",
          value: data.data.leave_details[0].ml,
          status: "Remaining",
        });
      }

      setLeaves(leaveArray);
    },
  });

  const maxValue = 10;

  const getColor = (type: string, value: number) => {
    if (value <= 2) {
      return "bg-red-500";
    } else {
      return "bg-green-500";
    }

    // switch (type) {
    //   case "casual":
    //     return "bg-green-500";
    //   case "sick":
    //     return "bg-red-500";
    //   case "earn":
    //     return "bg-yellow-500";
    //   default:
    //     return "bg-gray-500";
    // }
  };

  return (
    <>
      <InfoLayout>
        <div className="relative pb-6 space-y-5">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500">
              Pending Leave Requests
            </h2>
            {/* <ul className="flex items-center justify-center gap-4 flex-wrap">
              <li className="text-sm card-shdow border p-2">
                <MdOutlinePendingActions />
                <p>{leaveData?.data.leave_details[0]?.cl}</p>
                <p className="font-semibold">Casual Leave</p>
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
            </ul> */}

            <div className="bg-white rounded-lg shadow-md flex items-start p-4 *:basis-80 *:flex-grow flex-wrap gap-10">
              {leaves.map((leaf) => (
                <div key={leaf.type} className="mb-5 last:mb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-gray-800">
                      <span>{leaf.value.toString().padStart(2, "0")}</span>
                      <span className="text-xs font-light ml-1">Days</span>
                    </span>
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-700">
                        {leaf.label}
                      </h3>
                      <span className="text-sm text-gray-500 capitalize">
                        {leaf.status}
                      </span>
                    </div>
                    <div className="w-8"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getColor(
                        leaf.type,
                        leaf.value
                      )} transition-all duration-500`}
                      style={{ width: `${(leaf.value / maxValue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <h2 className="text-sm font-semibold text-gray-500">
              Leave Requests History
            </h2>
            <Button
              onClick={() =>
                dispatch(
                  setDialog({
                    dialogId: "add-leave-request",
                    type: "OPEN",
                    extraValue: {
                      leave_details: leaves,
                    },
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
