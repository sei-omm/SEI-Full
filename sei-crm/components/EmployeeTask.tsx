"use client";

import { IoAddOutline } from "react-icons/io5";
import Button from "./Button";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import FacultyAssignCourseListview from "./Employee/FacultyAssignCourseListview";

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

      <FacultyAssignCourseListview employee_id={employeeId} with_delete />
    </div>
  );
}
