"use client";

import { MdClose, MdDone } from "react-icons/md";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import { ILeave } from "@/types";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { useRouter } from "next/navigation";
import { AiOutlineDelete } from "react-icons/ai";

interface IProps {
  leaveINFO: ILeave;
}

interface IActionBtn {
  handleActionBtn: (status: "success" | "decline") => void;
}

function DeclineBtn({ handleActionBtn }: IActionBtn) {
  return (
    <div
      title="Disapprove Request"
      className="size-5 shadow-2xl bg-red-600 border-gray-700 border flex-center rounded-full text-white"
    >
      <MdClose onClick={() => handleActionBtn("decline")} />
    </div>
  );
}

function DoneBtn({ handleActionBtn }: IActionBtn) {
  return (
    <div
      title="Approve Request"
      className="size-5 shadow-2xl border-gray-700 border bg-green-600 flex-center rounded-full text-white"
    >
      <MdDone onClick={() => handleActionBtn("success")} />
    </div>
  );
}

export default function LeaveActionButtons({ leaveINFO }: IProps) {
  const { openDialog, closeDialog } = useLoadingDialog();
  const route = useRouter();

  const { mutate } = useDoMutation(
    () => {},
    (error) => {
      closeDialog();

      if (error.response?.data.message === "Does Not Have Any Leave Avilable") {
        if (
          !confirm(
            "Do you want to remove this unnecessary request form row (Recommend) ?"
          )
        )
          return;

        openDialog();
        mutate({
          apiPath: "/hr/leave",
          method: "delete",
          id: leaveINFO.id,
          onSuccess() {
            closeDialog();
          },
        });
      }
    }
  );

  const changeRoute = () => {
    route.push(
      `/dashboard/hr-module/leave-management?tab=request&status=${Math.floor(
        Math.random() * 100
      )}`
    );
  };

  function handleActionBtn(
    status: "success" | "decline",
    previous_status: "success" | "decline" | "pending"
  ) {
    openDialog();
    mutate({
      apiPath: "/hr/leave",
      method: "patch",
      formData: {
        leave_status: status,
        previous_status: previous_status,
        employee_id: leaveINFO.employee_id,
        leave_from: leaveINFO.leave_from,
        leave_to: leaveINFO.leave_to,
        leave_type: leaveINFO.leave_type,
      },
      id: leaveINFO.id,
      onSuccess() {
        closeDialog();
        changeRoute();
      },
    });
  }

  function handleDeleteBtn(leave_row_id: number) {
    if (!confirm("Are you sure you want to remove this row")) return;

    openDialog();
    mutate({
      apiPath: "/hr/leave",
      method: "delete",
      id: leave_row_id,
      onSuccess() {
        closeDialog();
        changeRoute();
      },
    });
  }

  return (
    <div className="flex items-center gap-3 *:cursor-pointer">
      {leaveINFO.leave_status === "success" ? (
        <>
          <DeclineBtn
            handleActionBtn={() => handleActionBtn("decline", "success")}
          />
          <AiOutlineDelete
            size={18}
            onClick={() => handleDeleteBtn(leaveINFO.id)}
          />
        </>
      ) : leaveINFO.leave_status === "decline" ? (
        <>
          <DoneBtn
            handleActionBtn={() => handleActionBtn("success", "decline")}
          />
          <AiOutlineDelete
            size={18}
            onClick={() => handleDeleteBtn(leaveINFO.id)}
          />
        </>
      ) : (
        <>
          <DeclineBtn
            handleActionBtn={() => handleActionBtn("decline", "pending")}
          />
          <DoneBtn
            handleActionBtn={() => handleActionBtn("success", "pending")}
          />
          <AiOutlineDelete
            size={18}
            onClick={() => handleDeleteBtn(leaveINFO.id)}
          />
        </>
      )}
    </div>
  );
}
