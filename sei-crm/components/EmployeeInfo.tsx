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
import {
  EmployeeType,
  IDepartment,
  IEmployee,
  ISuccess,
  TEmployeeDocs,
} from "@/types";
import { toast } from "react-toastify";
import { getDate } from "@/app/utils/getDate";
import HandleSuspence from "./HandleSuspence";
import DateInput from "./DateInput";
import { TbRadioactive } from "react-icons/tb";
import { BsFiletypePdf } from "react-icons/bs";
import { downloadHtmlToPdf } from "@/app/utils/downloadHtmlToPdf";
import DropDown from "./DropDown";
import { calculateAge } from "@/app/utils/calculateAge";
import { useDoMutation } from "@/app/utils/useDoMutation";
import EmployeeTask from "./EmployeeTask";
import EmployeeDocuments from "./Employee/EmployeeDocuments";
import { uploadToVercel } from "@/utils/uploadToVercel";
import Spinner from "./Spinner";
import { useRouter } from "next/navigation";
import { IoMdArrowBack } from "react-icons/io";
import OfficialInfoForm from "./Employee/OfficialInfoForm";
import { beautifyDate } from "@/app/utils/beautifyDate";

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
  const route = useRouter();
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

  const departements = fetchResults[0].data?.data;
  const employeeInfo = fetchResults[1]?.data?.data[0];

  const [stateProfileUpload, setStateProfileUpload] = useState<
    "done" | "uploading"
  >("done");

  const employeeDocsInfoState = useRef<TEmployeeDocs[]>([]);

  const filePickerRef = useRef<HTMLInputElement>(null);
  // const [file, setFile] = useState<File | null>(null);
  const [selectedPofileIcon, setSelectedProfileIcon] = useState<string>("");
  const [employeeType, setEmployeeType] = useState<EmployeeType>(
    employeeID === "add-faculty" ? "Faculty" : "Office Staff"
  );

  const [employeeName, setEmployeeName] = useState("Employee Name");
  // const [joinDate, setJoinDate] = useState<string | undefined>(undefined);
  const [age, setAge] = useState(
    employeeInfo?.dob ? calculateAge(employeeInfo.dob) : ""
  );

  const employeeInstitute = useRef<string | null>(null);

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
      "Gratuity",
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
          "#87CEEB",
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

    if (!confirm("Are you sure you want to upload profile image")) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedProfileIcon(reader.result as string);
    };

    reader.readAsDataURL(selectedFile);

    uploadToVercel({
      fileName: [`employee-profile/${selectedFile.name}`],
      file: [selectedFile],
      endPoint: "/upload/employee-profile",
      onProcessing: () => {
        setStateProfileUpload("uploading");
      },
      onUploaded: (blob) => {
        setStateProfileUpload("done");
        setSelectedProfileIcon(blob[0].url);
      },
    });
  };

  const handleSalaryInput = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newArray = [...salaryValues];
    newArray[index] = parseInt(event.target.value || "0");
    setSalaryValues(newArray);
  };

  const totalSalary = salaryValues.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);

  const deductions = salaryValues.reduce((accumulator, currentValue, index) => {
    if (index > 2) return accumulator + currentValue;
    return 0;
  }, 0);

  const newSalary = totalSalary - deductions;

  // const workingTenure = calculateYearsDifference(
  //   joinDate || "",
  //   new Date().toISOString().split("T")[0]
  // );
  const workingTenure = employeeInfo?.working_tenure || 0;
  const gratuity = ((15 * (newSalary / 12) * workingTenure) / 26).toFixed(2);

  const onNameTextBoxChange = (event: React.FormEvent<HTMLInputElement>) => {
    setEmployeeName(event.currentTarget.value);
  };

  // const onDateOfJoinChnage = (value: string) => {
  //   setJoinDate(value);
  // };

  //this use effect for set the current department name
  useEffect(() => {
    if (!isNewEmployee) {
      // setJoinDate(employeeInfo?.joining_date || "");
      setSelectedProfileIcon(employeeInfo?.profile_image || "");
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
      employeeInstitute.current = employeeInfo?.institute || null;
      // setCurrentDepartment(employeeInfo?.department_id);
    }
  }, [fetchResults[1].isLoading]);

  const { mutate, isLoading: mutateLoading } = useDoMutation();

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    //find department_id using department_name
    // const departmentName = formData.get("department_name");
    // const singleDepartmentInfo = departements?.find(
    //   (item) => item.name === departmentName
    // );
    // formData.set("department_id", `${singleDepartmentInfo?.id}`);
    formData.delete("return_date");
    if (employeeID === "add-employee") {
      formData.set("employee_type", "Office Staff");
    } else if (employeeID === "add-faculty") {
      formData.set("employee_type", "Faculty");
    } else {
      formData.set("employee_type", `${employeeInfo?.employee_type}`);
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

    formData.set("profile_image", selectedPofileIcon);
    formData.set(
      "employee_docs_info",
      JSON.stringify(
        employeeDocsInfoState.current.filter((item) => item.doc_uri != null)
      )
    );

    if (isNewEmployee) {
      mutate({
        apiPath: "/employee",
        method: "post",
        formData,
        onSuccess: () => {
          route.push("/dashboard/hr-module/manage-employee");
        },
      });
    } else {
      mutate({
        apiPath: "/employee",
        method: "put",
        headers: {
          "Content-Type": "application/json",
        },
        formData,
        id: employeeInfo?.id,
        onSuccess: () => {
          route.push("/dashboard/hr-module/manage-employee");
        },
      });
    }
  };

  const handleDobOnChange = (value: string) => {
    setAge(calculateAge(value));
  };

  const layoutToDownloadAsPdf = useRef<HTMLDivElement>(null);

  return (
    <HandleSuspence
      isLoading={fetchResults[0].isLoading}
      dataLength={1}
      error={fetchResults[1].error}
    >
      <div className="py-3 flex items-center justify-between gap-5">
        <div>
          <h2 className="font-semibold text-2xl">
            {isNewEmployee
              ? "Add New Employee Informations"
              : `${employeeInfo?.name}'s Informations`}
          </h2>
        </div>
      </div>

      <form onSubmit={onFormSubmit} className="space-y-7">
        <div ref={layoutToDownloadAsPdf} className="space-y-7">
          <div className="flex bg-white items-start gap-x-4 p-10 border card-shdow rounded-3xl">
            {/* Logo Div */}
            <div className="size-28 bg-gray-200 overflow-hidden rounded-lg flex-center">
              {stateProfileUpload === "done" ? (
                <Image
                  className="size-full object-cover"
                  src={
                    selectedPofileIcon === ""
                      ? employeeInfo?.profile_image || "/placeholder_image.jpg"
                      : selectedPofileIcon
                  }
                  alt="Logo"
                  height={512}
                  width={512}
                  priority={false}
                />
              ) : (
                <Spinner size="20px" />
              )}
            </div>

            <div className="flex flex-col justify-between h-full *:mb-2">
              <h2 className="font-semibold leading-none">
                {isNewEmployee
                  ? employeeName
                  : employeeInfo?.name && employeeName === "Employee Name"
                  ? employeeInfo?.name
                  : employeeName}
              </h2>
              {/* <p className="text-sm">
                Employee ID : <span className="font-semibold">SG14IOM</span>
              </p> */}
              {employeeInfo?.joining_date ? (
                <p className="text-xs text-gray-500 font-semibold">
                  Date Of Joining : {beautifyDate(employeeInfo.joining_date)}
                  {/* {joinDate
                  ? new Date(joinDate).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "No Date"} */}
                </p>
              ) : null}

              <div className="space-x-3">
                <input
                  // name="profile_image"
                  onChange={onFilePicked}
                  ref={filePickerRef}
                  accept="image/*"
                  hidden
                  type="file"
                />
                <Button onClick={handleFilePickBtn} type="button">
                  Change Photo
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
                className="uppercase"
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
                label="Contact number *"
                placeholder="8784587854"
              />
              <Input
                defaultValue={employeeInfo?.email_address || ""}
                required
                name="email_address"
                type="email"
                label="Email address *"
                placeholder="somnathgupta112@gmail.com"
                autoComplete="off"
              />

              <Input
                defaultValue={employeeInfo?.living_address || ""}
                required
                name="living_address"
                label="Present Address *"
                placeholder="3/3, Swami Vivekananda Rd, Vivekananda Pally, Bapuji Colony, Nagerbazar, Dum Dum, Kolkata, West Bengal 700074"
              />
              <Input
                defaultValue={employeeInfo?.permanent_address || ""}
                required
                name="permanent_address"
                label="Permanent Address *"
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

              <Input
                required
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit mobile number"
                name="emergency_contact_number"
                label="Emergency Contact Number *"
                placeholder="8457845878"
                defaultValue={employeeInfo?.emergency_contact_number}
              />

              <Input
                required
                name="contact_person_name"
                label="Contact Person Name *"
                placeholder="Jagannath Gupta"
                defaultValue={employeeInfo?.contact_person_name}
              />

              <Input
                name="contact_person_relation"
                label="Contact Person Relation"
                placeholder="Father"
                defaultValue={employeeInfo?.contact_person_relation}
              />

              <Input
                key={"next_to_kin"}
                name="next_to_kin"
                label="Next Of Kin (As Per Aadhar)"
                placeholder="Type Here Next Of Kin (As Per Aadhar)"
                defaultValue={employeeInfo?.next_to_kin}
              />
              <Input
                key={"relation_to_self"}
                name="relation_to_self"
                label="Relation To Self"
                placeholder="Type Here Relation To Self"
                defaultValue={employeeInfo?.relation_to_self}
              />
            </div>
          </div>

          {/* Official Information */}
          <OfficialInfoForm
            isNewEmployee={isNewEmployee}
            employeeID={employeeID}
            employeeInstituteRef={employeeInstitute}
            // onDateOfJoinChnage={onDateOfJoinChnage}
            departements={departements}
            employeeInfo={employeeInfo}
            // joinDate={joinDate}
          />

          {/* Employee Task */}
          {employeeType === "Faculty" && !isNewEmployee ? (
            <EmployeeTask
              employeeInstitute={employeeInstitute.current || ""}
              employeeId={employeeID as number}
            />
          ) : null}

          {/* Bank Info */}
          <div className="p-10 border card-shdow rounded-3xl">
            <h2 className="text-2xl font-semibold pb-6">Bank information</h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              <Input
                defaultValue={employeeInfo?.bank_name || ""}
                required
                name="bank_name"
                label="Bank name *"
                placeholder="ICICI Bank"
              />
              <Input
                defaultValue={employeeInfo?.bank_account_no || ""}
                required
                name="bank_account_no"
                label="Bank account No. *"
                placeholder="159843014641"
              />
              <Input
                defaultValue={employeeInfo?.bank_account_no || ""}
                required
                name="confirm_bank_account_number"
                label="Confirm Bank account No. *"
                placeholder="159843014641"
              />
              <Input
                defaultValue={employeeInfo?.account_holder_name || ""}
                required
                name="account_holder_name"
                label="Account holder name *"
                placeholder="Somnath Gupta"
              />
              <Input
                defaultValue={employeeInfo?.ifsc_code || ""}
                required
                name="ifsc_code"
                label="IFSC Code *"
                placeholder="ICI24504"
                maxLength={11}
              />
            </div>
          </div>

          {/* Documents Info */}
          <div className="p-10 border card-shdow rounded-3xl">
            <h2 className="text-2xl font-semibold pb-6">Documentation</h2>
            <EmployeeDocuments
              employeeType={
                employeeID === "add-employee"
                  ? "Office Staff"
                  : employeeID === "add-faculty"
                  ? "Faculty"
                  : (employeeInfo?.employee_type as any)
              }
              employeeDocsInfoState={employeeDocsInfoState}
              employeeId={
                employeeID === "add-employee" || employeeID === "add-faculty"
                  ? -1
                  : employeeID
              }
            />
          </div>

          {/* Salary Info */}
          <div className="p-10 border card-shdow rounded-3xl">
            <h2 className="text-2xl font-semibold pb-6">Salary information</h2>

            <div className="flex items-start">
              <div className="basis-[40%] flex-grow space-y-4">
                <Input
                  moneyInput={true}
                  defaultValue={employeeInfo?.basic_salary || ""}
                  required
                  name="basic_salary"
                  type="number"
                  onChange={(e) => handleSalaryInput(e, 0)}
                  label="Basic Salary"
                  placeholder="83,334"
                />
                <Input
                  moneyInput={true}
                  defaultValue={employeeInfo?.hra || ""}
                  required
                  type="number"
                  name="hra"
                  onChange={(e) => handleSalaryInput(e, 1)}
                  label="HRA"
                  placeholder="41,667"
                />
                <Input
                  moneyInput={true}
                  defaultValue={employeeInfo?.other_allowances || ""}
                  required
                  type="number"
                  name="other_allowances"
                  onChange={(e) => handleSalaryInput(e, 2)}
                  label="Other Allowances"
                  placeholder="41,667"
                />

                <Input
                  moneyInput={true}
                  defaultValue={employeeInfo?.provident_fund || ""}
                  required
                  type="number"
                  name="provident_fund"
                  onChange={(e) => handleSalaryInput(e, 3)}
                  label="Provident Fund"
                  placeholder="10,000"
                />
                <Input
                  moneyInput={true}
                  defaultValue={employeeInfo?.professional_tax || ""}
                  required
                  type="number"
                  name="professional_tax"
                  onChange={(e) => handleSalaryInput(e, 4)}
                  label="Professional Tax"
                  placeholder="200"
                />

                <Input
                  moneyInput={true}
                  defaultValue={employeeInfo?.esic || ""}
                  required
                  type="number"
                  name="esic"
                  onChange={(e) => handleSalaryInput(e, 5)}
                  label="ESIC"
                  placeholder="200"
                />

                <Input
                  moneyInput={true}
                  defaultValue={employeeInfo?.income_tax || ""}
                  required
                  type="number"
                  name="income_tax"
                  onChange={(e) => handleSalaryInput(e, 6)}
                  label="Income Tax"
                  placeholder="19,000"
                />

                {workingTenure >= 5 ? (
                  <div>
                    <Input
                      viewOnly
                      aria-hidden="true"
                      step="any"
                      moneyInput={true}
                      required
                      type="number"
                      name="gratuity"
                      onChange={(e) => handleSalaryInput(e, 7)}
                      label="Gratuity"
                      placeholder="200"
                      // defaultValue={employeeInfo?.gratuity || ""}
                      defaultValue={gratuity}
                    />
                    <span className="text-xs">
                      Gratuity = (15 × {(newSalary / 12).toFixed(2)} ×{" "}
                      {workingTenure} years) / 26 = {gratuity}
                    </span>
                  </div>
                ) : null}

                <h2 className="text-sm">
                  Total Deductions :{" "}
                  <span className="font-semibold">₹{deductions}</span>
                </h2>
                <div className="w-full h-[1px] bg-gray-300"></div>

                <h2 className="text-sm">
                  Net Salary :{" "}
                  <span className="font-semibold">
                    {/* ₹{netSalary + salaryValues[salaryValues.length - 1]} */}
                    ₹{newSalary}
                    {/* ₹{totalSalary - deductions} */}
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
                  :
                  <span className="font-semibold">
                    ₹{(newSalary / 12).toFixed(2)}
                  </span>
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

        {/* Employee Leave Deatils */}
        {employeeID === "add-employee" ||
        employeeID === "add-faculty" ? null : (
          <div className="p-10 border card-shdow rounded-3xl">
            <h2 className="text-2xl font-semibold pb-6">Leave information</h2>

            <div className="flex items-center gap-5 flex-wrap *:flex-grow">
              <Input
                viewOnly={!isNewEmployee}
                key="cl"
                required
                name="cl"
                label="Casual Leave"
                defaultValue={employeeInfo?.leave_details?.[0]?.cl || 0}
              />
              <Input
                viewOnly={!isNewEmployee}
                key="sl"
                required
                name="sl"
                label="Sick Leave"
                defaultValue={employeeInfo?.leave_details?.[0]?.sl || 0}
              />
              <Input
                viewOnly={!isNewEmployee}
                key="el"
                required
                name="el"
                label="Earned Leave"
                defaultValue={employeeInfo?.leave_details?.[0]?.el || 0}
              />
              {employeeInfo?.gender === "Male" ? null : (
                <Input
                  viewOnly={!isNewEmployee}
                  key="ml"
                  required
                  name="ml"
                  label="Maternity Leave"
                  defaultValue={employeeInfo?.leave_details?.[0].ml || 0}
                />
              )}
            </div>
          </div>
        )}

        {/* Actions Buttons (Form Buttons) */}
        <div className="flex items-center gap-5">
          <Button
            type="button"
            onClick={() => {
              route.back();
            }}
            className="flex items-center gap-2"
          >
            <IoMdArrowBack />
            Back
          </Button>

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
