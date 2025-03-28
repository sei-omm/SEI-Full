"use client";

import { BASE_API } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Button from "@/components/Button";
import HandleSuspence from "@/components/HandleSuspence";
import LibraryFilters from "@/components/LibraryFilters";
import Pagination from "@/components/Pagination";
import TagsBtn from "@/components/TagsBtn";
import { IError, ISuccess, TLibrary } from "@/types";
import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { BsFiletypeDocx } from "react-icons/bs";
import { CiEdit } from "react-icons/ci";
import { FaRegFileAudio, FaRegFileImage } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { IoAddOutline, IoEyeOutline, IoLinkSharp } from "react-icons/io5";
import { MdOutlineDone } from "react-icons/md";
import { PiFilePdf } from "react-icons/pi";
import { useQuery } from "react-query";

type TTable = {
  heads: string[];
  body: (string | null)[][];
};

const file_types_icons: any = {
  pdf: <PiFilePdf />,
  audio: <FaRegFileAudio />,
  doc: <BsFiletypeDocx />,
  image: <FaRegFileImage />,
  link: <IoLinkSharp />,
};

export default function LibraryManagement() {
  const urlSearchParams = useSearchParams();

  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: ["File Name", "Course / Subject", "Status", "Created At", "Action"],
    body: [],
  });

  const { mutate, isLoading: isMutating } = useDoMutation();

  const {
    data: tableData,
    error,
    isFetching,
    refetch,
  } = useQuery<ISuccess<TLibrary[]>, IError>({
    queryKey: ["get-filter-courses", urlSearchParams.toString()],
    queryFn: async () =>
      (await axios.get(BASE_API + "/library?" + urlSearchParams.toString()))
        .data,
    onSuccess: (data) => {
      const newTableVal = { ...tableDatas };
      if (
        `${
          urlSearchParams.get("visibility") === "subject-specific"
            ? "Subjects"
            : urlSearchParams.get("visibility") === "course-specific"
            ? "Course"
            : "Course / Subject"
        }`
      )
        if (urlSearchParams.get("visibility") === "subject-specific") {
          newTableVal.heads[1] = "Subjects";
        } else if (urlSearchParams.get("visibility") === "course-specific") {
          newTableVal.heads[1] = "Courses";
        } else {
          newTableVal.heads[1] = "Course / Subject";
        }
      newTableVal.body = data.data.map((item) => [
        item.library_file_name,
        item.course_or_subject_name || "N/A",
        item.is_active ? "Public" : "Private",
        beautifyDate(item.created_at),
        "actionBtn",
      ]);
      setTableDatas(newTableVal);
    },
    cacheTime: 0,
  });

  async function handleStatusBtn(isActive: boolean, library_id: number) {
    if(!confirm("Are you sure you want to continue?")) return;

    mutate({
      apiPath: "/library/" + library_id,
      method: "patch",
      headers: {
        "Content-Type": "application/json",
      },
      formData: {
        is_active: isActive,
      },
      onSuccess() {
        refetch();
      },
    });
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <LibraryFilters />

      <div className="flex items-center justify-end">
        <Link href={"/dashboard/library/item/add"}>
          <Button className="flex items-center gap-3">
            <IoAddOutline size={18} />
            Add New Item
          </Button>
        </Link>
      </div>

      {/* Files ListView */}
      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={tableData?.data.length}
      >
        <div className="w-full overflow-hidden card-shdow">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
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
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-100 group/bodyitem"
                  >
                    {itemArray.map((value, columnIndex) => (
                      <td
                        className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                        key={value}
                      >
                        {columnIndex === 2 ? (
                          <TagsBtn
                            type={value === "Public" ? "SUCCESS" : "FAILED"}
                          >
                            {value}
                          </TagsBtn>
                        ) : value === "actionBtn" ? (
                          <div className="flex items-center gap-3">
                            <Link
                              target="__blank"
                              href={
                                tableData?.data[rowIndex]
                                  .library_resource_link || "#"
                              }
                            >
                              <IoEyeOutline title="View Resources" size={18}/>
                            </Link>
                            <button
                              disabled={isMutating}
                              onClick={() =>
                                handleStatusBtn(
                                  true,
                                  tableData?.data[rowIndex].library_id || -1
                                )
                              }
                              title="Public Button"
                              className="size-[18px] active:scale-90 cursor-pointer overflow-hidden rounded-full p-1 flex-center text-white bg-green-800"
                            >
                              <MdOutlineDone />
                            </button>
                            <Link
                              className="active:scale-90"
                              href={`/dashboard/library/item/${tableData?.data[rowIndex].library_id}`}
                            >
                              <CiEdit className="cursor-pointer" size={18} />
                            </Link>
                            <button
                              disabled={isMutating}
                              onClick={() =>
                                handleStatusBtn(
                                  false,
                                  tableData?.data[rowIndex].library_id || -1
                                )
                              }
                              title="Private Button"
                              className="size-[18px] active:scale-90 cursor-pointer overflow-hidden rounded-full p-1 flex-center text-white bg-red-800"
                            >
                              <IoMdClose />
                            </button>
                          </div>
                        ) : columnIndex === 0 ? (
                          <div>
                            <span className="float-left mr-2 mt-[1px]">
                              {/* <PiFilePdf size={18} /> */}
                              {
                                file_types_icons[
                                  tableData?.data[rowIndex]
                                    ?.library_file_type || "pdf"
                                ]
                              }
                            </span>
                            <span>{value}</span>
                          </div>
                        ) : (
                          value
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

      <Pagination dataLength={tableData?.data.length} />
    </div>
  );
}
