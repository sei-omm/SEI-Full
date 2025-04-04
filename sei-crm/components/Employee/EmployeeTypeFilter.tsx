"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DropDown from "../DropDown";
import Campus from "../Campus";

export default function EmployeeTypeFilter() {
  const route = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleDropDownChange(key: string, value: string) {
    const urlSearchParams = new URLSearchParams(searchParams);

    if (value === "-1") {
      urlSearchParams.delete(key);
    } else {
      urlSearchParams.set(key, value);
    }

    route.push(`${pathname}?${urlSearchParams.toString()}`);
  }

  return (
    <form className="flex items-center gap-5">
      <DropDown
        onChange={(item) => handleDropDownChange("employee_type", item.value)}
        label=""
        options={[
          { text: "All", value: "-1" },
          { text: "Faculty", value: "Faculty" },
          { text: "Office Staff", value: "Office Staff" },
        ]}
        defaultValue={searchParams.get("employee_type") || "-1"}
      />

      <Campus
        label={undefined}
        onChange={(item) => handleDropDownChange("institute", item.value)}
      />
    </form>
  );
}
