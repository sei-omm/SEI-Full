import { GrEdit } from "react-icons/gr";
import Link from "next/link";
import Button from "./Button";
import { IoIosAdd } from "react-icons/io";
import Image from "next/image";
import { BASE_API } from "@/app/constant";
import { IHREmployee, ISuccess } from "@/types";
import TagsBtn from "./TagsBtn";
import EmployeeTypeFilter from "./Employee/EmployeeTypeFilter";
import Pagination from "./Pagination";
import GenarateExcelReportBtn from "./GenarateExcelReportBtn";

const tableDatas = {
  heads: ["Name", "Type", "Department", "Status", "Action"],
  body: [
    ["Somnath Gupta", "Finance Manager", "Finance", "Present", "actionBtn"],
    ["Arindam Gupta", "IT Management", "IT", "Absence", "actionBtn"],
  ],
};

interface IProps {
  searchParams: any;
}

export default async function Contacts({ searchParams }: IProps) {
  const urlSearchParams = new URLSearchParams(searchParams);
  const response = await fetch(
    `${BASE_API}/employee?${urlSearchParams.toString()}`,
    { cache: "no-store" }
  );
  const result = (await response.json()) as ISuccess<IHREmployee[]>;

  tableDatas.body = result?.data?.map((employee) => [
    employee.name,
    employee.employee_type,
    employee.department_name,
    `${employee.is_active}`,
    "actionBtn",
  ]);

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <GenarateExcelReportBtn apiPath={`/report/employee/excel?${urlSearchParams.toString()}`} />
      </div>
      <section className="w-full overflow-hidden card-shdow px-5 py-5">
        {/* table action buttons */}
        <div className="flex items-center justify-between">
          <EmployeeTypeFilter />
          <div className="w-full flex items-center justify-end gap-x-5">
            <Link href={"/dashboard/hr-module/manage-employee/add-faculty"}>
              <Button className="flex-center gap-x-2">
                <IoIosAdd size={23} />
                Add Faculty
              </Button>
            </Link>
            <Link href={"/dashboard/hr-module/manage-employee/add-employee"}>
              <Button className="flex-center gap-x-2">
                <IoIosAdd size={23} />
                Add Employee
              </Button>
            </Link>
          </div>
        </div>

        {/* table info */}
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
          <table className="min-w-max w-full table-auto">
            <thead className="uppercase w-full border-b border-gray-100">
              <tr>
                {tableDatas.heads.map((item) => (
                  <th
                    className="text-left text-[14px] font-semibold pb-2 px-5 py-4"
                    key={item}
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableDatas.body.map((itemArray, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-100 group/bodyitem">
                  {itemArray.map((value, columnIndex) => (
                    <td
                      className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                      key={value}
                    >
                      {value?.includes("@") ? (
                        <Link
                          className="text-[#346FD8] font-medium"
                          href={`mailto:${value}`}
                        >
                          {value}
                        </Link>
                      ) : (
                        <span className="line-clamp-1 inline-flex gap-x-3">
                          {value === "actionBtn" ? (
                            <div className="flex-center gap-4">
                              <Link
                                href={
                                  "/dashboard/hr-module/manage-employee/" +
                                  result.data[rowIndex].employee_id
                                }
                              >
                                <Button className="bg-transparent border text-black font-semibold flex-center gap-x-2 !px-5">
                                  <GrEdit />
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          ) : columnIndex === 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="size-10 bg-gray-200 overflow-hidden rounded-full">
                                <Image
                                  className="size-full object-cover"
                                  src={result.data[rowIndex].profile_image}
                                  alt="Employee Image"
                                  height={90}
                                  width={90}
                                  quality={100}
                                />
                              </div>
                              {value}
                            </div>
                          ) : value === "true" ? (
                            <TagsBtn type="SUCCESS">Active</TagsBtn>
                          ) : value === "false" ? (
                            <TagsBtn type="FAILED">In Active</TagsBtn>
                          ) : (
                            value
                          )}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Pagination dataLength={result?.data?.length} />
    </>
  );
}
