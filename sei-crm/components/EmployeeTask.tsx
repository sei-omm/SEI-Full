"use client";

import { IoAddOutline } from "react-icons/io5";
import Button from "./Button";
import { useRef, useState } from "react";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { useQuery } from "react-query";
import { ICourse, ISuccess } from "@/types";
import HandleSuspence from "./HandleSuspence";
import EmployeeTasksListItems from "./Employee/EmployeeTasksListItems";

async function fetchCourses() {
  const { data } = await axios.get(`${BASE_API}/course`);
  return data;
}

export default function EmployeeTask() {
  const [tasks, setTasks] = useState<number[]>([]);
  // const [selectedCourseSubjects, setSelectedCourseSubjects] = useState(""); //value -> Math,History
  const number = useRef(0);

  const { isLoading, data, refetch } = useQuery<ISuccess<ICourse[]>>({
    queryKey: "fetch-courses",
    queryFn: fetchCourses,
    enabled: false,
  });

  const handleNewTaskAdd = async () => {
    if (number.current === 0) {
       await refetch();
      // setSelectedCourseSubjects(reFetchData?.data[0].subjects || "No Subjects");
    }
    number.current = number.current + 1;
    setTasks((preTasks) => [...preTasks, number.current]);
  };

  const handleRemoveTask = (index: number) => {
    const newTasks = [...tasks];
    delete newTasks[index];
    setTasks(newTasks);
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

      <HandleSuspence isLoading={isLoading}>
        <div className="space-y-4">
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
        </div>
      </HandleSuspence>
    </div>
  );
}
