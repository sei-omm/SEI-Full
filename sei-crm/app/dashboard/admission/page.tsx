"use client";

import { BASE_API } from "@/app/constant";
import { useDoMutation } from "@/app/utils/useDoMutation";
import ManageAdmissionFilter from "@/components/Admission/ManageAdmissionFilter";
import HandleSuspence from "@/components/HandleSuspence";
import Spinner from "@/components/Spinner";
import TagsBtn from "@/components/TagsBtn";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { ISuccess } from "@/types";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { GrEdit } from "react-icons/gr";
import { IoCloseSharp, IoDocumentTextOutline } from "react-icons/io5";
import { MdOutlineDone } from "react-icons/md";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";

type TTable = {
  heads: string[];
  body: (string | null)[][];
};

type TAdmissions = {
  form_id: string;
  form_status: string;
  profile_image: string;
  student_name: string;
  student_id: number;
};

export default function Admission() {
  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: ["Name", "Form Id", "Status", "Action"],
    body: [],
  });
  const { mutate, isLoading: isMutating } = useDoMutation();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const {
    data: admissions,
    isFetching,
    refetch,
    error,
  } = useQuery<ISuccess<TAdmissions[]>>({
    queryKey: ["get-admission", searchParams.toString()],
    queryFn: async () =>
      (
        await axios.get(
          BASE_API + "/admission?" + decodeURI(searchParams.toString())
        )
      ).data,
    enabled: searchParams.size !== 0,
    onSuccess(data) {
      const oldTDatas = { ...tableDatas };
      oldTDatas.body = data.data.map((item) => [
        item.student_name,
        item.form_id,
        item.form_status,
        "actionBtn",
      ]);
      setTableDatas(oldTDatas);
    },
    refetchOnMount : true
  });

  const whichStatusBtn = useRef<"Approve" | "Cancel">("Approve");
  const handleStatusBtn = (status: "Approve" | "Cancel", formId: string) => {
    whichStatusBtn.current = status;
    const formData = new FormData();
    formData.set("form_status", status);
    formData.set("form_id", formId);
    mutate({
      apiPath: `/admission/update-form-status`,
      method: "patch",
      headers: {
        "Content-Type": "application/json",
      },
      formData,
      onSuccess: () => {
        refetch();
      },
    });
  };

  return (
    <>
      <ManageAdmissionFilter />
      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={admissions?.data.length}
      >
        {/* table info */}
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
                        {value?.includes("@") ? (
                          <Link
                            className="text-[#346FD8] font-medium"
                            href={`mailto:${value}`}
                          >
                            {value}
                          </Link>
                        ) : (
                          <span className="line-clamp-1 inline-flex gap-x-3">
                            {value === "actionBtn" ? (
                              <div className="flex-center gap-4">
                                {isMutating &&
                                whichStatusBtn.current === "Approve" ? (
                                  <Spinner
                                    key={"Spinner " + rowIndex}
                                    size="20px"
                                  />
                                ) : (
                                  <button
                                    disabled={isMutating}
                                    onClick={() =>
                                      handleStatusBtn(
                                        "Approve",
                                        `${admissions?.data[rowIndex]?.form_id}`
                                      )
                                    }
                                    title="verify form"
                                    className="size-[20px] cursor-pointer overflow-hidden rounded-full p-1 flex-center text-white bg-green-800"
                                  >
                                    <MdOutlineDone />
                                  </button>
                                )}

                                <Link
                                  className="active:scale-90"
                                  href={`admission/manage-form?form-id=${admissions?.data[rowIndex]?.form_id}&student-id=${admissions?.data[rowIndex]?.student_id}`}
                                >
                                  <GrEdit />
                                </Link>

                                {/* <Link
                                href={""}
                                title="Verify Form"
                                className="size-5 active:scale-90 shadow-2xl border-gray-700 border bg-green-600 flex-center rounded-full text-white"
                              >
                                <MdDone />
                              </Link>
                              <Link
                                href={""}
                                title="Reject Form"
                                className="size-5 active:scale-90 shadow-2xl bg-red-600 border-gray-700 border flex-center rounded-full text-white"
                              >
                                <MdClose />
                              </Link> */}
                                {/* <Link href={""} title="Print Form">
                                <IoPrint size={18} />
                              </Link> */}

                                <IoDocumentTextOutline
                                  onClick={() => {
                                    dispatch(
                                      setDialog({
                                        type: "OPEN",
                                        dialogId:
                                          "view-student-upload-documents",
                                        extraValue: {
                                          studentId: `${admissions?.data[rowIndex].student_id}`,
                                        },
                                      })
                                    );
                                  }}
                                  title="Students Uploaded Documents"
                                  className="cursor-pointer active:scale-90"
                                  size={18}
                                />

                                {isMutating &&
                                whichStatusBtn.current === "Cancel" ? (
                                  <Spinner
                                    key={"Spinner" + rowIndex}
                                    size="20px"
                                  />
                                ) : (
                                  <button
                                    disabled={isMutating}
                                    onClick={() =>
                                      handleStatusBtn(
                                        "Cancel",
                                        `${admissions?.data[rowIndex].form_id}`
                                      )
                                    }
                                    title="reject form"
                                    className="size-[20px] cursor-pointer overflow-hidden rounded-full p-1 flex-center text-white bg-red-800"
                                  >
                                    <IoCloseSharp />
                                  </button>
                                )}
                              </div>
                            ) : columnIndex === 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="size-10 bg-gray-200 overflow-hidden rounded-full">
                                  {admissions?.data[rowIndex]?.profile_image ===
                                  null ? null : (
                                    <Image
                                      className="size-full object-cover"
                                      src={
                                        admissions?.data[rowIndex]
                                          ?.profile_image || ""
                                      }
                                      alt="Employee Image"
                                      height={90}
                                      width={90}
                                      quality={100}
                                    />
                                  )}
                                </div>
                                {value}
                              </div>
                            ) : value === "Approve" ? (
                              <TagsBtn type="SUCCESS">Approved</TagsBtn>
                            ) : value === "Cancel" ? (
                              <TagsBtn type="FAILED">Cancelled</TagsBtn>
                            ) : value === "Pending" || value === null ? (
                              <TagsBtn type="PENDING">Pending</TagsBtn>
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
    </>
  );
}
