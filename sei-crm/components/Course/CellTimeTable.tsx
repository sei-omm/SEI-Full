import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image from "next/image";
import { TVirtualTable } from "@/types";

type TTimeTable = {
  course_id: number;
  course_name: string;
  course_code: string;
  sub_fac: {
    subject_name: string;
    faculty: TFacultyInfo[];
  }[];
};

interface IProps {
  value: string;
  row: number;
  col: number;

  setDuplicateCell: Dispatch<SetStateAction<Record<string, boolean> | null>>;
  duplicateCell: Record<string, boolean> | null;

  facultyInfo: TFacultyInfo[];
  subjectInfo: string[];
  time_table_data: TTimeTable[] | undefined;
  virtual_table: TVirtualTable | null;
  from_draft: boolean;
}

type TFacultyInfo = {
  faculty_id: number;
  faculty_name: string;
  profile_image: string;
};

// const existFacRowCol = existFacIds.get(value[1].fac.faculty_id);
//       if (existFacRowCol !== undefined) {
//         const splitedCurrRowCol = value[0].split(":");
//         const splitPrevRowCol = existFacRowCol.split(":");
//         if (splitedCurrRowCol[1] === splitPrevRowCol[1]) {
//           // check for same row if same row don't add as duplicateCell only for column
//           duplicateCell[value[0]] = true; // current one
//           duplicateCell[existFacRowCol] = true; // prev one
//         }
//       } else {
//         existFacIds.set(value[1].fac.faculty_id, value[0]);
//       }

export default function CellTimeTable({
  value,
  row,
  col,
  facultyInfo,
  subjectInfo,
  time_table_data,
  setDuplicateCell,
  duplicateCell,
  virtual_table,
  from_draft,
}: IProps) {
  const [currentFaculties, setCurrentFaculties] = useState<TFacultyInfo[]>(
    () => {
      const savedSubjectName = virtual_table?.[`${row}:${col}`].subject;
      if (savedSubjectName) {
        return (
          time_table_data?.[row].sub_fac.find(
            (item) => item.subject_name === savedSubjectName
          )?.faculty || []
        );
      }

      return facultyInfo;
    }
  );

  const [singleFacInfo, setSingleFacInfo] = useState<TFacultyInfo | null>(
    () => {
      if (virtual_table?.[`${row}:${col}`].fac)
        return virtual_table?.[`${row}:${col}`].fac;
      return currentFaculties[0];
    }
  );

  const checkDuplicateFac = () => {
    const duplicateCell: Record<string, boolean> = {};

    if (!virtual_table) return alert("No Row Data Found");

    const virtual_table_array = Object.entries(virtual_table || {}).filter(
      (item) => item[1].fac !== null && item[1].fac.faculty_id !== -1
    );

    // not opimize O(n2)
    // now check duplicity
    virtual_table_array.forEach((value) => {
      // if current [row:col] is avilable in virtual table consider tham as duplicate
      // if (value[1].fac === null) return;
      // if (value[1].fac.faculty_id === -1) return;

      const currentFac = value[1].fac?.faculty_id;
      const currentFacCol = value[0].split(":")[1];

      virtual_table_array.forEach((item) => {
        // if (item[1].fac === null) return;
        // if (item[1].fac.faculty_id === -1) return;
        if (item[0] === value[0]) return; // if same cell dont check

        if (currentFac === item[1].fac?.faculty_id) {
          // now check if both are same col
          if (currentFacCol === item[0].split(":")[1]) {
            duplicateCell[item[0]] = true;
            duplicateCell[value[0]] = true;
          }
        }
      });
    });

    setDuplicateCell(duplicateCell);
  };

  const handleSubChange = (subject_name: string) => {
    const currentSubFacInfo = time_table_data?.[row].sub_fac.find(
      (item) => item.subject_name === subject_name
    )?.faculty;
    if (!virtual_table) return alert("No Row Data Found");

    virtual_table[`${row}:${col}`] = {
      fac: currentSubFacInfo?.[0] || null,
      subject: subject_name,
      course_name: time_table_data?.[row].course_name || "",
    };

    setCurrentFaculties(currentSubFacInfo || []);
    setSingleFacInfo(currentSubFacInfo?.[0] || null);
    checkDuplicateFac();
  };

  const handleFacChange = (fac_id: number) => {
    const singleFac =
      currentFaculties.find((fac) => fac.faculty_id === fac_id) || null;
    setSingleFacInfo(singleFac);
    if (!virtual_table) return alert("No Row Data Found");

    const vtSubject = virtual_table[`${row}:${col}`]?.subject;

    virtual_table[`${row}:${col}`] = {
      fac: singleFac,
      subject: vtSubject || value || "Off Period",
      course_name: time_table_data?.[row].course_name || "",
    };

    checkDuplicateFac();
  };

  useEffect(() => {
    if (from_draft) {
      checkDuplicateFac();
    }
  }, []);

  return (
    <div
      className={`w-full py-3 px-3 rounded-md relative overflow-hidden group/edit flex items-center ${
        duplicateCell?.[`${row}:${col}`] !== undefined ? "bg-red-400" : ""
      }`}
    >
      <div className="size-8 border border-white rounded-full overflow-hidden">
        <Image
          className="size-full object-cover"
          src={singleFacInfo?.profile_image || "/placeholder_image.jpg"}
          alt="Faculty Image"
          height={32}
          width={32}
          quality={100}
        />
      </div>
      <div className="flex flex-col">
        <select
          key={"subject_name"}
          onChange={(e) => handleSubChange(e.currentTarget.value)}
          name="subject_name"
          defaultValue={virtual_table?.[`${row}:${col}`].subject || value}
          className="px-2 py-1 outline-none cursor-pointer bg-transparent"
        >
          <option value="Choose Subject" disabled>
            Choose Subject
          </option>

          {subjectInfo?.map((subject) => (
            <option key={`S${row}${col}`} value={subject}>
              {subject}
            </option>
          ))}

          <option value="Off Period">Off Period</option>
        </select>
        <>
          <select
            key={"fac_id"}
            onChange={(e) => handleFacChange(parseInt(e.currentTarget.value))}
            name="fac_id"
            value={
              singleFacInfo?.faculty_id
                ? singleFacInfo.faculty_id
                : "No Faculties"
            }
            className="px-2 py-1 outline-none cursor-pointer bg-transparent"
          >
            {currentFaculties?.map((fac) => (
              <option key={`F${row}${col}`} value={fac.faculty_id}>
                {fac.faculty_name}
              </option>
            ))}

            <option value="No Faculties" disabled>
              No Faculties
            </option>
          </select>
        </>
      </div>
    </div>
  );
}
