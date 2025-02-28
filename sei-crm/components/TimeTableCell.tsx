import { TFaculty, TTimeTableData } from "@/types";
import Image from "next/image";
import React, { useState } from "react";

interface IProps {
  disabled: boolean;
  serverData: TTimeTableData[] | undefined;
  value: string;
  rowIndex: number;
  colIndex: number;
  selectedSubjects: any;
  selectedFaculties: any;
}

export default function TimeTableCell({
  serverData,
  value,
  rowIndex,
  colIndex,
  selectedSubjects,
  selectedFaculties,
  disabled,
}: IProps) {
  const [currentFaculty, setCurrentFaculty] = useState(
    serverData?.[rowIndex].faculty.find((f) => f.for_subject_name === value)
  );

  const [currentFaculties, setCurrentFaculties] = useState<TFaculty[]>(() => {
    if (serverData) {
      return serverData?.[rowIndex].faculty.filter(
        (item) => item.for_subject_name === value
      );
    }
    return [];
  });

  const handleSubjectChange = (value: string) => {
    const subjectFaculties =
      serverData?.[rowIndex].faculty.filter(
        (item) => item.for_subject_name === value
      ) || [];

    selectedSubjects[`${rowIndex}${colIndex}`] = value;

    setCurrentFaculties(subjectFaculties);

    if (value === "Choose Subject" || value === "Off Period") {
      setCurrentFaculty(undefined);
      if (value === "Choose Subject") {
        delete selectedSubjects[`${rowIndex}${colIndex}`];
      }
      delete selectedFaculties[`${rowIndex}${colIndex}`];
    } else {
      setCurrentFaculty(subjectFaculties[0]);
      selectedFaculties[`${rowIndex}${colIndex}`] =
        subjectFaculties[0]?.faculty_id;
    }
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
          disabled={disabled}
          onChange={(e) => handleSubjectChange(e.currentTarget.value)}
          name="subject_name"
          defaultValue={value}
          className="px-2 py-1 outline-none cursor-pointer bg-transparent"
        >
          <option value="Choose Subject" disabled>
            Choose Subject
          </option>
          {serverData?.[rowIndex].subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
          <option value="Off Period">Off Period</option>
        </select>
        <>
          <select
            name="faculty_id"
            onChange={(e) => {
              selectedFaculties[`${rowIndex}${colIndex}`] = parseInt(
                e.currentTarget.value
              );
              setCurrentFaculty(
                serverData?.[rowIndex].faculty.find(
                  (f) => f.faculty_id === parseInt(e.currentTarget.value)
                )
              );
            }}
            defaultValue={currentFaculty?.faculty_id || 0}
            className="px-2 py-1 outline-none cursor-pointer bg-transparent"
            disabled={currentFaculties.length === 0 || disabled}
          >
            {/* <option value={0} selected = {currentFaculty?.faculty_id === 0}>
              Choose Faculty
            </option> */}
            {currentFaculties.map((eachFaculty) => (
              <option
                key={eachFaculty.faculty_id}
                // value={eachFaculty.faculty_name}
                value={eachFaculty.faculty_id}
              >
                {eachFaculty.faculty_name}
              </option>
            ))}
            {/* <option value={"Not Selected"}>Not Selected</option> */}
            {/* <option value="Choose Subject" disabled>
              Choose Faculty
            </option> */}
            {currentFaculties.length === 0 && (
              <option value="No Faculties">No Faculties</option>
            )}
          </select>
          <input
            name="faculty_profile_image"
            hidden
            value={currentFaculty?.profile_image || ""}
          />
          <input
            name="employee_name"
            hidden
            value={currentFaculty?.faculty_name || ""}
          />
        </>
      </div>
    </div>
  );
}
