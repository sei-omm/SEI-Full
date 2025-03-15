import Tabs from "@/components/Tabs";
import { ITabItems } from "@/types";
import React from "react";

interface IProps {
  children: React.ReactNode;
}

const tabOptions: ITabItems[] = [
  {
    name: "Permission Management",
    slug: "/dashboard/settings/permission-management",
  },
];

export default function layout({ children }: IProps) {
  return (
    <div className="px-6 py-3">
      <Tabs tabs={tabOptions} />
      {children}
    </div>
  );
}
