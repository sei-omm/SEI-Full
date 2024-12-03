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

export default function AttendanceActionBtn({
  value,
  employee_id,
  date,
}: IProps) {
  const [isPending, startTransition] = useTransition();
  const { openDialog, closeDialog } = useLoadingDialog();
  const [errorMsg, setErrMsg] = useState<string | undefined>(undefined);

  const handleSuccess = () => {
    openDialog();
    startTransition(async () => {
      const response = await setAttendanceStatus(employee_id, "Present", date);
      if (!response.success) {
        setErrMsg(response.message);
      }
      closeDialog();
    });
  };

  function handleAbsentButton() {
    openDialog();
    startTransition(async () => {
      const respones = await setAttendanceStatus(employee_id, "Absent", date);
      if (!respones.success) {
        setErrMsg(respones.message);
      }
      closeDialog();
    });
  }

  useEffect(() => {
    if (errorMsg != undefined) {
      toast.error(errorMsg);
    }
  }, [errorMsg]);

  return (
    <div className="flex flex-col gap-y-2 group/items">
      <span className="hidden">{isPending}</span>
      <TagsBtn
        onClick={handleSuccess}
        className={`${
          value === "Present" ? "flex" : "hidden"
        } group-hover/items:flex`}
        
        type="SUCCESS"
      >
        Present
      </TagsBtn>

      <TagsBtn
        onClick={handleAbsentButton}
        className={`${
          value === "Absent" ? "flex" : "hidden"
        } group-hover/items:flex`}
        type="FAILED"
      >
        Absent
      </TagsBtn>

      <TagsBtn
        onClick={handleAbsentButton}
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
