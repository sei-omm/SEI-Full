"use client";

import { ICourse, OptionsType } from "@/types";
import DropDown from "../DropDown";
import TagInput from "../TagInput";
import { AiOutlineDelete } from "react-icons/ai";
import { useEffect, useState } from "react";

interface IProps {
  data: ICourse[];
  handleRemoveTask: (index: number) => void;
  index: number;
}

export default function EmployeeTasksListItems({
  data,
  handleRemoveTask,
  index,
}: IProps) {
  const [selectedCourseSubjects, setSelectedCourseSubjects] = useState("");

  const handleCourseSelectDropDown = ({ value }: OptionsType) => {
    const foundCourseInfo = data.find((item) => item.course_name === value);
    setSelectedCourseSubjects(foundCourseInfo?.subjects || "No Subjects");
  };

  useEffect(() => {
    setSelectedCourseSubjects(data[0].subjects);
  }, []);

  return (
    <div className="flex items-center gap-x-3 gap-y-4">
      <DropDown
        onChange={handleCourseSelectDropDown}
        wrapperCss="flex-grow basic-46"
        label="Select Course"
        options={
          data.map((course) => ({
            text: course.course_name,
            value: course.course_name,
          })) || []
        }
        defaultValue={data[0].course_name}
      />
      <TagInput
        wrapperCss="flex-grow basic-46"
        disabled
        label="Subjects"
        hideInput={true}
        defaultValue={selectedCourseSubjects}
      />

      <AiOutlineDelete
        onClick={() => handleRemoveTask(index)}
        size={18}
        className="mt-6 basis-6 cursor-pointer active:scale-90"
      />
    </div>
  );
}
