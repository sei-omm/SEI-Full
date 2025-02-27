import React from "react";
import Pagination from "../Pagination";
import { CustomErrorPage } from "../CustomErrorPage";
import { IError, ILeave, ISuccess } from "@/types";
import { BASE_API } from "@/app/constant";
import Image from "next/image";
import TagsBtn from "../TagsBtn";
import { IoPrintSharp } from "react-icons/io5";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import UnAuthPage from "../UnAuthPage";

interface IProps {
  searchParams: any;
}

const tableDatas = {
  heads: ["Name", "Leave From", "Leave To", "Description", "Status", "Action"],
  body: [
    [
      "Somnath Gupta",
      "12 Jun, 2024",
      "15 Jun, 2024",
      "Wedding leave",
      "approve",
      "action",
    ],
    [
      "Arindam Gupta",
      "12 Jun, 2024",
      "12 Jun 2024",
      "Medical leave",
      "decline",
      "action",
    ],
  ],
};

export default async function LeaveRequests({ searchParams }: IProps) {
  // const AUTH_TOKEN_OBJ = await getAuthTokenServer();

  const urlSearchParams = new URLSearchParams(searchParams);

  let result: ISuccess<ILeave[]> | null = null;

  try {
    const { data: serverResponse } = await axios.get<ISuccess<ILeave[]>>(
      `${BASE_API}/hr/leave?institute=${
        urlSearchParams.get("institute") || "Kolkata"
      }`
    );
    tableDatas.body = serverResponse.data.map((leaveInfo) => [
      leaveInfo.employee_name,
      leaveInfo.leave_from,
      leaveInfo.leave_to,
      leaveInfo.leave_reason,
      leaveInfo.leave_status,
      "actionBtn",
    ]);

    result = serverResponse;
  } catch (error) {
    const err = error as AxiosError<IError>;
    if (err.response?.status === 401) return <UnAuthPage />;
    return <CustomErrorPage message={err.response?.data?.message || ""} />;
  }

  return (
    <>
      <h2 className="text-xl font-semibold">Leave Requests</h2>
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black card-shdow rounded-xl">
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
            {tableDatas.body.map((itemArray, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-100 group/bodyitem">
                {itemArray.map((value, colIndex) => (
                  <td
                    className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                    key={value}
                  >
                    <span className="line-clamp-1 inline-flex gap-x-3">
                      {value === "actionBtn" ? (
                        <div className="flex items-center justify-center">
                          <Link
                            target="__blank"
                            href={`${BASE_API}/hr/leave/receipt/${result?.data[rowIndex].id}`}
                          >
                            <IoPrintSharp size={20} />
                          </Link>
                        </div>
                      ) : colIndex === 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="size-10 bg-gray-200 overflow-hidden rounded-full">
                            <Image
                              className="size-full object-cover"
                              src={
                                result?.data[rowIndex].employee_profile_image ||
                                ""
                              }
                              alt="Employee Image"
                              height={90}
                              width={90}
                              quality={100}
                            />
                          </div>
                          {value}
                        </div>
                      ) : value === "success" ? (
                        <TagsBtn type="SUCCESS">Approve</TagsBtn>
                      ) : value === "decline" ? (
                        <TagsBtn type="FAILED">Decline</TagsBtn>
                      ) : value === "pending" ? (
                        <TagsBtn type="PENDING">Pending</TagsBtn>
                      ) : colIndex === 1 || colIndex === 2 ? (
                        new Date(value).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      ) : (
                        value
                      )}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination dataLength={result?.data.length} />
    </>
  );
}
