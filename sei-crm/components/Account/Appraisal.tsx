import React from "react";
import { InfoLayout } from "./InfoLayout";
import { IoIosAdd } from "react-icons/io";
import Button from "../Button";
import { useRouter } from "next/navigation";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { getAuthToken } from "@/app/utils/getAuthToken";
import { ISuccess, TAppraisalList } from "@/types";
import { beautifyDate } from "@/app/utils/beautifyDate";
import HandleSuspence from "../HandleSuspence";
import { BiEdit } from "react-icons/bi";
import Link from "next/link";

interface IProps {
  type: "own" | "others";
}

async function fetchAppraisals(type: "own" | "others") {
  return (
    await axios.get(`${BASE_API}/employee/appraisal?type=${type}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthToken(),
      },
    })
  ).data;
}

export default function Appraisal({ type }: IProps) {
  const route = useRouter();

  const {
    data: appraisal,
    error,
    isFetching,
  } = useQuery<ISuccess<TAppraisalList[]>>({
    queryKey: "get-appraisals",
    queryFn: () => fetchAppraisals(type),
    refetchOnMount: true,
  });

  return (
    <InfoLayout>
      <div className="relative pb-6 space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">
            {type === "own" ? "Appraisals" : "Others Appraisal"}
          </h2>
          <Button
            onClick={() => route.push("/account?tab=appraisalform&id=add")}
            className={`absolute right-0 top-0 ${
              type === "others" ? "hidden" : "flex items-center gap-2"
            }`}
          >
            <IoIosAdd size={15} />
            Add New Appraisal Request
          </Button>
        </div>

        <HandleSuspence
          isLoading={isFetching}
          error={error}
          dataLength={appraisal?.data.length}
        >
          <ul className="space-y-5">
            {appraisal?.data.map((appraisal) => (
              <li
                key={appraisal.appraisal_id}
                className="space-y-1 relative border-b-2 pb-3"
              >
                <h3 className="text-sm font-semibold space-x-1">
                  <span>Appraisal Request</span>
                  <span className="underline text-gray-600">
                    Created At {beautifyDate(appraisal.created_at)}
                  </span>
                </h3>
                {/* <div> */}
                {/* <h4 className="text-xs text-gray-500 float-left mr-1">
                  Status :
                </h4> */}
                <ul className="flex items-center gap-1 flex-wrap">
                  {appraisal.sended_to.map((item, index) => (
                    <li key={index} className="flex items-center gap-1 text-xs">
                      <span className="font-semibold text-yellow-700">
                        {/* {type === "own"
                          ? item.status === "Pending"
                            ? "Sended To : "
                            : item.status === "Approved"
                            ? "Approved By : "
                            : "Rejected By : "
                          : "Received From : "} */}

                        {type === "others"
                          ? "Received From : "
                          : item.status === "Pending"
                          ? "Sended To : "
                          : item.status === "Approved"
                          ? "Approved By : "
                          : "Rejected By : "}

                        {/* {} */}
                      </span>
                      <span>{item.name}</span>
                    </li>
                  ))}
                </ul>
                {/* </div> */}

                <Link
                  href={
                    "/account?tab=appraisalform&id=" + appraisal.appraisal_id
                  }
                  className={`absolute top-0 right-0 cursor-pointer active:scale-90 ${
                    type === "own" ? "hidden" : "inline-block"
                  }`}
                >
                  <BiEdit size={17} />
                </Link>
              </li>
            ))}
          </ul>
        </HandleSuspence>
      </div>
    </InfoLayout>
  );
}
