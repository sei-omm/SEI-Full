import LeaveDetails from "@/components/Leave/LeaveDetails";
import LeaveRequests from "@/components/Leave/LeaveRequests";
import Tabs from "@/components/Tabs";

interface IProps {
  searchParams: any;
}

export default async function page({ searchParams }: IProps) {
  return (
    <section>
      <Tabs
        tabs={[
          {
            name: "Leave Details",
            slug: "/dashboard/hr-module/leave-management?tab=details",
          },
          {
            name: "Leave Requests",
            slug: "/dashboard/hr-module/leave-management?tab=request",
          },
        ]}
      />
      {searchParams.tab === "request" ? (
        <LeaveRequests searchParams={searchParams} />
      ) : <LeaveDetails />}
    </section>
  );
}
