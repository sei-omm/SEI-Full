import React, { useState } from "react";
import DropDown from "../DropDown";
import { IDepartment, IEmployee } from "@/types";
import { employeeAuthority } from "@/app/constant";

interface IProps {
  departements?: IDepartment[];
  employeeInfo?: IEmployee;
  employeeID: number | "add-employee" | "add-faculty";
}

export default function EAuthorityInfo({
  departements,
  employeeInfo,
  employeeID,
}: IProps) {
  const [currentDepartment, setCurrentDepartment] = useState<
    IDepartment | undefined
  >(() => {
    if (departements) {
      const singleDepartmentInfo = departements?.find(
        (eDepartment) => eDepartment.id === employeeInfo?.department_id
      );

      if (singleDepartmentInfo) return singleDepartmentInfo;
      return departements[0];
    }
  });

  return (
    <>
      <DropDown
        key={"department_id"}
        label="Select Department"
        options={
          departements?.map((item) => ({
            text: item.name,
            value: item.id,
          })) || []
        }
        onChange={(item) => {
          const singleDepartmentInfo = departements?.find(
            (eDepartment) => eDepartment.id === item.value
          );
          setCurrentDepartment(singleDepartmentInfo);
        }}
        name="department_id"
        defaultValue={employeeInfo?.department_id}
      />

      {currentDepartment ? (
        <DropDown
          name="designation"
          key="Designation"
          label={
            employeeInfo && employeeInfo.employee_type === "Faculty"
              ? "Designation"
              : employeeID === "add-faculty"
              ? "Designation"
              : "Job Title"
          }
          options={
            currentDepartment.designation
              ?.split(",")
              .map((item) => ({ text: item.trim(), value: item.trim() })) || [
              { text: "helo", value: "hi" },
            ]
          }
          defaultValue={
            employeeInfo?.designation?.trim() ||
            currentDepartment?.designation.split(",")[0]
          }
        />
      ) : null}
      <DropDown
        name="authority"
        label="Authority"
        options={employeeAuthority.map((item) => ({
          text: item.name,
          value: item.score,
        }))}
        defaultValue={employeeInfo?.authority}
      />
    </>
  );
}
