import { BASE_API } from "@/app/constant";
import Contacts from "@/components/Contacts";
import { ISuccess } from "@/types";
import React from "react";
import { BsPeople } from "react-icons/bs";
import { FaPeopleGroup } from "react-icons/fa6";
import { FcLeave } from "react-icons/fc";
import { MdOutlinePendingActions } from "react-icons/md";

const data = [
  {
    icon: <BsPeople size={22} color="#F44336" />,
    text: "Total Employee",
    value: "0",
  },
  {
    icon: <FaPeopleGroup size={22} color="#F44336" />,
    text: "Active Employee",
    value: "0",
  },
  {
    icon: <FcLeave size={22} color="#F44336" />,
    text: "Absent Employee",
    value: "0",
  },
  {
    icon: <MdOutlinePendingActions size={22} color="#F44336" />,
    text: "Leave Request",
    number: "0",
  },
];

interface IProps {
  searchParams: {
    type?: string;
  };
}

export default async function page({ searchParams }: IProps) {
  const response = await fetch(`${BASE_API}/hr/dashboard`, {
    cache: "no-store",
  });
  const result = (await response.json()) as ISuccess<{
    total_employees: string;
    active_employees: string;
    employees_on_leave: string;
    pending_leave_request: string;
  }>;

  data[0].value = result.data.total_employees;
  data[1].value = result.data.active_employees;
  data[2].value = result.data.employees_on_leave;
  data[3].value = result.data.pending_leave_request;

  return (
    <section className="w-full">
      <div className="grid grid-cols-4 py-5 gap-5">
        {data.map((item, index) => (
          <div key={index} className="flex gap-3 rounded-2xl card-shdow p-5">
            <div className="bg-[#f4f4f5] flex-center size-12 rounded-2xl">
              {/* <BsPeople size={18} /> */}
              {item.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500">{item.text}</span>
              <span className="font-semibold">{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      <Contacts searchParams={searchParams} />
    </section>
  );
}
