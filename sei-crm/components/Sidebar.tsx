"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import Image from "next/image";
import { RxDot } from "react-icons/rx";
import { GoSidebarCollapse } from "react-icons/go";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

import { FaRegListAlt } from "react-icons/fa";
// import { SiAmazonpay } from "react-icons/si";
import {
  IoFileTrayOutline,
  IoLibraryOutline,
  IoListSharp,
  IoPersonAddOutline,
} from "react-icons/io5";
import { GrHostMaintenance, GrVend } from "react-icons/gr";
import { BsReverseLayoutTextSidebarReverse } from "react-icons/bs";
import { LiaAddressBookSolid, LiaSwatchbookSolid } from "react-icons/lia";
import { IoMdSpeedometer } from "react-icons/io";
import { CgWebsite } from "react-icons/cg";
import { GoDiscussionOutdated, GoStack } from "react-icons/go";

import { TbCategory2, TbReportSearch, TbSocial } from "react-icons/tb";
import { AiOutlineDeploymentUnit } from "react-icons/ai";
import { FaPeopleRoof } from "react-icons/fa6";
import { RiBloggerLine, RiRefundLine, RiSettings3Line } from "react-icons/ri";
import {
  MdAddTask,
  MdOutlineAddBox,
  MdOutlineDateRange,
  MdOutlineHolidayVillage,
  MdOutlineSubject,
} from "react-icons/md";

const iconMap: Record<string, JSX.Element> = {
  FaPeopleRoof: <FaPeopleRoof />,
  AiOutlineDeploymentUnit: <AiOutlineDeploymentUnit />,
  MdOutlineDateRange: <MdOutlineDateRange />,
  GoDiscussionOutdated: <GoDiscussionOutdated />,
  FaRegListAlt: <FaRegListAlt />,
  IoFileTrayOutline: <IoFileTrayOutline />,
  GoStack: <GoStack />,
  MdOutlineHolidayVillage: <MdOutlineHolidayVillage />,
  IoMdSpeedometer: <IoMdSpeedometer />,
  MdAddTask: <MdAddTask />,
  IoListSharp: <IoListSharp />,
  BsReverseLayoutTextSidebarReverse: <BsReverseLayoutTextSidebarReverse />,
  GrHostMaintenance: <GrHostMaintenance />,
  GrVend: <GrVend />,
  TbCategory2: <TbCategory2 />,
  IoPersonAddOutline: <IoPersonAddOutline />,
  MdOutlineAddBox: <MdOutlineAddBox />,
  RiRefundLine: <RiRefundLine />,
  LiaAddressBookSolid: <LiaAddressBookSolid size={16} />,
  LiaSwatchbookSolid: <LiaSwatchbookSolid size={16} />,
  IoLibraryOutline: <IoLibraryOutline />,
  MdOutlineSubject: <MdOutlineSubject />,
  TbReportSearch: <TbReportSearch />,
  CgWebsite: <CgWebsite />,
  RiSettings3Line: <RiSettings3Line />,
  RiBloggerLine : <RiBloggerLine />,
  TbSocial : <TbSocial />
};

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapse, setIsCollapse] = useState(false);

  const [currentExpandIndex, setCurrentExpandIndex] = useState(0);
  const sideBar = useSelector((state: RootState) => state.sidebar);

  const handleCollapseSidebar = () => {
    setIsCollapse(!isCollapse);
  };

  return (
    <aside
      className={`h-screen max-h-screen overflow-x-hidden overflow-y-auto ${
        isCollapse ? "max-w-16" : "min-w-64 max-w-72"
      } py-5 px-3 border-r-2 border-r-gray-100 sidebar_scrollbar`}
    >
      {/* Company Info */}
      <div className={"w-full px-3 relative"}>
        {isCollapse ? null : (
          <Image
            className="size-10 mr-2 object-contain p-2 bg-[#002649] float-left"
            src="/logo.png"
            alt="Logo"
            height={512}
            width={512}
          />
        )}

        <h2
          className={`text-sm font-semibold ${isCollapse ? "hidden" : "block"}`}
        >
          SEI Educational Trust CRM
        </h2>

        <div
          className={`absolute top-0 bottom-0 right-0 flex-center ${
            isCollapse ? "left-0 -right-1" : ""
          }`}
        >
          <GoSidebarCollapse
            onClick={handleCollapseSidebar}
            size={18}
            className={`${
              isCollapse ? "rotate-0" : "rotate-180"
            } cursor-pointer`}
          />
        </div>
      </div>
      <ul className={`space-y-2 mt-5 ${isCollapse ? "hidden" : "block"}`}>
        {sideBar.map((option, pIndex) => (
          <li key={option.id}>
            <button
              onClick={() =>
                setCurrentExpandIndex((prev) => (prev === pIndex ? -1 : pIndex))
              }
              className={`flex items-center justify-between w-full py-2 px-3 rounded-lg ${
                option.subMenu ? "" : "hover:bg-[#E4E6E9]"
              } ${
                pathname.includes(option.slug) && !option.subMenu
                  ? "bg-[#E4E6E9]"
                  : "bg-transparent"
              } relative`}
            >
              <div className="flex items-center gap-x-2">
                {option.icon && iconMap[option.icon]}
                <span
                  className={`text-xs font-semibold uppercase text-gray-500 ${
                    isCollapse ? "hidden" : "block"
                  }`}
                >
                  {option.name}
                </span>
              </div>

              <FaChevronDown
                size={13}
                className={`absolute right-0 top-2 ${
                  currentExpandIndex === pIndex ? "rotate-180" : "rotate-0"
                } transition-all duration-500`}
              />
            </button>

            {option.subMenu ? (
              <ul
                className={`w-full ml-4 overflow-hidden transition-all duration-300 ${
                  currentExpandIndex === pIndex ? "max-h-[555px]" : "max-h-0"
                }`}
              >
                {option.subMenu.map((submenuInfo) => (
                  <li key={submenuInfo.id}>
                    <Link
                      href={submenuInfo.slug}
                      className={`flex items-center text-[0.775rem] font-semibold gap-x-3 py-2 px-3 rounded-lg hover:bg-[#E4E6E9] ${
                        submenuInfo.slug.includes(pathname) &&
                        pathname !== "/dashboard"
                          ? "bg-[#E4E6E9]"
                          : "bg-transparent"
                      }`}
                    >
                      {submenuInfo.icon ? (
                        iconMap[submenuInfo.icon]
                      ) : (
                        <RxDot size={20} />
                      )}
                      <span className="tracking-widest">
                        {submenuInfo.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}
