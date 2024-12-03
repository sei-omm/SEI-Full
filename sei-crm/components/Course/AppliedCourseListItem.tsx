import React, { useRef } from "react";
import TagsBtn from "../TagsBtn";
import Button from "../Button";
import { IoPricetagOutline } from "react-icons/io5";
import { MdOutlineDateRange, MdUpdate } from "react-icons/md";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { TEnrollCourses } from "@/types";
import { doMutation } from "@/app/utils/doMutation";
import { queryClient } from "@/redux/MyProvider";

interface IProps {
  enroll_course_info: TEnrollCourses;
}

export default function AppliedCourseListItem({ enroll_course_info }: IProps) {
  const { mutate, isLoading: isMutating } = doMutation();

  const currentBtn = useRef<
    "enrollment-status-cancel" | "enrollment-status-approve"
  >("enrollment-status-cancel");

  const handleEnrollmentStatus = (status: string, enroll_id: number) => {
    if (status === "Approve") {
      currentBtn.current = "enrollment-status-approve";
    } else {
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
  return (
    <li className="relative">
      {/* [#E9B858] */}
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

              <span className="text-sm">
                Start : {beautifyDate(enroll_course_info.batch_start_date)}
              </span>
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
    </li>
  );
}
