"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { RiSettings3Line } from "react-icons/ri";
import { MdOutlineDateRange } from "react-icons/md";
import { FaPeopleRoof } from "react-icons/fa6";
import Image from "next/image";
import { RxDot } from "react-icons/rx";
import {
  TbCategory2,
  TbReportSearch,
} from "react-icons/tb";
import { AiOutlineDeploymentUnit } from "react-icons/ai";
import { GoDiscussionOutdated, GoSidebarCollapse } from "react-icons/go";
import { FaRegListAlt } from "react-icons/fa";
// import { SiAmazonpay } from "react-icons/si";
import { IoPersonAddOutline } from "react-icons/io5";

const sidebarOptions = [
  {
    id: 1,
    icon: null,
    name: "HR Management",
    slug: "#",
    subMenu: [
      {
        id: "1-1",
        icon: <FaPeopleRoof />,
        name: "Manage Employee",
        slug: "/dashboard/hr-module/manage-employee",
      },
      {
        id: "1-2",
        icon: <AiOutlineDeploymentUnit />,
        name: "Department",
        slug: "/dashboard/hr-module/department",
      },
      {
        id: "1-3",
        icon: <MdOutlineDateRange />,
        name: "Attendance",
        slug: "/dashboard/hr-module/employee-attendance",
      },
      {
        id: "1-4",
        icon: <GoDiscussionOutdated />,
        name: "Leave Management",
        slug: "/dashboard/hr-module/leave-management",
      },
      {
        id: "1-5",
        icon: <FaRegListAlt />,
        name: "Job Posting",
        slug: "/dashboard/hr-module/job-posting",
      },
      // {
      //   id: "1-6",
      //   icon: <SiAmazonpay />,
      //   name: "Payrole",
      //   slug: "/dashboard/hr-module/payrole",
      // },
    ],
  },

  {
    id: 2,
    icon: null,
    name: "Course Management",
    slug: "#",
    subMenu: [
      {
        id: "2-1",
        icon: <TbCategory2 />,
        name: "Course",
        slug: "/dashboard/course/manage-course",
      },
      // {
      //   id: "2-2",
      //   icon: <TbCategory2 />,
      //   name: "Schedule Course",
      //   slug: "/dashboard/course/schedule-course",
      // },
    ],
  },

  {
    id: 4,
    icon: null,
    name: "Admission Management",
    slug: "#",
    subMenu: [
      {
        id: "4-1",
        icon: <IoPersonAddOutline />,
        name: "Manage Admission",
        slug: "/dashboard/admission",
      },
    ],
  },
  {
    id: 3,
    icon: null,
    name: "Reports Management",
    slug: "#",
    subMenu: [
      {
        id: "3-1",
        icon: <TbReportSearch />,
        name: "Admission Reports",
        slug: "/dashboard/report/admission",
      },
      {
        id: "3-2",
        icon: <TbReportSearch />,
        name: "DOB Reports",
        slug: "/dashboard/report/dob",
      },
      {
        id: "3-3",
        icon: <TbReportSearch />,
        name: "DGS & INDOS Reports",
        slug: "/dashboard/report/dgs",
      },
      {
        id : "3-4",
        icon : <TbReportSearch />,
        name : "Course Trend Report",
        slug : "/dashboard/report/course-trend-report"
      }
    ],
  },
  {
    id: 3,
    icon: null,
    name: "Settings Management",
    slug: "#",
    subMenu: [
      {
        id: "3-1",
        icon: <RiSettings3Line />,
        name: "Settings",
        slug: "/dashboard/settings/company-details",
      },
    ],
  },
];

//selected item color #E4E6E9

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapse, setIsCollapse] = useState(false);

  // const [collapseSubmenuIndex, setCollapseSubmenuIndex] = useState(-1);

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
        {sidebarOptions.map((option) => (
          <li key={option.id}>
            <Link
              // onClick={
              //   option.subMenu
              //     ? () =>
              //         setCollapseSubmenuIndex((preIndex) =>
              //           preIndex === index ? -1 : index
              //         )
              //     : () => {}
              // }
              href={option.slug}
              className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                option.subMenu ? "" : "hover:bg-[#E4E6E9]"
              } ${
                pathname.includes(option.slug) && !option.subMenu
                  ? "bg-[#E4E6E9]"
                  : "bg-transparent"
              } `}
            >
              <div className="flex items-center gap-x-2">
                {option.icon}
                <span
                  className={`text-xs font-semibold uppercase text-gray-500 ${
                    isCollapse ? "hidden" : "block"
                  }`}
                >
                  {option.name}
                </span>
              </div>
              {/* {option.subMenu ? (
                <IoIosArrowDown
                  className={`${
                    collapseSubmenuIndex === index ? "rotate-180" : "rotate-0"
                  } transition-all duration-300`}
                />
              ) : null} */}
            </Link>

            {/* ${
                  collapseSubmenuIndex === index && isCollapse === false
                    ? "max-h-[55rem]"
                    : "max-h-[55rem]"
                } */}

            {option.subMenu ? (
              <ul
                className={`w-full ml-4 overflow-hidden transition-all duration-300`}
              >
                {option.subMenu.map((submenuInfo) => (
                  <li key={submenuInfo.id}>
                    <Link
                      href={submenuInfo.slug}
                      className={`flex items-center text-[0.775rem] font-semibold gap-x-3 py-2 px-3 rounded-lg hover:bg-[#E4E6E9] ${
                        pathname.includes(submenuInfo.slug)
                          ? "bg-[#E4E6E9]"
                          : "bg-transparent"
                      }`}
                    >
                      {submenuInfo.icon ?? <RxDot size={20} />}
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
