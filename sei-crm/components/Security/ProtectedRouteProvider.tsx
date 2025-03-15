"use client";

import { redirect, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TSideBar } from "@/types";
import { useDispatch } from "react-redux";
import { setSideBar } from "@/redux/slices/sidebar.slice";
import LoadingLayout from "../LoadingLayout";

interface IProps {
  children: React.ReactNode;
}

export const sidebarOptions: TSideBar[] = [
  {
    id: "1",
    icon: null,
    name: "HR Management",
    slug: "#",
    subMenu: [
      {
        id: "1-1",
        icon: "FaPeopleRoof",
        name: "Manage Employee",
        slug: "/dashboard/hr-module/manage-employee",
      },
      {
        id: "1-2",
        icon: "AiOutlineDeploymentUnit",
        name: "Department & Designation",
        slug: "/dashboard/hr-module/department",
      },
      {
        id: "1-3",
        icon: "MdOutlineDateRange",
        name: "Attendance",
        slug: "/dashboard/hr-module/employee-attendance",
      },
      {
        id: "1-4",
        icon: "GoDiscussionOutdated",
        name: "Leave Management",
        slug: "/dashboard/hr-module/leave-management?tab=details",
      },
      {
        id: "1-5",
        icon: "FaRegListAlt",
        name: "Job Posting",
        slug: "/dashboard/hr-module/job-posting",
      },
      {
        id: "1-6",
        icon: "IoFileTrayOutline",
        name: "Compliance Record",
        slug: "/dashboard/hr-module/compliance-record",
      },
      {
        id: "1-7",
        icon: "GoStack",
        name: "Manage Payscale",
        slug: "/dashboard/hr-module/manage-payscale",
      },
      {
        id: "1-8",
        icon: "MdOutlineHolidayVillage",
        name: "Holiday Management",
        slug: "/dashboard/hr-module/holiday-management",
      },
      {
        id: "1-9",
        icon: "IoMdSpeedometer",
        name: "APR Management",
        slug: "/dashboard/hr-module/performance-management",
      },
      {
        id: "1-10",
        icon: "MdAddTask",
        name: "Training Requirement",
        slug: "/dashboard/hr-module/tranning-requirement",
      },
    ],
  },

  {
    id: "7",
    icon: null,
    name: "Inventory Management",
    slug: "#",
    subMenu: [
      {
        id: "7-1",
        icon: "IoListSharp",
        name: "Inventory List",
        slug: "/dashboard/inventory/inventory-list",
      },
      {
        id: "7-2",
        icon: "BsReverseLayoutTextSidebarReverse",
        name: "Maintenance Record",
        slug: "/dashboard/inventory/maintence-record",
      },
      {
        id: "7-3",
        icon: "GrHostMaintenance",
        name: "Planned Maintenance System",
        slug: "/dashboard/inventory/planned-maintenance-system",
      },
    ],
  },

  {
    id: "8",
    icon: null,
    name: "Vendor Management",
    slug: "#",
    subMenu: [
      {
        id: "8-3",
        icon: "GrVend",
        name: "Vendor",
        slug: "/dashboard/vendor",
      },
    ],
  },

  {
    id: "2",
    icon: null,
    name: "Course Management",
    slug: "#",
    subMenu: [
      {
        id: "2-1",
        icon: "TbCategory2",
        name: "Course",
        slug: "/dashboard/course/manage-course",
      },
      {
        id: "2-2",
        icon: "MdOutlineDateRange",
        name: "Time Table",
        slug: "/time-table",
      },
    ],
  },

  {
    id: "3",
    icon: null,
    name: "Admission Management",
    slug: "#",
    subMenu: [
      {
        id: "3-1",
        icon: "IoPersonAddOutline",
        name: "Manage Admission",
        slug: "/dashboard/admission",
      },
      {
        id: "3-2",
        icon: "MdOutlineAddBox",
        name: "Create Admission",
        slug: "/dashboard/create-admission",
      },
    ],
  },
  {
    id: "9",
    icon: null,
    name: "Refund Management",
    slug: "#",
    subMenu: [
      {
        id: "9-1",
        icon: "RiRefundLine",
        name: "Manage Refund",
        slug: "/dashboard/manage-refund",
      },
    ],
  },
  {
    id: "4",
    icon: null,
    name: "Library Management",
    slug: "#",
    subMenu: [
      {
        id: "4-1",
        icon: "LiaAddressBookSolid",
        name: "Books Issue Report",
        slug: "/dashboard/library/books-issue",
      },
      {
        id: "4-2",
        icon: "LiaSwatchbookSolid",
        name: "Physical Library Books",
        slug: "/dashboard/library/phy-books",
      },
      {
        id: "4-3",
        icon: "IoLibraryOutline",
        name: "Manage Library",
        slug: "/dashboard/library/item",
      },
      {
        id: "4-4",
        icon: "MdOutlineSubject",
        name: "Manage Library Subjects",
        slug: "/dashboard/library/subject",
      },
    ],
  },
  {
    id: "5",
    icon: null,
    name: "Reports Management",
    slug: "#",
    subMenu: [
      {
        id: "5-1",
        icon: "TbReportSearch",
        name: "Admission Reports",
        slug: "/dashboard/report/admission",
      },
      {
        id: "5-2",
        icon: "TbReportSearch",
        name: "DOB Reports",
        slug: "/dashboard/report/dob",
      },
      {
        id: "5-3",
        icon: "TbReportSearch",
        name: "DGS & INDOS Reports",
        slug: "/dashboard/report/dgs",
      },
      {
        id: "5-4",
        icon: "TbReportSearch",
        name: "Batch Trend Report",
        slug: "/dashboard/report/course-trend-report",
      },
      {
        id: "5-5",
        icon: "TbReportSearch",
        name: "Batch Report",
        slug: "/dashboard/report/batch",
      },
      {
        id: "5-6",
        icon: "TbReportSearch",
        name: "Receipt Report",
        slug: "/dashboard/report/receipt",
      },
      {
        id: "5-7",
        icon: "TbReportSearch",
        name: "Occupancy Report",
        slug: "/dashboard/report/occupancy",
      },
      {
        id: "5-8",
        icon: "TbReportSearch",
        name: "Refund Report",
        slug: "/dashboard/report/refund",
      },
      {
        id: "5-9",
        icon: "TbReportSearch",
        name: "Inventory Report",
        slug: "/dashboard/report/inventory",
      },
      {
        id: "5-11",
        icon: "TbReportSearch",
        name: "Pms Report",
        slug: "/dashboard/report/pms",
      },
      {
        id: "5-10",
        icon: "TbReportSearch",
        name: "Time Table Report",
        slug: "/time-table/report",
      },
    ],
  },
  {
    id: "10",
    icon: null,
    name: "Website Management",
    slug: "#",
    subMenu: [
      {
        id: "10-1",
        icon: "CgWebsite",
        name: "Notice Board",
        slug: "/dashboard/website-management/notice-board",
      },
    ],
  },
  {
    id: "6",
    icon: null,
    name: "Settings Management",
    slug: "#",
    subMenu: [
      {
        id: "6-1",
        icon: "RiSettings3Line",
        name: "Settings",
        slug: "/dashboard/settings/permission-management",
      },
    ],
  },
];

export default function ProtectedRouteProvider({ children }: IProps) {
  const pathname = usePathname();

  const [process, setProcess] = useState<"loading" | "success" | "failed">(
    "loading"
  );

  const dispatch = useDispatch();

  useEffect(() => {
    const permission = localStorage.getItem("permissions");
    if (permission) {
      const parsedPermissions = JSON.parse(permission);

      const newSidebar: TSideBar[] = [];
      let isCurrentPathExist = false;

      sidebarOptions.forEach((pItem) => {
        const newSubmenu = pItem.subMenu?.filter((submenu) => {
          if (parsedPermissions[submenu.id] !== undefined) {
            if (isCurrentPathExist === false) {
              isCurrentPathExist = submenu.slug === pathname;
            }
            return true;
          }
        });

        if (newSubmenu !== undefined && newSubmenu.length > 0) {
          newSidebar.push({
            id: pItem.id,
            icon: pItem.icon,
            name: pItem.name,
            slug: pItem.slug,
            subMenu: newSubmenu,
          });
        }
      });

      if (
        !isCurrentPathExist &&
        pathname !== "/dashboard" &&
        pathname !== "/account" &&
        pathname !== "/auth/login" &&
        pathname !== "/error" &&
        pathname !== "/dashboard/hr-module/performance-management/view" &&
        !pathname.includes("/dashboard/hr-module/manage-employee/")
      ) {
        setProcess("failed");
      } else {
        setProcess("success");
        dispatch(setSideBar(newSidebar));
      }
    } else {
      setProcess("success");
    }
  }, []);

  if (process === "loading") return <LoadingLayout />;

  if (process === "failed") {
    return redirect("/error?status=403");
  }

  return <>{children}</>;
}
