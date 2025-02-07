"use client";

import Button from "@/components/Button";
import Tabs from "@/components/Tabs";
import axios from "axios";
import Image from "next/image";
import React from "react";
import { CiLogout } from "react-icons/ci";
import { useQuery } from "react-query";
import { BASE_API } from "../constant";
import HandleSuspence from "@/components/HandleSuspence";
import { IEmployee, ISuccess } from "@/types";
import Informations from "@/components/Account/Informations";
import { InfoLayout } from "@/components/Account/InfoLayout";
import { useSearchParams } from "next/navigation";
import Documentation from "@/components/Account/Documentation";
import SalaryInfo from "@/components/Account/SalaryInfo";
import PaySlipComp from "@/components/Account/PaySlipComp";
import LeaveRequest from "@/components/Account/LeaveRequest";
import { getAuthToken } from "../utils/getAuthToken";
import { useLogout } from "@/hooks/useLogout";
import { IoOpenOutline } from "react-icons/io5";
import Link from "next/link";
import Appraisal from "@/components/Account/Appraisal";
import AppraisalForm from "@/components/Account/AppraisalForm";

const fetchEmployeeInfo = async (employeeID: string | null) => {
  let headers: any = {
    "Content-Type": "application/json",
  };

  if (!employeeID) {
    headers = {
      "Content-Type": "application/json",
      ...getAuthToken(),
    };
  }

  const response = await axios.get(BASE_API + "/employee/" + employeeID, {
    headers,
  });
  return response.data;
};

export default function Account() {
  const { isPending, handleLogoutBtn } = useLogout();
  const { data, isFetching, error } = useQuery<ISuccess<IEmployee[]>>({
    queryKey: ["get-employee-info"],
    queryFn: () => fetchEmployeeInfo(null),
    cacheTime: 0,
  });

  const searchParams = useSearchParams();

  return (
    <HandleSuspence
      isLoading={isFetching}
      error={error}
      dataLength={data?.data.length}
    >
      <div className="w-full flex-grow flex items-center justify-start flex-col space-y-5 py-5">
        <InfoLayout>
          <div className="size-24 bg-white rounded-full border-2 border-yellow-500 card-shdow overflow-hidden">
            <Image
              className="size-full object-cover"
              src={data?.data[0].profile_image || "/employee-sample.jpg"}
              alt="Logo"
              width={1280}
              height={1280}
            />
          </div>

          <div className="space-y-1">
            <h2 className="font-semibold text-xl">{data?.data[0].name}</h2>
            <div className="bg-[#E9F0FD] inline-block text-xs text-[#7199E9] px-2 py-1 rounded-sm font-semibold">
              {data?.data[0].job_title}
            </div>
          </div>

          <div className="absolute right-6 bottom-20 flex items-center gap-3">
            <Link href={"/dashboard"}>
              <Button className="!bg-transparent !text-black !shadow-none !border flex items-center gap-2">
                <span>Open Crm</span>
                <IoOpenOutline />
              </Button>
            </Link>
            <Button
              onClick={() => {
                if (!confirm("Are you sure you want to logout ?")) return;
                handleLogoutBtn();
              }}
              loading={isPending}
              disabled={isPending}
              className="flex items-center gap-2"
            >
              <span>Logout</span>
              <CiLogout className="rotate-180" />
            </Button>
          </div>
        </InfoLayout>

        <div className="w-[60%]">
          <Tabs
            tabs={[
              {
                name: "Informations",
                slug: "/account/?tab=informations",
              },
              {
                name: "Documentation",
                slug: "/account/?tab=documentation",
              },
              {
                name: "Salary Information",
                slug: "/account/?tab=salary-information",
              },
              {
                name: "Payslip",
                slug: "/account/?tab=payslip",
              },
              {
                name: "Leave",
                slug: "/account/?tab=leave-request",
              },
              {
                name: "My Appraisals",
                slug: "/account/?tab=appraisal",
              },
              {
                name: "Pending Appraisals",
                slug: "/account/?tab=otherapr",
              },
            ]}
          />
        </div>

        {searchParams.get("tab") === "informations" && (
          <Informations employee_info={data?.data[0]} />
        )}
        {searchParams.get("tab") === "documentation" && (
          <Documentation employeeType={data?.data[0].employee_type} />
        )}
        {searchParams.get("tab") === "salary-information" && (
          <SalaryInfo employee_info={data?.data[0]} />
        )}
        {searchParams.get("tab") === "payslip" && (
          <PaySlipComp employee_info={data?.data[0]} />
        )}
        {searchParams.get("tab") === "leave-request" && <LeaveRequest />}
        {searchParams.get("tab") === "appraisal" && <Appraisal type="own" />}
        {searchParams.get("tab") === "otherapr" && <Appraisal type="others" />}
        {searchParams.get("tab") === "appraisalform" && <AppraisalForm />}
      </div>
    </HandleSuspence>
  );
}
