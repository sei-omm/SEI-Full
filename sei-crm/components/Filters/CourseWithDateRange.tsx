"use client";

import Button from "../Button";
import DropDown from "../DropDown";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DateInput from "../DateInput";
import Campus from "../Campus";

export default function CourseWithDateRange() {
  const route = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const urlSearchParams = new URLSearchParams();
    formData.forEach((value, key) => {
      urlSearchParams.set(key, value.toString());
    });
    route.push(`${pathname}?${urlSearchParams.toString()}`);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="w-full flex items-end justify-between *:flex-grow gap-x-5 pb-5"
    >
      <Campus />
      <DropDown
        key={"course_type"}
        name="course_type"
        label="Course Type"
        options={[
          { text: "DGS Approved", value: "DGS Approved" },
          { text: "Value Added", value: "Value Added" },
        ]}
        defaultValue={searchParams.get("course_type") || "DGS Approved"}
      />

      <DateInput
        name="start_date"
        label="Start Date"
        date={searchParams.get("start_date")}
      />
      <DateInput
        name="end_date"
        label="End Date"
        date={searchParams.get("end_date")}
      />

      <div className="mb-2">
        <Button>Search</Button>
      </div>
    </form>
  );
}
