"use client";

import { MdClose, MdDone } from "react-icons/md";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import { ILeave } from "@/types";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { useRouter } from "next/navigation";


interface IProps {
  leaveINFO: ILeave;
}

export default function LeaveActionButtons({ leaveINFO }: IProps) {
  const { openDialog, closeDialog } = useLoadingDialog();
  const route = useRouter();

  const { mutate } = useDoMutation(
    () => {},
    () => {
      closeDialog();
    }
  );

  function handleActionBtn(status: "success" | "decline") {
    openDialog();
    mutate({
      apiPath: "/hr/leave",
      method: "patch",
      formData: {
        leave_status: status,
        employee_id: leaveINFO.employee_id,
        leave_from: leaveINFO.leave_from,
        leave_to: leaveINFO.leave_to,
        leave_type: leaveINFO.leave_type,
      },
      id: leaveINFO.id,
      onSuccess() {
        closeDialog();
        route.push(`/dashboard/hr-module/leave-management?tab=request&status=${status}`)
      },
    });
  }

  return (
    <div className="flex items-center gap-3 *:cursor-pointer">
      {leaveINFO.leave_status === "success" ? (
        <div
          title="Disapprove Request"
          className="size-5 shadow-2xl bg-red-600 border-gray-700 border flex-center rounded-full text-white"
        >
          <MdClose onClick={() => handleActionBtn("decline")} />
        </div>
      ) : (
        <div
          title="Approve Request"
          className="size-5 shadow-2xl border-gray-700 border bg-green-600 flex-center rounded-full text-white"
        >
          <MdDone onClick={() => handleActionBtn("success")} />
        </div>
      )}
    </div>
  );
}
