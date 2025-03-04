import { TFaculty, TTimeTableData, TVTableData } from "@/types";
import Image from "next/image";
import React, { useState } from "react";

interface IProps {
  disabled: boolean;
  serverData: TTimeTableData[] | undefined;
  value: string;
  rowIndex: number;
  colIndex: number;
  duplicateCell: any;
  setDuplicateCell: React.Dispatch<any>;
  vTable?: Map<string, TVTableData>;
  setVTable: React.Dispatch<
    React.SetStateAction<Map<string, TVTableData> | undefined>
  >;
}

export default function TimeTableCell({
  serverData,
  value,
  rowIndex,
  colIndex,
  disabled,
  duplicateCell,
  setDuplicateCell,
  setVTable,
  vTable,
}: IProps) {
  const [currentFaculty, setCurrentFaculty] = useState(() => {
    const vFaculty = vTable?.get(`${rowIndex}:${colIndex - 1}`)?.selected_faculty_id;
    if(vFaculty) {
      return serverData?.[rowIndex].faculty.find(item => item.faculty_id === vFaculty)
    }
    return serverData?.[rowIndex].faculty.find(
      (f) => f.for_subject_name === value
    );
  });

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

    setDuplicateCell({});

    // selectedSubjects[`${rowIndex}${colIndex}`] = value;

    setCurrentFaculties(subjectFaculties);

    setVTable((prev) => {
      const newMap = new Map(prev); // Clone the existing map
      newMap.set(`${rowIndex}:${colIndex - 1}`, {
        course_code: serverData?.[rowIndex].course_code || "",
        course_id: serverData?.[rowIndex].course_id || -1,
        course_name: serverData?.[rowIndex].course_name || "",
        faculties: currentFaculties,
        subjects: serverData?.[rowIndex].subjects || [],
        selected_faculty_id: currentFaculty?.faculty_id || -1,
        selected_subject: value,
      });
      return newMap;
    });

    // if (value === "Choose Subject" || value === "Off Period") {
    //   setCurrentFaculty(undefined);
    //   if (value === "Choose Subject") {
    //     delete selectedSubjects[`${rowIndex}${colIndex}`];
    //   }
    //   delete selectedFaculties[`${rowIndex}${colIndex}`];
    // } else {
    //   setCurrentFaculty(subjectFaculties[0]);
    //   selectedFaculties[`${rowIndex}${colIndex}`] =
    //     subjectFaculties[0]?.faculty_id;
    // }

    if (value === "Off Period") {
      setCurrentFaculty(undefined);
    } else {
      setCurrentFaculty(subjectFaculties[0]);
    }
  };

  const handleFacultyChange = (fac_id: number) => {
    const currentFacultyInfo = serverData?.[rowIndex].faculty.find(
      (item) => item.faculty_id === fac_id
    );

    const map = new Map(vTable);
    const oldMapData = map.get(`${rowIndex}:${colIndex - 1}`);
    if (oldMapData) {
      map.set(`${rowIndex}:${colIndex - 1}`, {
        ...oldMapData,
        selected_faculty_id: currentFacultyInfo?.faculty_id || -1,
      });
    }

    const duplicateFaculties: any = {};
    const alreadyExistFaculties = new Map<number, string>();

    map.forEach((value, key) => {
      if (value.selected_faculty_id !== -1) {
        const existedValue = alreadyExistFaculties.get(
          value.selected_faculty_id
        );
        if (existedValue !== undefined) {
          duplicateFaculties[key] = value.selected_faculty_id;
          duplicateFaculties[existedValue] = value.selected_faculty_id;
        } else {
          alreadyExistFaculties.set(value.selected_faculty_id, key);
        }
      }
    });

    setVTable(map);
    setDuplicateCell(duplicateFaculties);
    setCurrentFaculty(currentFacultyInfo);
  };

  return (
    <div
      className={`w-full ${
        duplicateCell[`${rowIndex}:${colIndex - 1}`]
          ? "bg-red-400"
          : "bg-[#D6CEFF]"
      } py-3 px-3 rounded-md relative overflow-hidden group/edit flex items-center`}
    >
      <div className="size-8 border border-white rounded-full overflow-hidden">
        <Image
          className="size-full object-cover"
          src={currentFaculty?.profile_image || "/placeholder_image.jpg"}
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
            onChange={(e) =>
              handleFacultyChange(parseInt(e.currentTarget.value))
            }
            value={currentFaculty?.faculty_id}
            className="px-2 py-1 outline-none cursor-pointer bg-transparent"
            disabled={currentFaculties.length === 0 || disabled}
          >
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
