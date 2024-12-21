"use client";

import { setAttendanceStatus } from "@/app/actions/attendanceActions";
import TagsBtn from "./TagsBtn";
import { useEffect, useState, useTransition } from "react";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import { toast } from "react-toastify";

interface IProps {
  employee_id: number;
  value: string;
  date: string;
}

type TActions = "Present" | "Absent" | "Half Day" | "Sunday" | "Holiday";

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

  function handleActions(actionValue: TActions) {
    openDialog();
    startTransition(async () => {
      const respones = await setAttendanceStatus(
        employee_id,
        actionValue,
        date
      );
      if (!respones.success) {
        setErrMsg(respones.message);
      }
      closeDialog();
    });
  }

  return (
    <div className="flex flex-col gap-y-2 group/items">
      <span className="hidden">{isPending}</span>
      <TagsBtn
        onClick={() => handleActions("Present")}
        className={`${
          value === "Present" ? "flex" : "hidden"
        } group-hover/items:flex`}
        type="SUCCESS"
      >
        Present
      </TagsBtn>

      <TagsBtn
        onClick={() => handleActions("Absent")}
        className={`${
          value === "Absent" ? "flex" : "hidden"
        } group-hover/items:flex`}
        type="FAILED"
      >
        Absent
      </TagsBtn>

      <TagsBtn
        onClick={() => handleActions("Sunday")}
        className={`${
          value === "Sunday" ? "flex" : "hidden"
        } group-hover/items:flex`}
        type="FAILED"
      >
        Sunday
      </TagsBtn>

      <TagsBtn
        onClick={() => handleActions("Holiday")}
        className={`${
          value === "Holiday" ? "flex" : "hidden"
        } group-hover/items:flex`}
        type="PENDING"
      >
        Holiday
      </TagsBtn>

      <TagsBtn
        onClick={() => handleActions("Half Day")}
        className={`${
          value === "Half Day" ? "flex" : "hidden"
        } group-hover/items:flex`}
        type="FAILED"
      >
        Half Day
      </TagsBtn>

      <TagsBtn
        className={`${
          value === "Pending" ? "flex" : "hidden"
        } group-hover/items:hidden`}
        type="PENDING"
      >
        Pending
      </TagsBtn>
    </div>
  );
}
