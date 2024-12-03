import Image from "next/image";
import Link from "next/link";
import React from "react";
import TabMenu from "../components/TabMenu";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdOutlineWorkHistory } from "react-icons/md";
import { GoArrowDownRight } from "react-icons/go";
import OpenDialogButton from "../components/OpenDialogButton";
import Button from "../components/Button";
import { BASE_API } from "../constant";
import { IDepartment, IJob, IResponse } from "../type";

type TTab = {
  isSelected: boolean;
  text: string;
  slug: string;
};

interface IProps {
  searchParams: {
    department: string;
  };
}

export default async function page({ searchParams }: IProps) {
  const [department, jobs] = await Promise.all([
    fetch(BASE_API + "/hr/department"),
    fetch(
      BASE_API +
        `/hr/job${
          parseInt(searchParams.department) === 0
            ? ""
            : "?department=" + searchParams.department
        }`,
        {next : {
          revalidate : 1000
        }}
    ),
  ]);

  const [departmentResult, jobsResult] = await Promise.all([
    department.json() as Promise<IResponse<IDepartment[]>>,
    jobs.json() as Promise<IResponse<IJob[]>>,
  ]);

  console.log(jobsResult);

  const tab_options: TTab[] = [];
  tab_options.push({
    isSelected: 0 === parseInt(searchParams.department),
    text: "View All",
    slug: "?department=0",
  });

  departmentResult.data.forEach((item) => {
    tab_options.push({
      isSelected: item.id === parseInt(searchParams.department),
      text: item.name,
      slug: `?department=${item.id}`,
    });
  });

  return (
    <section>
      <div className="w-full h-[60vh] relative overflow-hidden">
        <Image
          className="size-full object-cover"
          src={"/images/Banners/CareerPageBanner.jpg"}
          alt="Career Page Banner"
          height={1200}
          width={1200}
        />

        <div className="absolute inset-0 size-full bg-[#000000d2]">
          <div className="main-layout size-full flex-center flex-col">
            <h1 className="tracking-wider text-gray-100 text-4xl font-semibold uppercase">
              Career
            </h1>

            <span className="text-background">
              <Link href={"/"}>Home</Link>
              <span> / </span>
              <Link href={"/career"}>Career</Link>
            </span>
          </div>
        </div>
      </div>

      <div className="main-layout py-10">
        <div className="flex flex-col gap-y-2">
          <h2 className="text-5xl font-semibold">
            Be part of our <span className="text-[#e9b858]">Mission</span>
          </h2>
          <h3 className="max-w-[40rem] sm:max-w-full">
            We&apos;re looking for passionate people to join us on our mission.
            We value flat hierarchies, clear communication, and full ownership
            and responsibility
          </h3>
        </div>

        {/* Tab Menu */}
        <div className="mt-5">
          <TabMenu tabs={tab_options} />
        </div>

        {/* Job Listing Section */}
        <ul className="w-full mt-10 space-y-10">
          {jobsResult.data.map((job) => (
            <li key={job.id} className="border-b pb-3">
              <div>
                <h2 className="text-2xl font-semibold">{job.job_title}</h2>
                <p className="text-gray-500">{job.job_description}</p>
              </div>

              <div className="mt-2 flex items-center gap-6 flex-wrap">
                <div>
                  <HiOutlineLocationMarker className="float-left mr-1 mt-1" />
                  <span className="text-sm">{job.address}</span>
                </div>
                <div className="flex items-center gap-x-1">
                  <HiOutlineOfficeBuilding />
                  <span className="text-sm">{job.department_name}</span>
                </div>
                <div className="flex items-center gap-x-1">
                  <MdOutlineWorkHistory />
                  <span className="text-sm">{job.exprience}</span>
                </div>
              </div>
              <OpenDialogButton
                // className="flex items-center text-2xl basis-72 !mt-3"
                className="mt-3"
                dialogKey="apply-job-dialog"
                type="OPEN"
              >
                {/* <span>Apply now</span>
<GoArrowDownRight className="-rotate-90" /> */}
                <Button className="!text-foreground !bg-[#e9b858] w-full !py-1 !min-w-max !px-5 border-gray-600 hover:!bg-background">
                  <span>Apply Now</span>
                  <GoArrowDownRight className="-rotate-90" />
                </Button>
              </OpenDialogButton>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
