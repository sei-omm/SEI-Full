"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DropDown from "../DropDown";

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
        name=""
      />
      <DropDown
        onChange={(item) => handleDropDownChange("institute", item.value)}
        label=""
        options={[
          { text: "All", value: "-1" },
          { text: "Kolkata", value: "Kolkata" },
          { text: "Faridabad", value: "Faridabad" },
        ]}
        name=""
      />
    </form>
  );
}
