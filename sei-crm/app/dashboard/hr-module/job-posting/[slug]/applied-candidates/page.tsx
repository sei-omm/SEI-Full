import Link from "next/link";
import { BsDot } from "react-icons/bs";
import { LiaIdCard } from "react-icons/lia";
import { FaMobileAlt } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { MdDataUsage } from "react-icons/md";
import { MdOutlineWorkHistory } from "react-icons/md";
import { MdOutlineFileDownload } from "react-icons/md";
import { BASE_API } from "@/app/constant";
import { ApplicationStatusType, IJobAppliedCandidate, ISuccess } from "@/types";
import ApplicationStatusDropDown from "@/components/ApplicationStatusDropDown";
import Pagination from "@/components/Pagination";
import BackBtn from "@/components/BackBtn";
import axios from "axios";

interface IProps {
  params: {
    slug: string;
  };
  searchParams: any;
}

export default async function page({ params, searchParams }: IProps) {
  const urlSearchParams = new URLSearchParams(searchParams);

  const result = (await axios.get<ISuccess<IJobAppliedCandidate[]>>(`${BASE_API}/hr/job/apply/${params.slug}?${urlSearchParams.toString()}`)).data

  return (
    <section className="w-full py-9">
      {result?.data?.length === 0 ? (
        <h2 className="text-center text-gray-400 font-semibold">
          No Candidate Has Applied
        </h2>
      ) : (
        <ul className="w-full space-y-10 p-5 card-shdow rounded-2xl">
          {result.data.map((candidateInfo) => (
            <li key={candidateInfo.id}>
              <div className="flex items-center justify-start gap-4">
                <div className="size-12 bg-gray-300 rounded-full flex-center text-xl font-medium">
                  {candidateInfo.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold">{candidateInfo.name}</h2>
                  <div className="flex items-center gap-2">
                    <div className="flex-center gap-2 text-gray-500">
                      <LiaIdCard />
                      <span className="text-sm">
                        {candidateInfo.application_id}
                      </span>
                    </div>
                    <BsDot />
                    <Link
                      href={"tel:" + candidateInfo.contact_number}
                      className="flex-center gap-2 text-gray-500"
                    >
                      <FaMobileAlt />
                      <span className="text-sm">
                        {candidateInfo.contact_number}
                      </span>
                    </Link>
                    <BsDot />
                    <Link
                      href={"mailt:" + candidateInfo.email}
                      className="flex-center gap-2 text-sm text-gray-500"
                    >
                      <HiOutlineMail size={18} />
                      <span>{candidateInfo.email}</span>
                    </Link>
                    <BsDot />
                    <span className="flex-center gap-2 text-sm text-gray-500">
                      <MdDataUsage />
                      {new Date(candidateInfo.dob).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <BsDot />
                    <span className="flex-center gap-2 text-sm text-gray-500">
                      <MdOutlineWorkHistory />
                      {candidateInfo.work_experience}
                    </span>
                  </div>
                  <div className="flex items-center justify-start gap-4 pt-2">
                    <ApplicationStatusDropDown
                      application_list_id={candidateInfo.id}
                      status={
                        candidateInfo.application_status as ApplicationStatusType
                      }
                    />
                    <Link href={candidateInfo.resume} target="_blank">
                      <MdOutlineFileDownload
                        title="Download Resume"
                        className="cursor-pointer"
                        size={18}
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between">
        <BackBtn />

        <Pagination dataLength={result?.data.length} />
      </div>
    </section>
  );
}
