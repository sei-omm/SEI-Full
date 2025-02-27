import Link from "next/link";
import React from "react";
import { TabMenuType } from "../type";

interface IProps {
  tabs: TabMenuType[];
  textSize ? : number;
}

export default function TabMenu({ tabs, textSize }: IProps) {
  return (
    <ul className="flex items-center flex-wrap gap-x-3 gap-y-5">
      {tabs.map((tab, index) => (
        <li key={index}>
          <Link
            style={{fontSize : textSize + "px"}}
            className={`border px-5 py-1 cursor-pointer ${
              tab.isSelected ? "bg-[#e9b858]" : ""
            } rounded-lg border-gray-600 font-medium`}
            href={tab.slug}
          >
            {tab.text}
          </Link>
        </li>
      ))}
    </ul>
  );
}
