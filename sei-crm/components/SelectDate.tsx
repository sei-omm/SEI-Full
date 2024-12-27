"use client";

import Input from "./Input";
import Button from "./Button";
import DropDown from "./DropDown";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

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

// const date = new Date();

// function getMonthDetails() {
//   const date = new Date();
//   const year = date.getFullYear();
//   const monthIndex = date.getMonth();

//   const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

//   const todaysDate = date.getDate();

//   return {
//     totalDays: lastDayOfMonth.getDate(),
//     monthName: months[monthIndex],
//     todaysDate,
//   };
// }

export default function SelectDate() {

  const route = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // const currentMonth = date.getMonth() + 1;
  // const currentYear = date.getFullYear();

  // const seParams = useSearchParams();

  // const [month, setMonth] = useState(
  //   months[parseInt(`${sParams.get("month")}`) - 1] ?? monthName
  // );
  // const [year, setYear] = useState(
  //   sParams.has("year")
  //     ? parseInt(`${sParams.get("year")}`)
  //     : date.getFullYear()
  // );

  function handleSubmit(formData: FormData) {
    const urlSearchParams = new URLSearchParams();
    formData.forEach((value, key) => {
      if (value === "-1") return urlSearchParams.delete(key);
      urlSearchParams.set(key, value.toString());
    });

    route.push(`${pathname}?${urlSearchParams.toString()}`);
  }

  return (
    <form action={handleSubmit} className="flex items-center gap-5">
      <DropDown
        label=""
        options={[
          { text: "All", value: "-1" },
          { text: "Faculty", value: "Faculty" },
          { text: "Office Staff", value: "Office Staff" },
        ]}
        name="employee_type"
        defaultValue={searchParams.get("employee_type") || "-1"}
      />
      <DropDown
        label=""
        options={[
          { text: "All", value: "-1" },
          { text: "Kolkata", value: "Kolkata" },
          { text: "Faridabad", value: "Faridabad" },
        ]}
        name="institute"
        defaultValue={searchParams.get("institute") || "-1"}
      />
      <DropDown
        label=""
        name="month"
        options={months.map((month, index) => ({
          text: month,
          value: index + 1,
        }))}
        defaultValue={searchParams.get("month") || new Date().getMonth() + 1}
      />
      <Input
        name="year"
        className="!rounded-xl"
        hideLabel={true}
        placeholder="Year"
        type="number"
        defaultValue={searchParams.get("year") || new Date().getFullYear()}
      />

      <Button>Filter</Button>
    </form>
  );
}
