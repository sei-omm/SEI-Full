import Button from "@/components/Button";
import Input from "@/components/Input";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { GrFormClose } from "react-icons/gr";
import { MdFileDownloadDone } from "react-icons/md";

const tableDatas = {
  heads: ["Name", "Job Title", "Department", "Status", "Action"],
  body: [
    ["Somnath Gupta", "Finance Manager", "Finance", "Present", "toggle"],
    ["Arindam Gupta", "IT Management", "IT", "Absence", "toggle"],
  ],
};

export default function page() {
  return (
    <section className="size-full py-7 space-y-5">
      <div className="space-y-2">
        <Input label="Enter Your Message" placeholder="Message.." />
        <Button>Send Message</Button>
      </div>

      {/* Filter */}

      <div className="flex items-center justify-end">
        <div className="flex items-center gap-4 text-sm cursor-pointer">
          <label
            htmlFor="checkbox-employee"
            className="font-semibold cursor-pointer"
          >
            Select All
          </label>
          <Input id="checkbox-employee" type="checkbox" />
        </div>
      </div>

      {/* Employee List */}
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black card-shdow rounded-2xl">
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
            {tableDatas.body.map((itemArray, index) => (
              <tr key={index} className="hover:bg-gray-100 group/bodyitem">
                {itemArray.map((value, childItemIndex) => (
                  <td
                    className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                    key={value}
                  >
                    {value.includes("@") ? (
                      <Link
                        className="text-[#346FD8] font-medium"
                        href={`mailto:${value}`}
                      >
                        {value}
                      </Link>
                    ) : (
                      <span className="line-clamp-1 inline-flex gap-x-3">
                        {value === "toggle" ? (
                          <Input className="cursor-pointer" type="checkbox" />
                        ) : childItemIndex === 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="size-10 bg-gray-200 overflow-hidden rounded-full">
                              <Image
                                className="size-full object-cover"
                                src={"/employee-sample.jpg"}
                                alt="Employee Image"
                                height={90}
                                width={90}
                                quality={100}
                              />
                            </div>
                            {value}
                          </div>
                        ) : value === "Present" ? (
                          <button
                            className={`flex px-3 py-1 rounded-full text-xs bg-[#15803c36] border border-[#15803D] group-hover/items:flex items-center gap-x-1`}
                          >
                            <MdFileDownloadDone size={18} color="#15803D" />
                            Present
                          </button>
                        ) : value === "Absence" ? (
                          <button
                            className={`flex px-3 py-1 rounded-full text-xs bg-[#f4433636] border border-[#F44336] group-hover/items:flex items-center gap-x-1`}
                          >
                            <GrFormClose size={18} color="#F44336" />
                            Absence
                          </button>
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
  );
}
