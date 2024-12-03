import Button from "@/components/Button";
import React from "react";
import { IoIosAdd } from "react-icons/io";
import { GoDotFill } from "react-icons/go";

import { CiEdit } from "react-icons/ci";
import { IoIosPeople } from "react-icons/io";
import Link from "next/link";
import { BASE_API } from "@/app/constant";
import { notFound } from "next/navigation";
import { IJob, ISuccess } from "@/types";
import { IoLocationOutline } from "react-icons/io5";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { MdOutlineWorkHistory } from "react-icons/md";

// interface IProps {
//   searchParams: string;
// }

export default async function page() {
  const API_TO_HIT = BASE_API + "/hr/job";
  const response = await fetch(API_TO_HIT, { cache: "no-cache" });

  if (!response.ok) {
    return notFound();
  }

  const result = (await response.json()) as ISuccess<IJob[]>;

  return (
    <section>
      <div className="w-full card-shdow rounded-xl p-8 mt-5">
        <div className="flex items-center justify-end">
          <Link href={"/dashboard/hr-module/job-posting/add"}>
            <Button className="flex-center gap-x-2">
              <IoIosAdd size={23} />
              Add New Job Posting
            </Button>
          </Link>
        </div>

        {result.data.length === 0 ? (
          <h2 className="text-center pt-10 text-gray-400 font-semibold">
            No Jobs Avilable
          </h2>
        ) : (
          <ul className="w-full space-y-10">
            {result.data.map((job) => (
              <li key={job.id}>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-10 bg-gray-600 rounded-2xl"></div>
                  <div className="flex flex-col gap-2 justify-between">
                    <h2 className="font-semibold">{job.job_title}</h2>
                    <span className="text-gray-500 text-sm flex items-center flex-wrap gap-x-3 gap-y-1">
                      <span className="flex-center gap-2">
                        <IoLocationOutline />
                        {job.address}
                      </span>
                      <GoDotFill />
                      <span className="flex-center gap-2">
                        <HiOutlineBuildingOffice2 />
                        {job.department_name}
                      </span>

                      <GoDotFill />
                      <span className="flex-center gap-2">
                        <MdOutlineWorkHistory />
                        {job.exprience}
                      </span>
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      {new Date(job.created_at).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    <div className="flex items-center gap-x-4 mt-3">
                      <Link
                        href={`/dashboard/hr-module/job-posting/${job.id}`}
                        className="size-8 flex-center bg-green-200 rounded-full cursor-pointer"
                      >
                        <CiEdit />
                      </Link>
                      {/* <div className="size-8 flex-center bg-red-200 cursor-pointer rounded-full">
                        <AiOutlineDelete />
                      </div> */}
                      <Link
                        href={`/dashboard/hr-module/job-posting/${job.id}/applied-candidates`}
                        className="size-8 flex-center bg-blue-200 cursor-pointer rounded-full"
                      >
                        <IoIosPeople />
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
