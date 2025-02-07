"use client";

import { useDoMutation } from "@/app/utils/useDoMutation";
import Button from "@/components/Button";
import DropDown from "@/components/DropDown";
import EmployeeLeaveDetails from "@/components/Leave/EmployeeLeaveDetails";
import LeaveRequests from "@/components/Leave/LeaveRequests";
import Tabs from "@/components/Tabs";

interface IProps {
  searchParams: {
    tab: string;
    institute?: string;
  };
}

export default async function LeaveManagement({ searchParams }: IProps) {
  const { isLoading, mutate } = useDoMutation();

  return (
    <section className="space-y-5">
      <Tabs
        tabs={[
          {
            name: "Employee Leave Details",
            slug: "/dashboard/hr-module/leave-management?tab=details",
          },
          {
            name: "Employee Leave Requests",
            slug: "/dashboard/hr-module/leave-management?tab=request",
          },
        ]}
      />
      <div className="flex items-center justify-between">
        <DropDown
          changeSearchParamsOnChange
          label="Choose Institute"
          name="institute"
          options={[
            {
              text: "Kolkata",
              value: "Kolkata",
            },
            {
              text: "Faridabad",
              value: "Faridabad",
            },
          ]}
          defaultValue={searchParams.institute}
        />

        <div className="flex items-center gap-4">
          <Button
            disabled={isLoading}
            loading={isLoading}
            onClick={() => {
              mutate({
                apiPath: "/hr/leave/add-earn-leave",
                method: "post",
              });
            }}
          >
            Recheck Earn Leaves
          </Button>
          <Button
            onClick={() => {
              mutate({
                apiPath: "/hr/leave/add-yearly-leave",
                method: "post",
              });
            }}
          >
            Recheck Leave Yearly
          </Button>
        </div>
      </div>
      {searchParams.tab === "request" ? (
        <LeaveRequests searchParams={searchParams} />
      ) : (
        <EmployeeLeaveDetails />
      )}
    </section>
  );
}
