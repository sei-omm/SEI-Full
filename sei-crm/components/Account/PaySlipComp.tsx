import React from "react";
import { InfoLayout } from "./InfoLayout";
import { IEmployee } from "@/types";
import DateInput from "../DateInput";
import Button from "../Button";

interface IProps {
  employee_info: IEmployee | undefined;
}

// const getPayslipDateRange = (joiningDate: string) => {
//   const joining = new Date(joiningDate);
//   const today = new Date();

//   // Set minimum date to the first day of the joining month
//   const minDate = new Date(joining.getFullYear(), joining.getMonth(), 1);

//   // Set maximum date to the first day of the current month
//   const maxDate = new Date(today.getFullYear(), today.getMonth(), 1);

//   return {
//     minDate: minDate.toISOString().split("T")[0], // Format: YYYY-MM-DD
//     maxDate: maxDate.toISOString().split("T")[0], // Format: YYYY-MM-DD
//   };
// };

export default function PaySlipComp({ employee_info }: IProps) {
  const joiningDate = employee_info?.joining_date;

  // Parse string date from DB into a Date object
  const employeeJoiningDate = new Date(joiningDate || "");

  // Current date
  const today = new Date();

  // Extract year and month for min and max
  const joiningYear = employeeJoiningDate.getFullYear();
  const joiningMonth = employeeJoiningDate.getMonth() + 1; // Convert to 1-indexed month

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // Convert to 1-indexed month

  // Helper function to format date as YYYY-MM
  const formatDate = (year: number, month: number) => {
    const monthString = month < 10 ? `0${month}` : `${month}`;
    return `${year}-${monthString}`;
  };

  const minDate = formatDate(joiningYear, joiningMonth);

  // Calculate maxDate as the previous month if the current month should not be selectable
  const maxDate =
    currentMonth === 1
      ? formatDate(currentYear - 1, 12)
      : formatDate(currentYear, currentMonth - 1);

  function handleSubmit() {
    console.log("Form submitted");
  }

  return (
    <>
      <InfoLayout>
        <h2 className="text-2xl font-semibold pb-6">Payslip</h2>
        <form action={handleSubmit} className="flex items-end gap-5">
          <div className="flex-grow">
            <DateInput
              label="Select Month"
              type="month"
              min={minDate}
              max={maxDate}
            />
          </div>
          <Button className="mb-2">Generate</Button>
        </form>
      </InfoLayout>
    </>
  );
}
