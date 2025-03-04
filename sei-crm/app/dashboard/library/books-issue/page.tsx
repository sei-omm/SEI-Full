"use client";
import { BASE_API } from "@/app/constant";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Button from "@/components/Button";
import DateDurationFilter from "@/components/DateDurationFilter";
import DropDown from "@/components/DropDown";
import HandleSuspence from "@/components/HandleSuspence";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { ISuccess } from "@/types";
import axios from "axios";
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import React, { useEffect, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { IoAdd } from "react-icons/io5";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";

async function getIssueBookList(searchParams: ReadonlyURLSearchParams) {
  return (
    await axios.get(
      `${BASE_API}/library/physical/books/issue?${
        searchParams.toString() === ""
          ? "institute=Kolkata"
          : searchParams.toString()
      }`
    )
  ).data;
}

interface IssueBookRecord {
  phy_lib_book_issue_id: number;
  student_name: string;
  indos_number: string;
  course_name: string;
  book_name: string;
  edition: string;
  issue_date: string; // You might consider using Date type if you want to handle dates more effectively
  return_date: string | null; // return_date can be a string or null
}

type TTable = {
  head: string[];
  body: (string | null)[][];
};

type TUpdateInfo = {
  phy_lib_book_issue_id: number;
  return_date: string;
};

type TSearchBy = "indos_number" | "course_name" | "student_name";

export default function BooksIssue() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const [updateInfo, setUpdateInfo] = useState<TUpdateInfo[]>([]);
  const [searchBy, setSearchBy] = useState<TSearchBy>("indos_number");
  const [campus, setCampus] = useState(
    searchParams.get("institute") || "Kolkata"
  );
  const route = useRouter();

  const [issueBookTable, setIssueBookTable] = useState<TTable>({
    head: [
      // "Candidate name",
      "Issued To",
      "INDOS No.",
      "Course Name",
      "Books Name",
      "Edition/Vol",
      "Issue Date",
      "Received Date",
    ],
    body: [],
  });

  const {
    data: issueBook,
    isFetching,
    error,
    refetch,
  } = useQuery<ISuccess<IssueBookRecord[]>>({
    queryKey: ["get-issue-book-report", searchParams.toString()],
    queryFn: () => getIssueBookList(searchParams),
    onSuccess(data) {
      setIssueBookTable((preState) => ({
        ...preState,
        body: data.data.map((item) => [
          item.student_name,
          item.indos_number || "N/A",
          item.course_name || "N/A",
          item.book_name,
          item.edition,
          beautifyDate(item.issue_date),
          item.return_date,
        ]),
      }));
    },
    refetchOnMount: true,
  });

  const { isLoading, mutate } = useDoMutation();
  const { closeDialog, openDialog } = useLoadingDialog();
  useEffect(() => {
    if (isLoading) {
      openDialog();
    } else {
      closeDialog();
    }
  }, [isLoading]);

  const updateReturnDate = () => {
    mutate({
      apiPath: "/library/physical/books/return",
      method: "patch",
      formData: updateInfo,
      onSuccess() {
        setUpdateInfo([]);
        refetch();
      },
    });
  };

  return (
    <div className="space-y-4">
      <Button
        className="fixed bottom-5 right-20 flex items-center gap-3 z-50"
        onClick={() => {
          dispatch(
            setDialog({ type: "OPEN", dialogId: "issue-book-to-student" })
          );
        }}
      >
        <IoAdd size={18} />
        Issue Book
      </Button>

      <DateDurationFilter>
        <DropDown
          name="search_by"
          label="Search By *"
          options={[
            {
              text: "Issue Date",
              value: "issue_date",
            },
            {
              text: "Received Date",
              value: "received_date",
            },
          ]}
        />
      </DateDurationFilter>

      <div className="flex items-center gap-2">
        <DropDown
          name="institute"
          label=""
          options={[
            { text: "Kolkata", value: "Kolkata" },
            { text: "Faridabad", value: "Faridabad" },
          ]}
          defaultValue={searchParams.get("institute") || campus}
          onChange={(option) => setCampus(option.value)}
        />
        <DropDown
          label=""
          options={[
            {
              text: "Faculty Name",
              value: "faculty_name",
            },
            {
              text: "Student Name",
              value: "student_name",
            },
            {
              text: "Book Name",
              value: "book_name",
            },
            {
              text: "Course Name",
              value: "course_name",
            },
            {
              text: "Indos Number",
              value: "indos_number",
            },
          ]}
          onChange={(option) => setSearchBy(option.value)}
          defaultValue={searchParams.get("search_by") || searchBy}
        />
        <SearchInput
          placeHolder={`Search by ${searchBy.replaceAll("_", " ")}`}
          search_key="search_keyword"
          handleSearch={(keyword) => {
            const urlSearchParams = new URLSearchParams();
            urlSearchParams.set("search_by", searchBy);
            urlSearchParams.set("search_keyword", keyword);
            urlSearchParams.set("institute", campus);
            route.push(
              `/dashboard/library/books-issue?${urlSearchParams.toString()}`
            );
          }}
        />
      </div>

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={issueBook?.data.length}
      >
        <div className="w-full overflow-hidden card-shdow">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
            <table className="min-w-max w-full table-auto">
              <thead className="uppercase w-full border-b border-gray-100">
                <tr>
                  {issueBookTable.head.map((item) => (
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
                {issueBookTable.body.map((itemArray, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-100 group/bodyitem"
                  >
                    {/* {currentEditRowIndex.includes(rowIndex) && (
                        <input
                          hidden
                          name="phy_lib_book_id"
                          value={bookList?.data[rowIndex].phy_lib_book_id}
                        />
                      )} */}

                    {itemArray.map((value, columnIndex) => (
                      <td
                        className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                        key={`${rowIndex}${columnIndex}`}
                      >
                        {value === "actionBtn" ? (
                          <CiEdit
                            // onClick={() => {
                            //   if (currentEditRowIndex.includes(rowIndex))
                            //     return;

                            //   setCurrentEditRowIndex((preState) => [
                            //     ...preState,
                            //     rowIndex,
                            //   ]);
                            // }}
                            size={18}
                            className="cursor-pointer active:scale-90"
                          />
                        ) : // ) : currentEditRowIndex.includes(rowIndex) ? (
                        //   <Input
                        //     name={columnIndex.toString()}
                        //     defaultValue={value}
                        //   />
                        // ) : (
                        columnIndex === 6 && value === null ? (
                          <input
                            onChange={(e) => {
                              const phy_lib_book_issue_id =
                                issueBook?.data[rowIndex]
                                  .phy_lib_book_issue_id || 0;
                              const preState = [...updateInfo];
                              const existIndex = updateInfo.findIndex(
                                (item) =>
                                  item.phy_lib_book_issue_id ===
                                  phy_lib_book_issue_id
                              );
                              if (existIndex === -1) {
                                preState.push({
                                  phy_lib_book_issue_id,
                                  return_date: e.currentTarget.value,
                                });
                              } else {
                                preState[existIndex].return_date =
                                  e.currentTarget.value;
                              }
                              setUpdateInfo(preState);
                            }}
                            type="date"
                          />
                        ) : columnIndex === 6 && value !== null ? (
                          beautifyDate(value as string)
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

        {updateInfo.length !== 0 && (
          <div className="flex items-center justify-end">
            <Button onClick={updateReturnDate}>Update Change</Button>
          </div>
        )}
      </HandleSuspence>

      <Pagination dataLength={issueBook?.data.length} />
    </div>
  );
}
