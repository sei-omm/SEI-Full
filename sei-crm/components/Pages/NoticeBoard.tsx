"use client";

import { useRef, useState } from "react";
import Button from "../Button";
import { IoAdd } from "react-icons/io5";
import Link from "next/link";
import HandleSuspence from "../HandleSuspence";
import { CiEdit } from "react-icons/ci";
import { useQuery } from "react-query";
import { ISuccess, TNoticeBoard } from "@/types";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import Pagination from "../Pagination";
import TagsBtn from "../TagsBtn";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { AiOutlineDelete } from "react-icons/ai";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Spinner from "../Spinner";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";

type TTable = {
  heads: string[];
  body: (string | null)[][];
};

const getNotices = async (searchParams : ReadonlyURLSearchParams) => {
  const urlSearchParams = new URLSearchParams(searchParams);
  urlSearchParams.set("for", "crm");
  return (await axios.get(`${BASE_API}/website/notice?${urlSearchParams.toString()}`)).data;
};

export default function NoticeBoard() {
  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: ["Notice Heading", "Created At", "Visibility", "Action"],
    body: [],
  });

  const currentClickedNoticeId = useRef(-1);
  const searchParams = useSearchParams();

  const { error, isFetching, data, refetch } = useQuery<
    ISuccess<TNoticeBoard[]>
  >({
    queryKey: ["get-single-notice", searchParams.toString()],
    queryFn: () => getNotices(searchParams),
    onSuccess(data) {
      setTableDatas((prev) => ({
        ...prev,
        body: data.data.map((item) => [
          item.heading,
          beautifyDate(item.created_at),
          item.visible.toString(),
          "actionBtn",
        ]),
      }));
    },
    refetchOnMount: true,
  });

  const { isLoading, mutate } = useDoMutation();
  const handleDelete = (notice_id?: number) => {
    if (!notice_id) return alert("No Notice Id Found");

    if (!confirm("Are you sure you want to delete this notice?")) return;

    currentClickedNoticeId.current = notice_id;

    mutate({
      apiPath: "/website/notice",
      method: "delete",
      id: notice_id,
      onSuccess() {
        refetch();
      },
    });
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-end">
        <Link href="./notice-board/add">
          <Button className="flex items-center gap-3">
            <IoAdd size={18} />
            Add New Notice
          </Button>
        </Link>
      </div>

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={data?.data.length}
      >
        <div className="w-full overflow-hidden card-shdow">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
            <table className="min-w-max w-full table-auto">
              <thead className="uppercase w-full border-b border-gray-100">
                <tr>
                  {tableDatas.heads?.map?.((item) => (
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
                {tableDatas.body?.map?.((itemArray, rowIndex) => (
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
                          <div className="flex items-center gap-3 flex-wrap">
                            <TagsBtn
                              type={value === "true" ? "SUCCESS" : "FAILED"}
                            >
                              {value === "true" ? "Public" : "Private"}
                            </TagsBtn>
                          </div>
                        ) : value === "actionBtn" ? (
                          <div className="flex items-center gap-6">
                            <Link
                              className="active:scale-90"
                              href={`/dashboard/website-management/notice-board/${data?.data[rowIndex]?.notice_id}`}
                            >
                              <CiEdit className="cursor-pointer" size={18} />
                            </Link>
                            {isLoading &&
                            currentClickedNoticeId.current ===
                              data?.data[rowIndex]?.notice_id ? (
                              <Spinner size="18px" />
                            ) : (
                              <AiOutlineDelete
                                className="cursor-pointer"
                                onClick={() =>
                                  handleDelete(data?.data[rowIndex]?.notice_id)
                                }
                              />
                            )}
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

      <Pagination dataLength={data?.data.length} />
    </div>
  );
}
