"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { CiCircleList, CiSquareInfo } from "react-icons/ci";
import { GoHome } from "react-icons/go";
import { MdOutlineAccountCircle } from "react-icons/md";

const mobileNavigationPanel = [
  {
    id: 1,
    icon: <GoHome size={18} />,
    title: "Home",
    path: "/",
  },
  {
    id: 2,
    icon: <CiCircleList size={18} />,
    title: "Courses",
    path: "/our-courses/kolkata",
  },
  {
    id: 3,
    icon: <CiSquareInfo size={18} />,
    title: "About Us",
    path: "/about-us",
  },
  {
    id: 4,
    icon: <MdOutlineAccountCircle size={18} />,
    title: "My Account",
    path: "/account",
  },
];

export default function MobileNavigation() {
  const pathname = usePathname();
  const isCurrentPath = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/')
  };
  
  return (
    <div className="w-full">
      <ul className="main-layout h-16 rounded-xl bg-[#E9B858] overflow-hidden shadow-2xl border border-gray-600 flex items-center">
        {mobileNavigationPanel.map((item) => (
          <li
            key={item.id}
            className={`flex-grow h-full ${
              isCurrentPath(item.path) ? "bg-[#e958d644]" : ""
            }`}
          >
            <Link
              href={item.path}
              className="flex-center block flex-col gap-2 h-full"
            >
              {item.icon}
              <span className="text-xs">{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
