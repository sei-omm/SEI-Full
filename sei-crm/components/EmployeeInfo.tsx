"use client";

import React, { useEffect, useRef, useState } from "react";

import Button from "./Button";
import { AiOutlineDelete } from "react-icons/ai";
import { Doughnut } from "react-chartjs-2";
import Input from "./Input";
import Image from "next/image";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useQueries, UseQueryResult } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { EmployeeType, IDepartment, IEmployee, ISuccess } from "@/types";
import { toast } from "react-toastify";
import { getDate } from "@/app/utils/getDate";
import { getFileName } from "@/app/utils/getFileName";
import HandleSuspence from "./HandleSuspence";
import DateInput from "./DateInput";
import { TbRadioactive } from "react-icons/tb";
import ChooseFileInput from "./ChooseFileInput";
import { BsFiletypePdf } from "react-icons/bs";
import { downloadHtmlToPdf } from "@/app/utils/downloadHtmlToPdf";
import DropDown from "./DropDown";
import { calculateAge } from "@/app/utils/calculateAge";
import { useDoMutation } from "@/app/utils/useDoMutation";
import EmployeeTask from "./EmployeeTask";

ChartJS.register(ArcElement, Tooltip, Legend);

interface IProps {
  employeeID: number | "add-employee" | "add-faculty";
}

const fetchDepartments = async () => {
  const response = await axios.get(BASE_API + "/hr/department");
  return response.data;
};

const fetchEmployeeInfo = async (employeeID: string) => {
  const response = await axios.get(BASE_API + "/employee/" + employeeID);
  return response.data;
};

export default function EmployeeInfo({ employeeID }: IProps) {
  const isNewEmployee =
    employeeID === "add-employee" || employeeID === "add-faculty"
      ? true
      : false;

  const fetchResults = useQueries<
    [
      UseQueryResult<ISuccess<IDepartment[]>>,
      UseQueryResult<ISuccess<IEmployee[]>>
    ]
  >([
    {
      queryKey: ["get-department", employeeID],
      queryFn: fetchDepartments,
    },
    {
      queryKey: ["get-employee-info", employeeID],
      queryFn: () =>
        isNewEmployee ? null : fetchEmployeeInfo(employeeID.toString()),
      refetchOnMount: true,
      cacheTime: 0,
    },
  ]);

  const employeeInfo = fetchResults[1]?.data?.data[0];
  const departements = fetchResults[0].data?.data;

  const filePickerRef = useRef<HTMLInputElement>(null);
  // const [file, setFile] = useState<File | null>(null);
  const [selectedPofileIcon, setSelectedProfileIcon] = useState<string>("");
  const [employeeType, setEmployeeType] = useState<EmployeeType>(
    employeeID === "add-faculty" ? "Faculty" : "Office Staff"
  );

  const [employeeName, setEmployeeName] = useState("Employee Name");
  const [joinDate, setJoinDate] = useState<string | undefined>(undefined);
  const [age, setAge] = useState(
    employeeInfo?.dob ? calculateAge(employeeInfo.dob) : ""
  );

  const [salaryValues, setSalaryValues] = useState([0, 0, 0, 0, 0, 0, 0]);

  const whichFormBtnClicked = useRef<"add-or-update" | "deactive-employee">(
    "add-or-update"
  );

  const chartViewData = {
    labels: [
      "Basic Salary",
      "HRA",
      "Other Allowances",
      "Provident Fund",
      "Professional Tax",
      "ESIC",
      "Income Tax",
    ],
    datasets: [
      {
        label: "Salary Info",
        data: salaryValues,
        backgroundColor: [
          "#FC7A69",
          "#075955",
          "#27ABA7",
          "#7B67C1",
          "#FFE8E5",
          "#8EC448",
          "#000000",
        ],
        hoverOffset: 7,
      },
    ],
  };

  const handleFilePickBtn = () => {
    filePickerRef.current?.click();
  };

  const onFilePicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files![0];
    // setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedProfileIcon(reader.result as string);
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleSalaryInput = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newArray = [...salaryValues];
    newArray[index] = parseInt(event.target.value || "0");
    setSalaryValues(newArray);
  };

  const netSalary = salaryValues.reduce(
    (accumulator, currentValue, currentIndex) => {
      if (
        currentIndex === 3 ||
        currentIndex === 4 ||
        currentIndex === 5 ||
        currentIndex === 6
      ) {
        return accumulator - currentValue;
      }
      return accumulator + currentValue;
    },
    0
  );

  const onNameTextBoxChange = (event: React.FormEvent<HTMLInputElement>) => {
    setEmployeeName(event.currentTarget.value);
  };

  const onDateOfJoinChnage = (value: string) => {
    setJoinDate(value);
  };

  //this use effect for set the current department name
  useEffect(() => {
    if (!isNewEmployee) {
      setJoinDate(employeeInfo?.joining_date || "");
      const newArray = [...salaryValues];
      newArray[0] = parseInt(employeeInfo?.basic_salary || "0");
      newArray[1] = parseInt(employeeInfo?.hra || "0");
      newArray[2] = parseInt(employeeInfo?.other_allowances || "0");
      newArray[3] = parseInt(employeeInfo?.provident_fund || "0");
      newArray[4] = parseInt(employeeInfo?.professional_tax || "0");
      newArray[5] = parseInt(employeeInfo?.esic || "0");
      newArray[6] = parseInt(employeeInfo?.income_tax || "0");
      setSalaryValues(newArray);
      if (employeeInfo) {
        setEmployeeType(employeeInfo.employee_type as EmployeeType);
      }
      setAge(employeeInfo?.dob ? calculateAge(employeeInfo?.dob) : "");
    }
  }, [fetchResults[1].isLoading]);

  const { mutate, isLoading: mutateLoading } = useDoMutation();

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    //find department_id using department_name
    const departmentName = formData.get("department_name");
    const singleDepartmentInfo = departements?.find(
      (item) => item.name === departmentName
    );
    formData.set("department_id", `${singleDepartmentInfo?.id}`);
    if (employeeID === "add-employee") {
      formData.set("employee_type", "Office Staff");
    } else {
      formData.set("employee_type", "Faculty");
    }
    formData.delete("department_name");

    if (
      formData.get("confirm_bank_account_number") !==
      formData.get("bank_account_no")
    ) {
      toast.error("Back Account Numbers Are Not Same");
      return;
    }
    formData.delete("confirm_bank_account_number");

    if (whichFormBtnClicked.current === "deactive-employee") {
      if (
        confirm(
          `Are you sure you want to ${
            employeeInfo?.is_active ? "deactive" : "re-active"
          } this employee ?`
        )
      ) {
        formData.set("is_active", `${!employeeInfo?.is_active}`);
      } else {
        return;
      }
    }

    if (isNewEmployee) {
      mutate({
        apiPath: "/employee",
        method: "post",
        formData,
      });
    } else {
      mutate({
        apiPath: "/employee",
        method: "put",
        formData,
        id: employeeInfo?.id,
      });
    }
  };

  const handleDobOnChange = (value: string) => {
    setAge(calculateAge(value));
  };

  const layoutToDownloadAsPdf = useRef<HTMLDivElement>(null);

  return (
    <HandleSuspence isLoading={fetchResults[0].isLoading}>
      <div className="py-3 flex items-center justify-between gap-5">
        <div>
          <h2 className="font-semibold text-2xl">
            {isNewEmployee
              ? "Add New Employee Informations"
              : `${employeeInfo?.name}'s Informations`}
          </h2>
          {isNewEmployee ? null : (
            <h3 className="text-sm text-gray-500">SG14IOM</h3>
          )}
        </div>
      </div>

      <form onSubmit={onFormSubmit} className="space-y-7">
        <div ref={layoutToDownloadAsPdf} className="space-y-7">
          <div className="flex bg-white items-start gap-x-4 p-10 border card-shdow rounded-3xl">
            {/* Logo Div */}
            <div className="size-28 bg-gray-200 overflow-hidden rounded-lg">
              <Image
                className="size-full object-cover"
                src={
                  selectedPofileIcon === ""
                    ? BASE_API + "/" + employeeInfo?.profile_image
                    : selectedPofileIcon
                }
                alt="Logo"
                height={512}
                width={512}
                priority={false}
              />
            </div>

            <div className="flex flex-col justify-between h-full *:mb-2">
              <h2 className="font-semibold leading-none">
                {isNewEmployee
                  ? employeeName
                  : employeeInfo?.name && employeeName === "Employee Name"
                  ? employeeInfo?.name
                  : employeeName}
              </h2>
              <p className="text-sm">
                Employee ID : <span className="font-semibold">SG14IOM</span>
              </p>
              <p className="text-xs text-gray-500 font-semibold">
                Date of Join :{" "}
                {joinDate
                  ? new Date(joinDate).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "No Date"}
              </p>

              <div className="space-x-3">
                <input
                  name="profile_image"
                  onChange={onFilePicked}
                  ref={filePickerRef}
                  accept="image/*"
                  hidden
                  type="file"
                />
                <Button onClick={handleFilePickBtn} type="button">
                  Change Logo
                </Button>
              </div>
            </div>
          </div>

          {/* Personal Information  shadow-xl p-10 rounded-3xl border */}
          <div className="p-10 border card-shdow rounded-3xl">
            <h2 className="text-2xl font-semibold pb-6">
              Personal Informations
            </h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              <Input
                defaultValue={employeeInfo?.name || ""}
                required
                onChange={onNameTextBoxChange}
                name="name"
                label="Full name *"
                placeholder="Somnath Gupta"
              />
              <Input
                defaultValue={employeeInfo?.contact_number || ""}
                required
                name="contact_number"
                label="Contact number"
                placeholder="8784587854"
              />
              <Input
                defaultValue={employeeInfo?.email_address || ""}
                required
                name="email_address"
                type="email"
                label="Email address"
                placeholder="somnathgupta112@gmail.com"
              />

              <Input
                defaultValue={employeeInfo?.living_address || ""}
                required
                name="living_address"
                label="Living Address"
                placeholder="3/3, Swami Vivekananda Rd, Vivekananda Pally, Bapuji Colony, Nagerbazar, Dum Dum, Kolkata, West Bengal 700074"
              />
              <DateInput
                onChange={handleDobOnChange}
                name="dob"
                label="Date of birth"
                date={getDate(new Date(employeeInfo?.dob || ""))}
              />

              <Input defaultValue={age} required label="Age" placeholder="24" />

              <DropDown
                key="gender"
                label="Select Gender"
                options={[
                  { text: "Male", value: "Male" },
                  { text: "Female", value: "Female" },
                  { text: "Other", value: "Other" },
                ]}
                name="gender"
                defaultValue={employeeInfo?.gender}
              />

              <DropDown
                key="marital_status"
                label="Marital Status"
                options={[
                  { text: "Un-Married", value: "Un-Married" },
                  { text: "Married", value: "Married" },
                ]}
                name="marital_status"
                defaultValue={employeeInfo?.marital_status}
              />
            </div>
          </div>

          {/* Official Information */}
          <div className="p-10 border card-shdow rounded-3xl">
            <h2 className="text-2xl font-semibold pb-6">
              Official Informations
            </h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              <Input
                defaultValue={employeeInfo?.job_title || ""}
                required
                name="job_title"
                label="Job Title"
                placeholder="Software Engineer"
              />
              <DateInput
                name="joining_date"
                onChange={onDateOfJoinChnage}
                label="Date of Join"
                date={getDate(new Date(joinDate || ""))}
              />
              <Input
                defaultValue={employeeInfo?.login_email || ""}
                required
                name="login_email"
                type="email"
                label="Employee Login Email"
                placeholder="somnathgupta@gmail.com"
              />
              <Input
                defaultValue={employeeInfo?.login_password || ""}
                required
                name="login_password"
                label="Employee Login Password"
                type="password"
                placeholder="adminSom@123"
              />
              <DropDown
                key={"department_name"}
                label="Select Department"
                options={
                  departements?.map((item) => ({
                    text: item.name,
                    value: item.name,
                  })) || []
                }
                name="department_name"
                defaultValue={employeeInfo?.department_name}
              />

              <Input
                required
                name="rank"
                label="Employee Rank"
                placeholder="Principal"
                defaultValue={employeeInfo?.rank}
              />

              {employeeID === "add-faculty" ||
              employeeInfo?.employee_type === "Faculty" ? (
                <>
                  <Input
                    type="number"
                    name="fin_number"
                    label="FIN Number"
                    placeholder="154578"
                    defaultValue={employeeInfo?.fin_number}
                  />
                  <Input
                    type="number"
                    name="indos_number"
                    label="Indos Number"
                    placeholder="878458"
                    defaultValue={employeeInfo?.indos_number}
                  />
                  <Input
                    type="number"
                    name="cdc_number"
                    label="CDC Number"
                    placeholder="4541"
                    defaultValue={employeeInfo?.cdc_number}
                  />
                  <Input
                    name="grade"
                    label="Grade"
                    placeholder="A+"
                    defaultValue={employeeInfo?.grade}
                  />
                  <DropDown
                    key={"qualification"}
                    label="Select Qualification"
                    options={[
                      { text: "TOTA", value: "TOTA" },
                      { text: "VICT", value: "VICT" },
                    ]}
                    name="qualification"
                    defaultValue={employeeInfo?.qualification}
                  />
                  {/* additional qualification */}
                  <DropDown
                    key={"additional_qualification"}
                    label="Additional Qualification"
                    options={[
                      { text: "AECS", value: "AECS" },
                      { text: "TSTA", value: "TSTA" },
                    ]}
                    name="additional_qualification"
                    defaultValue={employeeInfo?.additional_qualification}
                  />
                  <Input
                    name="selling_experience"
                    label="Selling Experience"
                    placeholder="1 Years"
                    defaultValue={employeeInfo?.selling_experience}
                  />
                  <Input
                    name="teaching_experience"
                    label="Teaching Experience"
                    placeholder="2 Years"
                    defaultValue={employeeInfo?.teaching_experience}
                  />
                  <Input
                    name="max_teaching_hrs_per_week"
                    label="Max Teaching Hours Per Week"
                    placeholder="2 Hours"
                    defaultValue={employeeInfo?.max_teaching_hrs_per_week}
                  />
                  <DropDown
                    key={"faculty_attendance_type"}
                    label="Faculty Attendance Type"
                    options={[
                      { text: "Regular", value: "Regular" },
                      { text: "Visiting", value: "Visiting" },
                    ]}
                    name="faculty_attendance_type"
                    defaultValue={employeeInfo?.faculty_attendance_type}
                  />
                </>
              ) : null}

              <DropDown
                key={"institute"}
                label="Institute"
                options={[
                  { text: "Kolkata", value: "Kolkata" },
                  { text: "Faridabad", value: "Faridabad" },
                ]}
                name="institute"
                defaultValue={employeeInfo?.institute}
              />
            </div>
          </div>

          {/* Employee Task */}
          {employeeType === "Faculty" ? <EmployeeTask /> : null}

          {/* Bank Info */}
          <div className="p-10 border card-shdow rounded-3xl">
            <h2 className="text-2xl font-semibold pb-6">Bank information</h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              <Input
                defaultValue={employeeInfo?.bank_name || ""}
                required
                name="bank_name"
                label="Bank name"
                placeholder="ICICI Bank"
              />
              <Input
                defaultValue={employeeInfo?.bank_account_no || ""}
                required
                name="bank_account_no"
                label="Bank account No."
                placeholder="159843014641"
              />
              <Input
                defaultValue={employeeInfo?.bank_account_no || ""}
                required
                name="confirm_bank_account_number"
                label="Confirm Bank account No."
                placeholder="159843014641"
              />
              <Input
                defaultValue={employeeInfo?.account_holder_name || ""}
                required
                name="account_holder_name"
                label="Account holder name"
                placeholder="Somnath Gupta"
              />
              <Input
                defaultValue={employeeInfo?.ifsc_code || ""}
                required
                name="ifsc_code"
                label="IFSC Code"
                placeholder="ICI24504"
              />
            </div>
          </div>

          {/* Documents Info */}
          <div className="p-10 border card-shdow rounded-3xl">
            <h2 className="text-2xl font-semibold pb-6">Documentation</h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              <ChooseFileInput
                fileName={getFileName(employeeInfo?.resume) ?? "Choose Resume"}
                id="resume-picker"
                label="Resume"
                name="resume"
                viewLink={
                  employeeInfo?.resume
                    ? BASE_API + "/" + employeeInfo?.resume
                    : undefined
                }
              />

              <ChooseFileInput
                fileName={
                  getFileName(employeeInfo?.pan_card) ?? "Choose Pan Card"
                }
                id="pan-card-picker"
                label="Pan Card"
                name="pan_card"
                viewLink={
                  employeeInfo?.pan_card
                    ? BASE_API + "/" + employeeInfo?.pan_card
                    : undefined
                }
              />

              <ChooseFileInput
                fileName={
                  getFileName(employeeInfo?.aadhaar_card) ??
                  "Choose Aadhar Card"
                }
                id="aadhaar-card-picker"
                label="Aadhaar Card"
                name="aadhaar_card"
                viewLink={
                  employeeInfo?.aadhaar_card
                    ? BASE_API + "/" + employeeInfo?.aadhaar_card
                    : undefined
                }
              />

              <ChooseFileInput
                fileName={
                  getFileName(employeeInfo?.ten_pass_certificate) ??
                  "Choose 10th Pass Certificate"
                }
                id="ten-pass-certificate-picker"
                label="10th Pass Certificate"
                name="ten_pass_certificate"
                viewLink={
                  employeeInfo?.ten_pass_certificate
                    ? BASE_API + "/" + employeeInfo?.ten_pass_certificate
                    : undefined
                }
              />

              <ChooseFileInput
                fileName={
                  getFileName(employeeInfo?.twelve_pass_certificate) ??
                  "Choose 12th Pass Certificate"
                }
                id="twelve-pass-certificate-picker"
                label="12th Pass Certificate"
                name="twelve_pass_certificate"
                viewLink={
                  employeeInfo?.twelve_pass_certificate
                    ? BASE_API + "/" + employeeInfo?.twelve_pass_certificate
                    : undefined
                }
              />

              <ChooseFileInput
                fileName={
                  getFileName(employeeInfo?.graduation_certificate) ??
                  "Choose Graduation Certificate"
                }
                id="graduation-certificate-picker"
                label="Choose Graduation Certificate"
                name="graduation_certificate"
                viewLink={
                  employeeInfo?.graduation_certificate
                    ? BASE_API + "/" + employeeInfo?.graduation_certificate
                    : undefined
                }
              />

              <ChooseFileInput
                fileName={
                  getFileName(employeeInfo?.other_certificate) ??
                  "Choose Other Certificate"
                }
                id="other-certificate-picker"
                label="Choose Other Certificate"
                name="other_certificate"
                viewLink={
                  employeeInfo?.other_certificate
                    ? BASE_API + "/" + employeeInfo?.other_certificate
                    : undefined
                }
              />
            </div>
          </div>

          {/* Salary Info */}
          <div className="p-10 border card-shdow rounded-3xl">
            <h2 className="text-2xl font-semibold pb-6">Salary information</h2>

            <div className="flex items-start">
              <div className="basis-[40%] flex-grow space-y-4">
                <Input
                  defaultValue={employeeInfo?.basic_salary || ""}
                  required
                  name="basic_salary"
                  type="number"
                  onChange={(e) => handleSalaryInput(e, 0)}
                  label="Basic Salary"
                  placeholder="₹83,334"
                />
                <Input
                  defaultValue={employeeInfo?.hra || ""}
                  required
                  type="number"
                  name="hra"
                  onChange={(e) => handleSalaryInput(e, 1)}
                  label="HRA"
                  placeholder="₹41,667"
                />
                <Input
                  defaultValue={employeeInfo?.other_allowances || ""}
                  required
                  type="number"
                  name="other_allowances"
                  onChange={(e) => handleSalaryInput(e, 2)}
                  label="Other Allowances"
                  placeholder="₹41,667"
                />

                <Input
                  defaultValue={employeeInfo?.provident_fund || ""}
                  required
                  type="number"
                  name="provident_fund"
                  onChange={(e) => handleSalaryInput(e, 3)}
                  label="Provident Fund"
                  placeholder="₹10,000"
                />
                <Input
                  defaultValue={employeeInfo?.professional_tax || ""}
                  required
                  type="number"
                  name="professional_tax"
                  onChange={(e) => handleSalaryInput(e, 4)}
                  label="Professional Tax"
                  placeholder="₹200"
                />

                <Input
                  defaultValue={employeeInfo?.esic || ""}
                  required
                  type="number"
                  name="esic"
                  onChange={(e) => handleSalaryInput(e, 5)}
                  label="ESIC"
                  placeholder="₹200"
                />

                <Input
                  defaultValue={employeeInfo?.income_tax || ""}
                  required
                  type="number"
                  name="income_tax"
                  onChange={(e) => handleSalaryInput(e, 6)}
                  label="Income Tax"
                  placeholder="₹19,000"
                />

                <h2 className="text-sm">
                  Total Deductions :{" "}
                  <span className="font-semibold">
                    ₹
                    {salaryValues[salaryValues.length - 1] +
                      salaryValues[salaryValues.length - 2] +
                      salaryValues[salaryValues.length - 3] +
                      salaryValues[salaryValues.length - 4]}
                  </span>
                </h2>
                <div className="w-full h-[1px] bg-gray-300"></div>

                <h2 className="text-sm">
                  Net Salary :{" "}
                  <span className="font-semibold">
                    ₹{netSalary + salaryValues[salaryValues.length - 1]}
                  </span>
                </h2>
                {/* <h2 className="text-xs text-gray-500">
                Income Tax : <span>-₹50</span>
              </h2> */}

                <div className="w-full h-[1px] bg-gray-300"></div>
                <h2 className="text-sm flex items-center justify-between">
                  <span className="font-semibold text-gray-500">
                    IN HAND SALARY / month&apos;s
                  </span>{" "}
                  :<span className="font-semibold">₹{netSalary}</span>
                </h2>
              </div>
              <div className="basis-[60%] flex-center mt-20">
                <div className="size-[450px] flex-center">
                  <Doughnut data={chartViewData} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Buttons (Form Buttons) */}
        <div className="flex items-center gap-5">
          <Button
            loading={
              whichFormBtnClicked.current === "add-or-update" && mutateLoading
                ? true
                : undefined
            }
            onClick={() => (whichFormBtnClicked.current = "add-or-update")}
            className="min-w-48"
          >
            {isNewEmployee ? "Add Employee Information" : "Save Information"}
          </Button>

          <Button
            loading={
              whichFormBtnClicked.current === "deactive-employee" &&
              mutateLoading
                ? true
                : undefined
            }
            onClick={() => (whichFormBtnClicked.current = "deactive-employee")}
            name="btn"
            value={"remove-btn"}
            className={`min-w-48 ${
              employeeInfo?.is_active ? "!bg-[#F44336]" : "!bg-[#2a8545]"
            } flex-center gap-x-2 ${isNewEmployee ? "!hidden" : ""}`}
          >
            {employeeInfo?.is_active ? (
              <>
                <AiOutlineDelete />
                Deactive Employee
              </>
            ) : (
              <>
                <TbRadioactive />
                Re-Active Employee
              </>
            )}
          </Button>

          <Button
            onClick={() => downloadHtmlToPdf(layoutToDownloadAsPdf)}
            type="button"
            className="flex-center gap-2"
          >
            <BsFiletypePdf />
            <span>Download As PDF</span>
          </Button>
        </div>
      </form>
    </HandleSuspence>
  );
}
