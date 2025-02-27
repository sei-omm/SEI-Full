"use client";

import Button from "@/components/Button";
import Tabs from "@/components/Tabs";
import axios from "axios";
import Image from "next/image";
import React, { Suspense } from "react";
import { CiLogout } from "react-icons/ci";
import { useQuery } from "react-query";
import HandleSuspence from "@/components/HandleSuspence";
import { IEmployee, ISuccess } from "@/types";
import Informations from "@/components/Account/Informations";
import { InfoLayout } from "@/components/Account/InfoLayout";
import { useSearchParams } from "next/navigation";
import Documentation from "@/components/Account/Documentation";
import SalaryInfo from "@/components/Account/SalaryInfo";
import PaySlipComp from "@/components/Account/PaySlipComp";
import LeaveRequest from "@/components/Account/LeaveRequest";
import { useLogout } from "@/hooks/useLogout";
import { IoOpenOutline } from "react-icons/io5";
import Link from "next/link";
import Appraisal from "@/components/Account/Appraisal";
import AppraisalForm from "@/components/Account/AppraisalForm";
import TranningList from "@/components/Account/TranningList";
import { BASE_API } from "@/app/constant";
import LoadingLayout from "../LoadingLayout";
import OtherLeaves from "../Account/OtherLeaves";

const fetchEmployeeInfo = async (employeeID: string | null) => {
  const response = await axios.get(BASE_API + "/employee/" + employeeID);
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
              {data?.data[0].designation}
            </div>
          </div>

          <div className="absolute right-6 bottom-20 flex items-center gap-3">
            {data?.data[0].access_to_crm ? (
              <Link href={"/dashboard"}>
                <Button className="!bg-transparent !text-black !shadow-none !border flex items-center gap-2">
                  <span>Open Crm</span>
                  <IoOpenOutline />
                </Button>
              </Link>
            ) : null}

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
                name: "My Leave",
                slug: "/account/?tab=leave-request",
              },
              {
                name: "Others Leave",
                slug: "/account/?tab=other-leave",
              },
              {
                name: "My Appraisals",
                slug: "/account/?tab=appraisal",
              },
              {
                name: "Pending Appraisals",
                slug: "/account/?tab=otherapr",
              },
              {
                name: "Tranning Requirement",
                slug: "/account/?tab=tranning",
              },
            ]}
          />
        </div>

        {searchParams.get("tab") === "informations" && (
          <Suspense fallback={<LoadingLayout />}>
            <Informations employee_info={data?.data[0]} />
          </Suspense>
        )}
        {searchParams.get("tab") === "documentation" && (
          <Suspense fallback={<LoadingLayout />}>
            <Documentation employeeType={data?.data[0].employee_type} />
          </Suspense>
        )}
        {searchParams.get("tab") === "salary-information" && (
          <Suspense fallback={<LoadingLayout />}>
            <SalaryInfo employee_info={data?.data[0]} />
          </Suspense>
        )}
        {searchParams.get("tab") === "payslip" && (
          <Suspense fallback={<LoadingLayout />}>
            <PaySlipComp employee_info={data?.data[0]} />
          </Suspense>
        )}
        {searchParams.get("tab") === "leave-request" && (
          <Suspense fallback={<LoadingLayout />}>
            <LeaveRequest />
          </Suspense>
        )}
        {searchParams.get("tab") === "appraisal" && (
          <Suspense fallback={<LoadingLayout />}>
            <Appraisal type="own" />
          </Suspense>
        )}
        {searchParams.get("tab") === "otherapr" && (
          <Suspense fallback={<LoadingLayout />}>
            <Appraisal type="others" />
          </Suspense>
        )}
        {searchParams.get("tab") === "appraisalform" && (
          <Suspense fallback={<LoadingLayout />}>
            <AppraisalForm />
          </Suspense>
        )}
        {searchParams.get("tab") === "tranning" && (
          <Suspense fallback={<LoadingLayout />}>
            <TranningList />
          </Suspense>
        )}
        {searchParams.get("tab") === "other-leave" && (
          <Suspense fallback={<LoadingLayout />}>
            <OtherLeaves />
          </Suspense>
        )}
      </div>
    </HandleSuspence>
  );
}
