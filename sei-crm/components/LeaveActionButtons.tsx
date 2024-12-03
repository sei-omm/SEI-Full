"use client";

import { MdClose, MdDone } from "react-icons/md";
import { setStatus } from "@/app/actions/leaveActions";
import { useEffect, useState, useTransition } from "react";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import { toast } from "react-toastify";
// import { AxiosError } from "axios";
import { ILeave } from "@/types";

interface IProps {
  leaveINFO : ILeave
}

export default function LeaveActionButtons({ leaveINFO }: IProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrMsg] = useState<string | undefined>(undefined);
  const { openDialog, closeDialog } = useLoadingDialog();

  function handleDoneButton() {
    openDialog();
    startTransition(async () => {
      const respones = await setStatus(leaveINFO.id, "success", leaveINFO.employee_id, leaveINFO.leave_from, leaveINFO.leave_to);
      if (!respones.success) {
        setErrMsg(respones.message);
      }
      closeDialog();
    });
  }

  function handleDelineButton() {
    openDialog();
    startTransition(async () => {
      const respones = await setStatus(leaveINFO.id, "decline", leaveINFO.employee_id, leaveINFO.leave_from, leaveINFO.leave_to);
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
    <div className="flex items-center gap-3 *:cursor-pointer">
      <div
        title="Approve Request"
        className="size-5 shadow-2xl border-gray-700 border bg-green-600 flex-center rounded-full text-white"
      >
        <MdDone onClick={handleDoneButton} />
        <span className="hidden">{isPending}</span>
      </div>
      <div
        title="Disapprove Request"
        className="size-5 shadow-2xl bg-red-600 border-gray-700 border flex-center rounded-full text-white"
      >
        <MdClose onClick={handleDelineButton} />
      </div>
    </div>
  );
}
