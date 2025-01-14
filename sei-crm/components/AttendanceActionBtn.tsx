"use client";

import { setAttendanceStatus } from "@/app/actions/attendanceActions";
import { ChangeEvent, useEffect, useState, useTransition } from "react";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import { toast } from "react-toastify";
import Spinner from "./Spinner";

interface IProps {
  employee_id: number;
  value: string;
  date: string;
}

// type TActions = "Present" | "Absent" | "Half Day" | "Sunday" | "Holiday";

export default function AttendanceActionBtn({
  value,
  employee_id,
  date,
}: IProps) {
  const [isPending, startTransition] = useTransition();
  const { openDialog, closeDialog } = useLoadingDialog();
  const [errorMsg, setErrMsg] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (errorMsg != undefined) {
      toast.error(errorMsg);
    }
  }, [errorMsg]);

  function handleActions(event: ChangeEvent<HTMLSelectElement> | undefined) {
    openDialog();
    startTransition(async () => {
      const respones = await setAttendanceStatus(
        employee_id,
        event?.currentTarget.value as any,
        date
      );
      if (!respones.success) {
        setErrMsg(respones.message);
      }
      closeDialog();
    });
  }

  return (
    // <div className="flex flex-col gap-y-2 group/items">
    //   <span className="hidden">{isPending}</span>
    //   <TagsBtn
    //     onClick={() => handleActions("Present")}
    //     className={`${
    //       value === "Present" ? "flex" : "hidden"
    //     } group-hover/items:flex`}
    //     type="SUCCESS"
    //   >
    //     Present
    //   </TagsBtn>

    //   <TagsBtn
    //     onClick={() => handleActions("Absent")}
    //     className={`${
    //       value === "Absent" ? "flex" : "hidden"
    //     } group-hover/items:flex`}
    //     type="FAILED"
    //   >
    //     Absent
    //   </TagsBtn>

    //   <TagsBtn
    //     onClick={() => handleActions("Sunday")}
    //     className={`${
    //       value === "Sunday" ? "flex" : "hidden"
    //     } group-hover/items:flex`}
    //     type="FAILED"
    //   >
    //     Sunday
    //   </TagsBtn>

    //   <TagsBtn
    //     onClick={() => handleActions("Holiday")}
    //     className={`${
    //       value === "Holiday" ? "flex" : "hidden"
    //     } group-hover/items:flex`}
    //     type="PENDING"
    //   >
    //     Holiday
    //   </TagsBtn>

    //   <TagsBtn
    //     onClick={() => handleActions("Half Day")}
    //     className={`${
    //       value === "Half Day" ? "flex" : "hidden"
    //     } group-hover/items:flex`}
    //     type="FAILED"
    //   >
    //     Half Day
    //   </TagsBtn>

    //   <TagsBtn
    //     className={`${
    //       value === "Pending" ? "flex" : "hidden"
    //     } group-hover/items:hidden`}
    //     type="PENDING"
    //   >
    //     Pending
    //   </TagsBtn>
    // </div>
    <div>
      {isPending ? (
        <Spinner size="20px" />
      ) : (
        <select
          className={`cursor-pointer outline-none font-semibold *:font-semibold ${
            value === "Present"
              ? "text-green-700"
              : value === "Absent" || value === "Sunday" || value === "Holiday"
              ? "text-red-600"
              : value === "Pending"
              ? "text-yellow-600"
              : "text-gray-500"
          }`}
          onChange={handleActions}
        >
          {value === "Not Employed" ? (
            <option selected disabled>
              Not Avilable
            </option>
          ) : (
            <>
              <option
                selected={value === "Pending"}
                className="font-normal"
                disabled
                value={"Pending"}
              >
                Pending
              </option>
              <option
                selected={value === "Present"}
                className="text-green-700"
                value={"Present"}
              >
                Present
              </option>
              <option
                selected={value === "Absent"}
                className="text-red-700"
                value={"Absent"}
              >
                Absent
              </option>
              <option
                selected={value === "Half Day"}
                className="text-yellow-600"
                value={"Half Day"}
              >
                Half Day
              </option>
              <option
                selected={value === "Sunday"}
                className="text-red-700"
                value={"Sunday"}
              >
                Sunday
              </option>
              <option
                selected={value === "Holiday"}
                className="text-red-700"
                value={"Holiday"}
              >
                Holiday
              </option>
            </>
          )}
        </select>
      )}
    </div>
  );
}
