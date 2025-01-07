import { IEmployee } from "@/types";
import { InfoLayout } from "./InfoLayout";
import Info from "../Info";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { calculateAge } from "@/app/utils/calculateAge";

interface IProps {
  employee_info: IEmployee | undefined;
}

export default function Informations({ employee_info }: IProps) {
  return (
    <>
      <InfoLayout>
        <h2 className="text-2xl font-semibold pb-6">Personal Informations</h2>

        <div className="flex flex-wrap items-start *:basis-60 *:flex-grow gap-x-8 gap-y-4">
          <Info title="Full Name" value={employee_info?.name} />
          <Info title="Contact Number" value={employee_info?.contact_number} />
          <Info title="Email Address" value={employee_info?.email_address} />
          <Info title="Living Address" value={employee_info?.living_address} />
          <Info
            title="Date of birth"
            value={beautifyDate(employee_info?.dob || "")}
          />
          <Info title="Age" value={calculateAge(employee_info?.dob || "")} />
          <Info title="Gender" value={employee_info?.gender} />
          <Info title="Marital Status" value={employee_info?.marital_status} />
        </div>
      </InfoLayout>

      <InfoLayout>
        <h2 className="text-2xl font-semibold pb-6">Official Informations</h2>

        <div className="flex flex-wrap items-start *:basis-60 *:flex-grow gap-x-8 gap-y-4">
          <Info title="Job Title" value={employee_info?.job_title} />
          <Info
            title="Date of Joining"
            value={beautifyDate(employee_info?.joining_date || "")}
          />
          <Info title="Login Email" value={employee_info?.login_email} />
          <Info title="Login Password" value={employee_info?.login_password} />
          <Info title="Department" value={employee_info?.department_name} />
          <Info title="Employee Rank" value={employee_info?.rank} />
          <Info title="Institute" value={employee_info?.institute || ""} />
        </div>
      </InfoLayout>

      <InfoLayout>
        <h2 className="text-2xl font-semibold pb-6">Bank information</h2>

        <div className="flex flex-wrap items-start *:basis-60 *:flex-grow gap-x-8 gap-y-4">
          <Info title="Bank name" value={employee_info?.bank_name} />
          <Info
            title="Bank account No."
            value={employee_info?.bank_account_no}
          />
          <Info
            title="Account holder name"
            value={employee_info?.account_holder_name}
          />
          <Info title="IFSC Code" value={employee_info?.ifsc_code} />
        </div>
      </InfoLayout>
    </>
  );
}
