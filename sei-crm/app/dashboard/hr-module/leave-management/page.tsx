import EmployeeLeaveDetails from "@/components/Leave/EmployeeLeaveDetails";
import LeaveRecheckBtns from "@/components/Leave/LeaveRecheckBtns";
import LeaveRequests from "@/components/Leave/LeaveRequests";
import Tabs from "@/components/Tabs";

interface IProps {
  searchParams: {
    tab: string;
    institute?: string;
  };
}

export default async function LeaveManagement({ searchParams }: IProps) {
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
      <LeaveRecheckBtns />
      {searchParams.tab === "request" ? (
        <LeaveRequests searchParams={searchParams} />
      ) : (
        <EmployeeLeaveDetails />
      )}
    </section>
  );
}
