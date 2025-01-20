import { BASE_API } from "@/app/constant";
import { IAssignCourse, IError, ISuccess } from "@/types";
import axios from "axios";
import React from "react";
import { useQuery } from "react-query";
import HandleSuspence from "../HandleSuspence";
import { AiOutlineDelete } from "react-icons/ai";
import { axiosQuery } from "@/utils/axiosQuery";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import { toast } from "react-toastify";

interface IProps {
  employee_id: number;
  with_delete: boolean;
}

export default function FacultyAssignCourseListview({
  employee_id,
  with_delete,
}: IProps) {
  const { openDialog, closeDialog } = useLoadingDialog();

  const {
    data: faculty_assign_course,
    isFetching,
    error,
    refetch,
  } = useQuery<ISuccess<IAssignCourse[]>>({
    queryKey: ["faculty-assign-course"],
    queryFn: async () =>
      (
        await axios.get(
          `${BASE_API}/employee/faculty-assign-course/${employee_id}`
        )
      ).data,
  });

  async function handleRemoveCourse(courseId: number) {
    openDialog();

    const { error } = await axiosQuery<IError, ISuccess>({
      url: `${BASE_API}/employee/faculty-assign-course/${employee_id}/${courseId}`,
      method: "delete",
    });

    closeDialog();
    if (error) {
      toast.error(error.message);
      return;
    }

    refetch();
  }

  return (
    <HandleSuspence
      isLoading={isFetching}
      error={error}
      dataLength={faculty_assign_course?.data.length}
    >
      <ul className="space-y-4 mt-5">
        {faculty_assign_course?.data.map((item) => (
          <li key={item.course_id} className="border p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="font-semibold">{item.course_name}</h2>
                <ul className="flex items-center gap-3 flex-wrap">
                  {item.subject.split(",").map((tag, index) => (
                    <li
                      key={index}
                      className="text-xs flex text-nowrap items-center gap-2 bg-gray-200 py-1 px-3 rounded-xl"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
              {with_delete ? (
                <div className="flex gap-3 *:cursor-pointer">
                  <AiOutlineDelete
                    onClick={() => handleRemoveCourse(item.course_id)}
                  />
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </HandleSuspence>
  );
}
