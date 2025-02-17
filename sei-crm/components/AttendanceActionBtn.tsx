"use client";

import { ChangeEvent, useState } from "react";

interface IProps {
  // employee_id: number;
  value: string;
  // date: string;
  onChange: (option: string) => void;
}

// type TActions = "Present" | "Absent" | "Half Day" | "Sunday" | "Holiday";

export default function AttendanceActionBtn({
  value,
  // employee_id,
  // date,
  onChange,
}: IProps) {
  const [currentValue, setCurrentValue] = useState<string>(value);

  function handleActions(event: ChangeEvent<HTMLSelectElement> | undefined) {
    if (event) {
      onChange(event.currentTarget.value);
      setCurrentValue(event.currentTarget.value);
    }
    return;
    // openDialog();
    // startTransition(async () => {
    //   const respones = await setAttendanceStatus(
    //     employee_id,
    //     event?.currentTarget.value as any,
    //     date
    //   );
    //   if (!respones.success) {
    //     setErrMsg(respones.message);
    //   }
    //   closeDialog();
    // });
  }

  return (
    // <div className="flex flex-col gap-y-2 group/items">
    //   <span className="hidden">{isPending}</span>
    //   <TagsBtn
    //     onClick={() => handleActions("Present")}
    //     className={`${
    //       value === "Present" ? "flex" : "hidden"
    //     } group-hover/items:flex`}
    //     type="SUCCESS"
    //   >
    //     Present
    //   </TagsBtn>

    //   <TagsBtn
    //     onClick={() => handleActions("Absent")}
    //     className={`${
    //       value === "Absent" ? "flex" : "hidden"
    //     } group-hover/items:flex`}
    //     type="FAILED"
    //   >
    //     Absent
    //   </TagsBtn>

    //   <TagsBtn
    //     onClick={() => handleActions("Sunday")}
    //     className={`${
    //       value === "Sunday" ? "flex" : "hidden"
    //     } group-hover/items:flex`}
    //     type="FAILED"
    //   >
    //     Sunday
    //   </TagsBtn>

    //   <TagsBtn
    //     onClick={() => handleActions("Holiday")}
    //     className={`${
    //       value === "Holiday" ? "flex" : "hidden"
    //     } group-hover/items:flex`}
    //     type="PENDING"
    //   >
    //     Holiday
    //   </TagsBtn>

    //   <TagsBtn
    //     onClick={() => handleActions("Half Day")}
    //     className={`${
    //       value === "Half Day" ? "flex" : "hidden"
    //     } group-hover/items:flex`}
    //     type="FAILED"
    //   >
    //     Half Day
    //   </TagsBtn>

    //   <TagsBtn
    //     className={`${
    //       value === "Pending" ? "flex" : "hidden"
    //     } group-hover/items:hidden`}
    //     type="PENDING"
    //   >
    //     Pending
    //   </TagsBtn>
    // </div>

    <select
      className={`cursor-pointer outline-none font-semibold *:font-semibold ${
        currentValue === "Present"
          ? "text-green-700"
          : currentValue === "Absent" ||
            currentValue === "Sunday" ||
            currentValue === "Holiday"
          ? "text-red-600"
          : currentValue === "Pending"
          ? "text-yellow-600"
          : "text-gray-500"
      }`}
      onChange={handleActions}
    >
      {currentValue === "Not Employed" ? (
        <option selected disabled>
          Not Avilable
        </option>
      ) : (
        <>
          <option
            selected={currentValue === "Pending"}
            className="font-normal"
            disabled
            value={"Pending"}
          >
            Pending
          </option>
          <option
            selected={currentValue === "Present"}
            className="text-green-700"
            value={"Present"}
          >
            Present
          </option>
          <option
            selected={currentValue === "Absent"}
            className="text-red-700"
            value={"Absent"}
          >
            Absent
          </option>
          <option
            selected={currentValue === "Half Day"}
            className="text-yellow-600"
            value={"Half Day"}
          >
            Half Day
          </option>
          <option
            selected={currentValue === "Sunday"}
            className="text-red-700"
            value={"Sunday"}
          >
            Sunday
          </option>
          <option
            selected={currentValue === "Holiday"}
            className="text-red-700"
            value={"Holiday"}
          >
            Holiday
          </option>
        </>
      )}
    </select>
  );
}
