import Tabs from "@/components/Tabs";
import { ITabItems } from "@/types";
import React from "react";

interface IProps {
  children: React.ReactNode;
}

const tabOptions: ITabItems[] = [
  {
    name: "Company Details",
    slug: "/dashboard/settings/company-details",
  },
  {
    name: "Permission Management",
    slug: "/dashboard/settings/permission-management",
  },
  // {
  //   name: "Integrations",
  //   slug: "/dashboard/settings/integrations",
  // },
  // {
  //   name: "Pipelines",
  //   slug: "/dashboard/settings/pipelines",
  // },
  // {
  //   name: "Templates",
  //   slug: "/dashboard/settings/templates",
  // },
  // {
  //   name: "Domain Setup",
  //   slug: "/dashboard/settings/domain-setup",
  // },
  // {
  //   name: "Tags",
  //   slug: "/dashboard/settings/tags",
  // },
  // {
  //   name: "Logos",
  //   slug: "/dashboard/settings/logos",
  // },
];

export default function layout({ children }: IProps) {
  return (
    <div className="px-6 py-3">
      <Tabs tabs={tabOptions} />
      {children}
    </div>
  );
}
