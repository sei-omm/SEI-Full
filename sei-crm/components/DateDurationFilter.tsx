import React from "react";
import DropDown from "./DropDown";
import DateInput from "./DateInput";
import Button from "./Button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function DateDurationFilter() {
  const searchParams = useSearchParams();
  const route = useRouter();
  const pathname = usePathname();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const searchParams = new URLSearchParams();
    searchParams.set("institute", `${formData.get("institute")}`);
    searchParams.set("from_date", `${formData.get("from_date")}`);
    searchParams.set("to_date", `${formData.get("to_date")}`);
    route.push(`${pathname}?${searchParams.toString()}`);
  };
  return (
    <form
      onSubmit={handleFormSubmit}
      className="flex items-end gap-5 *:flex-grow"
    >
      <DropDown
        name="institute"
        label="Campus"
        options={[
          { text: "Kolkata", value: "Kolkata" },
          { text: "Faridabad", value: "Faridabad" },
        ]}
        defaultValue={searchParams.get("institute") || "Kolkata"}
      />

      <DateInput
        required
        label="From Date"
        name="from_date"
        date={searchParams.get("from_date")}
      />

      <DateInput
        required
        label="To Date"
        name="to_date"
        date={searchParams.get("to_date")}
      />

      <div className="!mb-2 !flex-grow-0 flex items-center gap-5">
        <Button className="">Search</Button>
      </div>
    </form>
  );
}
