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

export default async function page({ searchParams }: IProps) {
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
      <div className="inline-block">
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
      </div>
      {searchParams.tab === "request" ? (
        <LeaveRequests searchParams={searchParams} />
      ) : (
        <EmployeeLeaveDetails />
      )}
    </section>
  );
}
