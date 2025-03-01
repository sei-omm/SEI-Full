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
  vertualTable: object;
  setVertualTable: React.Dispatch<
    React.SetStateAction<object>
  >;
  duplicateCell : any;
  setDuplicateCell : React.Dispatch<any>
}

export default function TimeTableCell({
  serverData,
  value,
  rowIndex,
  colIndex,
  selectedSubjects,
  selectedFaculties,
  disabled,
  setVertualTable,
  vertualTable,
  duplicateCell,
  setDuplicateCell
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
    <div className={`w-full ${duplicateCell[`${rowIndex}:${colIndex - 1}`] ? "bg-red-400" : "bg-[#D6CEFF]"} py-3 px-3 rounded-md relative overflow-hidden group/edit flex items-center`}>
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
              const cellNeedToUpdate : any = {};

              Object.entries(vertualTable).forEach((value) => {
                if(value[1] !== undefined && value[1].faculty_id !== -1 && value[1].faculty_id == e.currentTarget.value) {
                  cellNeedToUpdate[value[0]] = value[1];
                  cellNeedToUpdate[`${rowIndex}:${colIndex - 1}`] = value[1];
                }
              })

              // setVertualTable(prev => ({...prev, ...cellNeedToUpdate}));
              // setDuplicateCell((prev : any) => ({...prev, ...cellNeedToUpdate}));
              setDuplicateCell(cellNeedToUpdate);

              const currentFaculty = serverData?.[rowIndex].faculty.find(
                (f) => f.faculty_id === parseInt(e.currentTarget.value)
              );

              setVertualTable(prev => ({...prev, [`${rowIndex}:${colIndex - 1}`] : currentFaculty}));

              selectedFaculties[`${rowIndex}${colIndex}`] = parseInt(
                e.currentTarget.value
              );
              setCurrentFaculty(currentFaculty);
            
            }}
            defaultValue={currentFaculty?.faculty_id || 0}
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
