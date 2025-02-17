import { ISuccess, TFaculty, TTimeTableData } from "@/types";
import Image from "next/image";
import React, { useState } from "react";

interface IProps {
  serverData: ISuccess<TTimeTableData[]> | undefined;
  value: string;
  rowIndex: number;
  colIndex: number;
}

export default function TimeTableCell({
  serverData,
  value,
  rowIndex
}: IProps) {
  const [currentFaculty, setCurrentFaculty] = useState(
    serverData?.data[rowIndex].faculty.find((f) => f.for_subject_name === value)
  );

  const [currentFaculties, setCurrentFaculties] = useState<TFaculty[]>(() => {
    if (serverData) {
      return serverData.data[rowIndex].faculty.filter(
        (item) => item.for_subject_name === value
      );
    }
    return [];
  });

  const handleSubjectChange = (value: string) => {
    setCurrentFaculties(
      serverData?.data[rowIndex].faculty.filter(
        (item) => item.for_subject_name === value
      ) || []
    );
  };

  return (
    <div className="w-full bg-[#D6CEFF] py-3 px-3 rounded-md relative overflow-hidden group/edit flex items-center">
      <div className="size-8 border border-white rounded-full overflow-hidden">
        <Image
          className="size-full object-cover"
          src={currentFaculty?.profile_image || ""}
          alt="Faculty Image"
          height={32}
          width={32}
          quality={100}
        />
      </div>
      <div className="flex flex-col">
        <select
          onChange={(e) => handleSubjectChange(e.currentTarget.value)}
          name="subject_name"
          defaultValue={value}
          className="px-2 py-1 outline-none cursor-pointer bg-transparent"
        >
          {serverData?.data[rowIndex].subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
        <>
          <select
            name="employee_name"
            onChange={(e) => {
              setCurrentFaculty(
                serverData?.data[rowIndex].faculty.find(
                  (f) => f.faculty_name === e.currentTarget.value
                )
              );
            }}
            defaultValue={currentFaculty?.faculty_name || "Not Selected"}
            className="px-2 py-1 outline-none cursor-pointer bg-transparent"
          >
            {currentFaculties.map((eachFaculty) => (
              <option
                key={eachFaculty.faculty_id}
                value={eachFaculty.faculty_name}
              >
                {eachFaculty.faculty_name}
              </option>
            ))}
            <option value={"Not Selected"}>Not Selected</option>
          </select>
          <input
            name="faculty_profile_image"
            hidden
            value={currentFaculty?.profile_image || ""}
          />
          <input
            name="faculty_id"
            hidden
            value={currentFaculty?.faculty_id || ""}
          />
        </>
      </div>
    </div>
  );
}
