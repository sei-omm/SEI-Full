"use client";

import { BASE_API } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { stickyFirstCol } from "@/app/utils/stickyFirstCol";
import DropDown from "@/components/DropDown";
import HandleSuspence from "@/components/HandleSuspence";
import Pagination from "@/components/Pagination";
import TagsBtn from "@/components/TagsBtn";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { ISuccess, TRefundDetails } from "@/types";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { CiEdit } from "react-icons/ci";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";

async function fetchManageRefund(filters: string) {
  return (await axios.get(`${BASE_API}/payment/refund${filters}`)).data;
}

type TTable = {
  heads: string[];
  body: (string | null)[][];
};

export default function ManageRefund() {
  const dispatch = useDispatch();
  const [institute, setInstitute] = useState("Kolkata");
  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: [
      "Student Name",
      "Course Name",
      "Batch Date",
      "Refund Amount",
      "Reason",
      "Bank Details",
      "Executive Name",
      "Refund ID",
      "Mode",
      "Status",
      "Action",
    ],
    body: [],
  });

  const {
    error,
    isFetching,
    data: report,
  } = useQuery<ISuccess<TRefundDetails[]>>({
    queryKey: ["refund-list", institute],
    queryFn: () => fetchManageRefund(`?institute=${institute}`),
    onSuccess(data) {
      setTableDatas((preState) => ({
        ...preState,
        body: data.data.map((item) => [
          item.name,
          item.course_name,
          item.start_date,
          item.refund_amount,
          item.refund_reason,
          item.bank_details,
          item.executive_name,
          item.refund_id,
          item.mode,
          item.status,
          "actionBtn",
        ]),
      }));
    },
    refetchOnMount: true,
  });

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Refund Requests</h2>
        <DropDown
          onChange={(item) => setInstitute(item.value)}
          name="institute"
          label="Campus"
          options={[
            { text: "Kolkata", value: "Kolkata" },
            { text: "Faridabad", value: "Faridabad" },
          ]}
        />
      </div>
      <HandleSuspence
        noDataMsg="No Refund Request Avilable"
        error={error}
        isLoading={isFetching}
        dataLength={report?.data.length}
      >
        <div className="w-full overflow-hidden card-shdow">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
            <table className="min-w-max w-full table-auto">
              <thead className="uppercase w-full border-b border-gray-100">
                <tr>
                  {tableDatas.heads.map((item, index) => (
                    <th
                      className={`text-left text-[14px] font-semibold pb-2 px-5 py-4 ${stickyFirstCol(
                        index
                      )}`}
                      key={item}
                    >
                      <span>{item}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableDatas.body.map((itemArray, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-100 group/bodyitem"
                  >
                    {itemArray.map((value, columnIndex) => (
                      <td
                        className={`text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52 ${stickyFirstCol(
                          columnIndex
                        )}`}
                        key={value}
                      >
                        {typeof value !== "number" && value?.includes("@") ? (
                          <Link
                            className="text-[#346FD8] font-medium"
                            href={`mailto:${value}`}
                          >
                            {value}
                          </Link>
                        ) : (
                          <span
                            className={`line-clamp-1 inline-flex gap-x-3  ${
                              columnIndex === 4 && parseInt(value as any) > 0
                                ? "text-red-600 font-semibold"
                                : ""
                            }`}
                          >
                            {columnIndex === 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="size-10 bg-gray-200 overflow-hidden rounded-full">
                                  {!report ||
                                  report.data[rowIndex].profile_image ===
                                    null ? null : (
                                    <Image
                                      className="size-full object-cover"
                                      src={
                                        report.data[rowIndex].profile_image ||
                                        ""
                                      }
                                      alt="Student Image"
                                      height={90}
                                      width={90}
                                      quality={100}
                                    />
                                  )}
                                </div>
                                {value}
                              </div>
                            ) : value === "Approved" ? (
                              <TagsBtn type="SUCCESS">Approved</TagsBtn>
                            ) : value === "Reject" ? (
                              <TagsBtn type="FAILED">Cancelled</TagsBtn>
                            ) : value === "Pending" || value === null ? (
                              <TagsBtn type="PENDING">Pending</TagsBtn>
                            ) : columnIndex === 2 ? (
                              beautifyDate(value)
                            ) : value === "actionBtn" ? (
                              <div>
                                <div
                                  onClick={() =>
                                    dispatch(
                                      setDialog({
                                        type: "OPEN",
                                        dialogId: "refund-form-dialog",
                                        extraValue: report?.data[rowIndex],
                                      })
                                    )
                                  }
                                  className="flex items-center gap-1 underline cursor-pointer"
                                >
                                  <CiEdit size={18} />
                                  <span className="font-semibold">open</span>
                                </div>
                              </div>
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
        </div>
      </HandleSuspence>
      <Pagination dataLength={report?.data.length} />
    </div>
  );
}
