"use client";

import React, { useRef, useState } from "react";
import Input from "./Input";
import Button from "./Button";
import Image from "next/image";
import { AiOutlineDelete } from "react-icons/ai";
import Select from "./Select";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function EmployeeDetailsForm() {
  const filePickerRef = useRef<HTMLInputElement>(null);
  const [gender, setGender] = useState("Male");
  // const [file, setFile] = useState<File | null>(null);
  const [selectedPofileIcon, setSelectedProfileIcon] = useState<string>("");

  const [salaryValues, setSalaryValues] = useState([0, 0, 0, 0, 0]);

  const chartViewData = {
    labels: [
      "Basic Salary",
      "HRA",
      "Other Allowances",
      "Provident Fund",
      "Professional Tax",
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
        ],
        hoverOffset: 4,
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

  const handleUploadIcon = () => {};

  const handleSalaryInput = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newArray = [...salaryValues];
    newArray[index] = parseInt(event.target.value || "0");
    setSalaryValues(newArray);
  };

  const netSalary = salaryValues.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );

  return (
    <form action="" className="space-y-7">
      <div className="flex items-start gap-x-4 p-10 border card-shdow rounded-3xl">
        {/* Logo Div */}
        <div className="size-28 bg-gray-200 overflow-hidden rounded-lg">
          <Image
            className="size-full object-cover"
            src={selectedPofileIcon}
            alt="Logo"
            height={512}
            width={512}
          />
        </div>

        <div className="flex flex-col justify-between h-full space-y-1">
          <h2 className="font-semibold leading-none">Somnath Gupta</h2>
          <p className="text-sm">
            Employee ID : <span className="font-semibold">SG14IOM</span>
          </p>
          <p className="text-xs text-gray-500 font-semibold">
            Date of Join : 1st Jan 2023
          </p>

          <div className="space-x-3">
            <input
              onChange={onFilePicked}
              ref={filePickerRef}
              accept="image/*"
              hidden
              type="file"
            />
            <Button onClick={handleFilePickBtn} type="button">
              Change Logo
            </Button>
            <Button
              onClick={handleUploadIcon}
              type="button"
              className="!bg-transparent !text-black border border-black"
            >
              Upload Icon
            </Button>
          </div>
        </div>
      </div>

      {/* Personal Information  shadow-xl p-10 rounded-3xl border */}
      <div className="p-10 border card-shdow rounded-3xl">
        <h2 className="text-2xl font-semibold pb-6">Personal Informations</h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          <Input label="Full name" placeholder="Somnath Gupta" />
          <Input label="Contact number" placeholder="8784587854" />
          <Input
            type="email"
            label="Email address"
            placeholder="somnathgupta112@gmail.com"
          />

          <Input
            label="Living Address"
            placeholder="3/3, Swami Vivekananda Rd, Vivekananda Pally, Bapuji Colony, Nagerbazar, Dum Dum, Kolkata, West Bengal 700074"
          />
          {/* <Input label="Job Title" placeholder="Finance Manager" />

          <Input label="Department" placeholder="Finance" /> */}

          <Input type="date" label="Date of birth" placeholder="17 Sep, 2024" />
          <div className="space-y-2">
            <span className="block font-semibold text-sm pl-1">
              Select Gender
            </span>
            <Select
              className="!rounded-lg !py-[0.20rem]"
              label={gender}
              options={["Male", "Female"]}
              itemToLoad={(gender) => (
                <h5
                  onClick={() => setGender(gender)}
                  className="px-5 py-3 hover:bg-gray-300"
                >
                  {gender}
                </h5>
              )}
            />
          </div>

          {/* <Input type="file" label="Employee Resume" /> */}
        </div>
      </div>

      {/* Bank Info */}
      <div className="p-10 border card-shdow rounded-3xl">
        <h2 className="text-2xl font-semibold pb-6">Bank information</h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          <Input label="Bank name" placeholder="ICICI Bank" />
          <Input label="Bank account No." placeholder="159843014641" />
          <Input label="Account holder name" placeholder="Somnath Gupta" />
          <Input label="IFSC Code" placeholder="ICI24504" />
        </div>
      </div>

      {/* Documents Info */}
      <div className="p-10 border card-shdow rounded-3xl">
        <h2 className="text-2xl font-semibold pb-6">Documentation</h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          <Input type="file" label="Resume" />
          <Input type="file" label="Pan Card" />
          <Input type="file" label="Aadhaar Card" />
          <Input type="file" label="10th Pass Certificate" />
          <Input type="file" label="12th Pass Certificate" />
          <Input type="file" label="Graduation Certificate" />
        </div>
      </div>

      {/* Salary Info */}
      <div className="p-10 border card-shdow rounded-3xl">
        <h2 className="text-2xl font-semibold pb-6">Salary information</h2>

        <div className="flex items-start">
          <div className="basis-[40%] flex-grow space-y-4">
            <Input
              onChange={(e) => handleSalaryInput(e, 0)}
              label="Basic Salary"
              placeholder="₹83,334"
            />
            <Input
              onChange={(e) => handleSalaryInput(e, 1)}
              label="HRA"
              placeholder="₹41,667"
            />
            <Input
              onChange={(e) => handleSalaryInput(e, 2)}
              label="Other Allowances"
              placeholder="₹41,667"
            />

            <Input
              onChange={(e) => handleSalaryInput(e, 3)}
              label="Provident Fund"
              placeholder="₹10,000"
            />
            <Input
              onChange={(e) => handleSalaryInput(e, 4)}
              label="Professional Tax"
              placeholder="₹200"
            />

            <h2 className="text-sm">
              Total Deductions :{" "}
              <span className="font-semibold">
                ₹
                {salaryValues[salaryValues.length - 1] +
                  salaryValues[salaryValues.length - 2]}
              </span>
            </h2>
            <div className="w-full h-[1px] bg-gray-300"></div>

            <h2 className="text-sm">
              Net Salary : <span className="font-semibold">₹{netSalary}</span>
            </h2>
            <h2 className="text-xs text-gray-500">
              Income Tax : <span>-₹50</span>
            </h2>

            <div className="w-full h-[1px] bg-gray-300"></div>
            <h2 className="text-sm flex items-center justify-between">
              <span className="font-semibold text-gray-500">
                IN HAND SALARY / month&apos;s
              </span>{" "}
              :<span className="font-semibold">₹{netSalary - 50}</span>
            </h2>
          </div>
          <div className="basis-[60%] flex-center mt-20">
            <div className="size-[450px] flex-center">
              <Doughnut data={chartViewData} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-x-6 flex items-center">
        <Button className="min-w-48">Save Information</Button>
        <Button className="min-w-48 !bg-[#F44336] flex-center gap-x-2">
          <AiOutlineDelete />
          Remove Information
        </Button>
      </div>
    </form>
  );
}
