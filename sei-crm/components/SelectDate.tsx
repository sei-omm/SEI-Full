"use client";

import { useState } from "react";
import Select from "./Select";
import Input from "./Input";
import Button from "./Button";
import Link from "next/link";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const date = new Date();

function getMonthDetails() {
  const date = new Date();
  const year = date.getFullYear();
  const monthIndex = date.getMonth();

  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

  const todaysDate = date.getDate();

  return {
    totalDays: lastDayOfMonth.getDate(),
    monthName: months[monthIndex],
    todaysDate,
  };
}

interface IProps {
  searchParams: string;
}

export default function SelectDate({ searchParams }: IProps) {
  const sParams = new URLSearchParams(searchParams);
  const { monthName } = getMonthDetails();

  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();

  const [month, setMonth] = useState(
    months[parseInt(`${sParams.get("month")}`) - 1] ?? monthName
  );
  const [year, setYear] = useState(
    sParams.has("year")
      ? parseInt(`${sParams.get("year")}`)
      : date.getFullYear()
  );

  return (
    <div className="flex items-center gap-5">
      <Select
        className="!py-[3.5px]"
        label={month || ""}
        options={months}
        itemToLoad={(option, index) =>
          currentMonth < index + 1 && currentYear <= year ? null : (
            <span
              onClick={() => setMonth(option)}
              className={`block hover:bg-slate-200 px-2.5 text-sm py-2 font-semibold ${
                month === option ? "bg-slate-200" : ""
              }`}
            >
              {option}
            </span>
          )
        }
      />
      <Input
        onChange={(e) => setYear(parseInt(e.currentTarget.value))}
        className="!rounded-xl"
        hideLabel={true}
        placeholder="Year"
        type="number"
        defaultValue={year}
      />

      <Link href={`?month=${months.indexOf(month || "") + 1}&year=${year}`}>
        <Button>Filter</Button>
      </Link>
    </div>
  );
}
