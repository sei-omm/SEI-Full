"use client";

import { MdClose, MdDone } from "react-icons/md";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import { IOtherLeave } from "@/types";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { queryClient } from "@/redux/MyProvider";
import Link from "next/link";
import { BASE_API } from "@/app/constant";
import { IoPrintSharp } from "react-icons/io5";

interface IProps {
  leaveINFO?: IOtherLeave;
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
  // const route = useRouter();

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
          apiPath: "/account/leave",
          method: "delete",
          id: leaveINFO?.id,
          onSuccess() {
            closeDialog();
          },
        });
      }
    }
  );

  // const changeRoute = () => {
  //   route.push(
  //     `/dashboard/hr-module/leave-management?tab=request&status=${Math.floor(
  //       Math.random() * 100
  //     )}`
  //   );
  // };

  function handleActionBtn(
    status: "success" | "decline",
    previous_status: "success" | "decline" | "pending"
  ) {
    openDialog();
    mutate({
      apiPath: "/account/leave",
      method: "patch",
      formData: {
        leave_status: status,
        previous_status: previous_status,
        employee_id: leaveINFO?.employee_id,
        leave_from: leaveINFO?.leave_from,
        leave_to: leaveINFO?.leave_to,
        leave_type: leaveINFO?.leave_type,
        leave_and_employee_row_id: leaveINFO?.row_id,
      },
      id: leaveINFO?.id,
      onSuccess() {
        closeDialog();
        // changeRoute();
        queryClient.invalidateQueries(["other-leaves"]);
      },
    });
  }

  // function handleDeleteBtn(leave_row_id: number) {
  //   if (!confirm("Are you sure you want to remove this row")) return;

  //   openDialog();
  //   mutate({
  //     apiPath: "/hr/leave",
  //     method: "delete",
  //     id: leave_row_id,
  //     onSuccess() {
  //       closeDialog();
  //       // changeRoute();
  //       queryClient.invalidateQueries(["other-leaves"]);
  //     },
  //   });
  // }

  return (
    <div className="flex items-center gap-3 *:cursor-pointer">
      {leaveINFO?.leave_status === "success" ? (
        <>
          <DeclineBtn
            handleActionBtn={() => handleActionBtn("decline", "success")}
          />
          {/* <AiOutlineDelete
            size={18}
            onClick={() => handleDeleteBtn(leaveINFO.id)}
          /> */}
          <Link
            target="_blank"
            href={`${BASE_API}/account/leave/receipt/${leaveINFO?.id}`}
          >
            <IoPrintSharp size={20} />
          </Link>
        </>
      ) : leaveINFO?.leave_status === "decline" ? (
        <>
          <DoneBtn
            handleActionBtn={() => handleActionBtn("success", "decline")}
          />
          {/* <AiOutlineDelete
            size={18}
            onClick={() => handleDeleteBtn(leaveINFO.id)}
          /> */}
        </>
      ) : (
        <>
          <DeclineBtn
            handleActionBtn={() => handleActionBtn("decline", "pending")}
          />
          <DoneBtn
            handleActionBtn={() => handleActionBtn("success", "pending")}
          />
          <Link
            target="_blank"
            href={`${BASE_API}/hr/leave/receipt/${leaveINFO?.id}`}
          >
            <IoPrintSharp size={20} />
          </Link>
          {/* <AiOutlineDelete
            size={18}
            onClick={() => handleDeleteBtn(leaveINFO?.id || 0)}
          /> */}
        </>
      )}
    </div>
  );
}
