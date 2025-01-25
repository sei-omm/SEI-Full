import React, { useRef } from "react";
import TagsBtn from "../TagsBtn";
import Button from "../Button";
import { IoPricetagOutline } from "react-icons/io5";
import { MdOutlineDateRange, MdUpdate } from "react-icons/md";
import { beautifyDate } from "@/app/utils/beautifyDate";
import {
  IError,
  ISuccess,
  TBatches,
  TEnrollCourses,
  TPaymentInfo,
} from "@/types";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { queryClient } from "@/redux/MyProvider";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { axiosQuery } from "@/utils/axiosQuery";
import { BASE_API } from "@/app/constant";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import { getAuthToken } from "@/app/utils/getAuthToken";

interface IProps {
  enroll_course_info: TEnrollCourses;
  paymentsInfo: TPaymentInfo;
  student_course_info: TEnrollCourses[] | undefined;
  course_batches?: TBatches[];
}

export default function AppliedCourseListItem({
  enroll_course_info,
  paymentsInfo,
  student_course_info,
  course_batches,
}: IProps) {
  const { mutate, isLoading: isMutating } = useDoMutation();
  const searchParams = useSearchParams();

  const dispatch = useDispatch();

  const currentBtn = useRef<
    "enrollment-status-cancel" | "enrollment-status-approve"
  >("enrollment-status-cancel");

  const handleEnrollmentStatus = (status: string, enroll_id: number) => {
    if (status === "Approve") {
      currentBtn.current = "enrollment-status-approve";
    } else {
      dispatch(
        setDialog({
          type: "OPEN",
          dialogId: "admission-payment",
          extraValue: {
            payment_type: "add-payment",
            total_paid: paymentsInfo?.total_paid,
            total_due: paymentsInfo?.total_due,
            student_course_info: student_course_info,
            selected_tab_index: 2,
            selected_batch_id: enroll_course_info.batch_id,
          },
        })
      );

      return;

      currentBtn.current = "enrollment-status-cancel";
    }

    const formData = new FormData();
    formData.set("enrollment_status", status);

    mutate({
      apiPath: "/admission/enrollment-status",
      method: "patch",
      formData,
      headers: {
        "Content-Type": "application/json",
      },
      id: enroll_id,
      onSuccess: () => {
        // refetch();
        queryClient.refetchQueries(["fetch-admission-details"]);
      },
    });
  };

  const { closeDialog, openDialog } = useLoadingDialog();

  async function handleBatchDateChange(value: string) {
    if (!confirm("Are you sure you want to change the batch date ?")) return;

    openDialog();

    const { error, response } = await axiosQuery<IError, ISuccess>({
      url: `${BASE_API}/course/batch`,
      headers: {
        "Content-Type": "application/json",
        ...getAuthToken(),
      },
      method: "patch",
      data: {
        old_batch_id: enroll_course_info.batch_id,
        new_batch_id: value,
        course_id: enroll_course_info.course_id,
        student_id: searchParams.get("student-id"),
      },
    });

    closeDialog();

    if (error) return toast.error(error.message);

    toast.success(response?.message);
    queryClient.invalidateQueries(["fetch-admission-details"]);
  }

  return (
    <li>
      {/* [#E9B858] */}
      <div className="relative">
        <div
          className={`absolute top-0 bottom-0 w-3 ${
            enroll_course_info.enrollment_status === "Approve"
              ? "bg-green-600"
              : enroll_course_info.enrollment_status === "Pending"
              ? "bg-yellow-300"
              : "bg-red-600"
          } mt-[1px] rounded-2xl`}
        ></div>
        <div className="flex items-center justify-between">
          <div className="pl-5 space-y-1">
            <h3 className="font-semibold">{enroll_course_info.course_name}</h3>
            <div className="flex items-center flex-wrap gap-x-5 gap-y-2 *:text-gray-600 *:font-semibold">
              <div className="flex items-center gap-2">
                <MdOutlineDateRange />

                {/* <span className="text-sm">
                Start : {beautifyDate(enroll_course_info.batch_start_date)}
              </span> */}
                {/* <DropDown
                label=""
                options={[
                  { text: "Batch Number 1", value: 1 },
                  { text: "Batch 2", value: 1 },
                ]}
              /> */}
                <select
                  onChange={(e) => handleBatchDateChange(e.currentTarget.value)}
                  className="text-sm outline-blue-400 cursor-pointer *:cursor-pointer"
                >
                  {course_batches?.map((item) => (
                    <option
                      selected={enroll_course_info.batch_id === item.batch_id}
                      key={item.batch_id}
                      value={item.batch_id}
                    >
                      Start : {beautifyDate(item.start_date)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <MdUpdate />
                <span className="text-sm">
                  End : {beautifyDate(enroll_course_info.batch_end_date)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <IoPricetagOutline />
                <span className="text-sm">
                  <span className="font-inter">₹</span>
                  {enroll_course_info.batch_fee}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-x-5">
            <Button
              disabled={isMutating}
              loading={isMutating}
              onClick={() =>
                handleEnrollmentStatus(
                  enroll_course_info.enrollment_status === "Approve"
                    ? "Cancel"
                    : "Approve",
                  enroll_course_info.enroll_id
                )
              }
              type="button"
              className={
                enroll_course_info.enrollment_status === "Approve"
                  ? "bg-red-600"
                  : "bg-green-600"
              }
            >
              {enroll_course_info.enrollment_status === "Approve"
                ? "Cancel Course"
                : "Approve Course"}
            </Button>

            {/* <Button
            loading={
              currentBtn.current === "enrollment-status-approve" && isMutating
            }
            disabled={
              currentBtn.current === "enrollment-status-approve" && isMutating
            }
            onClick={() =>
              handleEnrollmentStatus("Approve", enroll_course_info.enroll_id)
            }
            type="button"
            className="bg-green-600"
          >
            Approve Course
          </Button>
          <Button
            loading={
              currentBtn.current === "enrollment-status-cancel" && isMutating
            }
            disabled={
              currentBtn.current === "enrollment-status-cancel" && isMutating
            }
            onClick={() =>
              handleEnrollmentStatus("Cancel", enroll_course_info.enroll_id)
            }
            type="button"
            className="bg-red-600"
          >
            Cancel Course
          </Button> */}
          </div>
        </div>
        <TagsBtn
          btnTypeProps="button"
          className="ml-5 mt-2"
          type={
            enroll_course_info.enrollment_status === "Approve"
              ? "SUCCESS"
              : enroll_course_info.enrollment_status === "Pending"
              ? "PENDING"
              : "FAILED"
          }
        >
          {enroll_course_info.enrollment_status === "Approve"
            ? "Approved"
            : enroll_course_info.enrollment_status === "Pending"
            ? "Waiting List"
            : "Canceled"}
        </TagsBtn>
      </div>
      <div className="pt-3">
        <span className="text-xs text-gray-900 font-semibold float-left mr-2">
          Modified by :
        </span>
        <ul className="flex items-center gap-3 flex-wrap">
          {enroll_course_info.modified_by_info?.map((modifiBy, index) => (
            <li key={index} className="font-semibold text-xs text-gray-500">
              {modifiBy.employee_name} ({beautifyDate(modifiBy.created_at)}),
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
