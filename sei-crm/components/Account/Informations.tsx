import { IEmployee } from "@/types";
import { InfoLayout } from "./InfoLayout";
import Info from "../Info";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { calculateAge } from "@/app/utils/calculateAge";
// import { employeeAuthority } from "@/app/constant";
import FacultyAssignCourseListview from "../Employee/FacultyAssignCourseListview";

interface IProps {
  employee_info: IEmployee | undefined;
}

export default function Informations({ employee_info }: IProps) {
  let employeeAuthorityValue: string | undefined = undefined;

  if (employee_info?.authority) {
    // employeeAuthorityValue = employeeAuthority.find(
    //   (authority) =>
    //     authority.score === parseInt(employee_info.authority || "-1")
    // )?.name;
    employeeAuthorityValue = employee_info.authority
  }

  return (
    <>
      <InfoLayout>
        <h2 className="text-2xl font-semibold pb-6">Personal Informations</h2>

        <div className="flex flex-wrap items-start *:basis-60 *:flex-grow gap-x-8 gap-y-4">
          <Info title="Full Name" value={employee_info?.name} />
          <Info title="Contact Number" value={employee_info?.contact_number} />
          <Info title="Email Address" value={employee_info?.email_address} />
          <Info title="Present Address" value={employee_info?.living_address} />
          <Info
            title="Permanent Address"
            value={employee_info?.permanent_address}
          />
          <Info
            title="Date of birth"
            value={beautifyDate(employee_info?.dob || "")}
          />
          <Info title="Age" value={calculateAge(employee_info?.dob || "")} />
          <Info title="Gender" value={employee_info?.gender} />
          <Info title="Marital Status" value={employee_info?.marital_status} />
          <Info
            title="Emergency Contact Number"
            value={employee_info?.emergency_contact_number}
          />
          <Info
            title="Contact Person Name"
            value={employee_info?.contact_person_name}
          />
          <Info
            title="Contact Person Relation"
            value={employee_info?.contact_person_relation}
          />
        </div>
      </InfoLayout>

      <InfoLayout>
        <h2 className="text-2xl font-semibold pb-6">Official Informations</h2>

        <div className="flex flex-wrap items-start *:basis-60 *:flex-grow gap-x-8 gap-y-4">
          <Info title="Department" value={employee_info?.department_name} />
          <Info
            title={
              employee_info?.employee_type === "Faculty"
                ? "Job Title"
                : "Designation"
            }
            value={employee_info?.designation}
          />
          <Info title="Authority" value={employeeAuthorityValue} />
          <Info
            title="Date of Joining"
            value={beautifyDate(employee_info?.joining_date || "")}
          />
          <Info title="Login Email" value={employee_info?.login_email} />
          <Info title="Login Password" value={employee_info?.login_password} />

          {employee_info?.employee_type === "Faculty" ? (
            <>
              <Info title="FIN Number" value={employee_info?.fin_number} />
              <Info title="Indos Number" value={employee_info?.indos_number} />
              <Info title="CDC Number" value={employee_info?.cdc_number} />
              <Info title="Grade" value={employee_info?.grade} />
              <Info
                title="Qualification"
                value={employee_info?.qualification}
              />
              <Info
                title="Additional Qualification"
                value={employee_info?.additional_qualification}
              />
              <Info
                title="Sailing Experience"
                value={employee_info?.selling_experience}
              />
              <Info
                title="Teaching Experience"
                value={employee_info?.teaching_experience}
              />
              <Info
                title="Max Teaching Hours Per Week"
                value={employee_info?.max_teaching_hrs_per_week}
              />
              <Info
                title="Faculty Attendance Type"
                value={employee_info?.faculty_attendance_type}
              />
              <Info
                title="Faculty Attendance Type"
                value={employee_info?.faculty_attendance_type}
              />
            </>
          ) : null}

          <Info title="Campus" value={employee_info?.institute} />
          <Info title="Payscale" value={employee_info?.payscale_label} />
          <Info title="Payscale Years" value={employee_info?.payscale_year} />
          <Info
            title="Provide Any Assets"
            value={employee_info?.assigned_assets.length === 0 ? "No" : "Yes"}
          />
        </div>
      </InfoLayout>

      {employee_info?.assigned_assets.length === 0 ? null : (
        <InfoLayout>
          <h2 className="text-2xl font-semibold pb-6">
            Provided Assets Informations
          </h2>

          <div className="flex flex-wrap items-start *:basis-60 *:flex-grow gap-x-8 gap-y-4">
            {employee_info?.assigned_assets.map((asset) => (
              <div key={asset.assets_id} className="space-y-1 mb-4 relative">
                <h3 className="text-black text-sm font-semibold">
                  {asset.assets_name}
                </h3>
                <p className="font-medium">{asset.issued_by}</p>
              </div>
            ))}
          </div>
        </InfoLayout>
      )}

      {employee_info?.employee_type === "Faculty" ? (
        <InfoLayout>
          <h2 className="text-2xl font-semibold pb-6">
            Faculty Assign Courses
          </h2>
          <FacultyAssignCourseListview
            employee_id={employee_info.id}
            with_delete={false}
          />
        </InfoLayout>
      ) : null}

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
