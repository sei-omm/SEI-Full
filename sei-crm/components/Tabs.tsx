"use client";

import { ITabItems } from "@/types";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface IProps {
  tabs: ITabItems[];
  className?: string;
}

export default function Tabs({ tabs, className }: IProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className={`w-full ${className}`}>
      <ul className="bg-[#e4e6e9bb] flex items-center flex-wrap gap-y-3 px-4 py-2 rounded-lg">
        {tabs.map((tab, index) => (
          <li key={index}>
            <Link
              className={`block h-full text-sm py-2 px-5 font-semibold rounded-lg cursor-pointer ${
                pathname.includes(tab.slug) ||
                tab.slug.includes(searchParams.get("tab") || "")
                  ? "bg-white"
                  : "bg-transparent"
              } transition-all duration-500`}
              href={tab.slug}
            >
              {tab.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
