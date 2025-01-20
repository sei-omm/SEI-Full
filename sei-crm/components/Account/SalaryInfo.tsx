import { IEmployee } from "@/types";
import React from "react";
import { InfoLayout } from "./InfoLayout";
import Info from "../Info";

interface IProps {
  employee_info: IEmployee | undefined;
}

export default function SalaryInfo({ employee_info }: IProps) {
  const totalDeductions =
    parseFloat(employee_info?.income_tax || "0") +
    parseFloat(employee_info?.esic || "0") +
    parseFloat(employee_info?.professional_tax || "0") +
    parseFloat(employee_info?.provident_fund || "0") + 
    parseFloat(employee_info?.gratuity || "0");

  const totalIncome =
    totalDeductions +
    parseFloat(employee_info?.basic_salary || "0") +
    parseFloat(employee_info?.hra || "0") +
    parseFloat(employee_info?.other_allowances || "0");

  const netSalary = totalIncome - totalDeductions;

  return (
    <>
      <InfoLayout>
        <h2 className="text-2xl font-semibold pb-6">Salary information</h2>

        <div className="flex flex-wrap items-start *:basis-60 *:flex-grow gap-x-8 gap-y-4">
          <Info title="Basic Salary" value={employee_info?.basic_salary} />
          <Info title="HRA" value={employee_info?.hra} />
          <Info
            title="Other Allowances"
            value={employee_info?.other_allowances}
          />
          <Info title="Provident Fund" value={employee_info?.provident_fund} />
          <Info
            title="Professional Tax"
            value={employee_info?.professional_tax}
          />
          <Info title="ESIC" value={employee_info?.esic} />
          <Info title="Income Tax" value={employee_info?.income_tax} />
          <Info title="Gratuity" value={employee_info?.gratuity} />
        </div>

        <div className="space-y-4">
          <h2 className="text-sm">
            Total Deductions :{" "}
            <span className="font-semibold">₹{totalDeductions}</span>
          </h2>
          <div className="w-full h-[1px] bg-gray-300"></div>

          <h2 className="text-sm">
            Net Salary : <span className="font-semibold">₹{netSalary}</span>
          </h2>
          {/* <h2 className="text-xs text-gray-500">
                Income Tax : <span>-₹50</span>
              </h2> */}

          <div className="w-full h-[1px] bg-gray-300"></div>
          <h2 className="text-sm flex items-center justify-between">
            <span className="font-semibold text-gray-500">
              IN HAND SALARY / month&apos;s
            </span>{" "}
            :
            <span className="font-semibold">
              ₹{(netSalary / 12).toFixed(2)}
            </span>
          </h2>
        </div>
      </InfoLayout>
    </>
  );
}
