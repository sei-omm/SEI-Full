"use client";

import { IoAddOutline } from "react-icons/io5";
import Button from "./Button";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { useQuery } from "react-query";
import { IError, ISuccess } from "@/types";
import HandleSuspence from "./HandleSuspence";
import { AiOutlineDelete } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import { axiosQuery } from "@/utils/axiosQuery";
import { toast } from "react-toastify";

interface IProps {
  employeeInstitute: string;
  employeeId: number;
}

export default function EmployeeTask({
  employeeInstitute,
  employeeId,
}: IProps) {

  const dispatch = useDispatch();

  const handleNewTaskAdd = async () => {
    // if (number.current === 0) {
    //   await refetch();
    // }
    // number.current = number.current + 1;
    // setTasks((preTasks) => [...preTasks, number.current]);

    dispatch(
      setDialog({
        dialogId: "faculty-assign-courses-dialog",
        type: "OPEN",
        extraValue: {
          faculty_id: employeeId,
          institute: employeeInstitute,
        },
      })
    );
  };

  const { data, isFetching, error, refetch } = useQuery<
    ISuccess<
      {
        faculty_id: number;
        course_id: number;
        course_name: string;
        subject: string;
      }[]
    >
  >({
    queryKey: ["faculty-assign-course", employeeId],
    queryFn: async () =>
      (
        await axios.get(
          `${BASE_API}/employee/faculty-assign-course/${employeeId}`
        )
      ).data,
  });

  const { openDialog, closeDialog } = useLoadingDialog();

  async function handleRemoveCourse(courseId: number) {
    openDialog();

    const { error } = await axiosQuery<IError, ISuccess>({
      url: `${BASE_API}/employee/faculty-assign-course/${employeeId}/${courseId}`,
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
    <div className="p-10 border card-shdow rounded-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold pb-6">Faculty Assign Courses</h2>

        <Button
          onClick={handleNewTaskAdd}
          type="button"
          className="flex items-center gap-4"
        >
          <IoAddOutline size={18} />
          Assign Course
        </Button>
      </div>

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={data?.data.length}
      >
        {/* <div className="space-y-4">
          {tasks.map((item, index) =>
            item === undefined ? null : (
              <EmployeeTasksListItems
                key={index}
                data={data?.data || []}
                handleRemoveTask={handleRemoveTask}
                index={index}
              />
            )
          )}
        </div> */}
        <ul className="space-y-4 mt-5">
          {data?.data.map((item) => (
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
                <div className="flex gap-3 *:cursor-pointer">
                  <AiOutlineDelete
                    onClick={() => handleRemoveCourse(item.course_id)}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </HandleSuspence>
    </div>
  );
}
