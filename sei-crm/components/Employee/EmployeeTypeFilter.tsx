"use client";

import { usePathname, useRouter } from "next/navigation";
import DropDown from "../DropDown";

export default function EmployeeTypeFilter() {
  const route = useRouter();
  const pathname = usePathname();
  return (
    <DropDown
      onChange={(item) => {
        if (item.value === "All") {
          route.push(pathname);
        } else {
          route.push(`${pathname}?type=${item.value.replace(" ", "+")}`);
        }
      }}
      label=""
      options={[
        { text: "All", value: "All" },
        { text: "Faculty", value: "Faculty" },
        { text: "Office Staff", value: "Office Staff" },
      ]}
      name=""
    />
  );
}
