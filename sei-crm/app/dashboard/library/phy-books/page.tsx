"use client";

import { BASE_API } from "@/app/constant";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Button from "@/components/Button";
import HandleSuspence from "@/components/HandleSuspence";
import Input from "@/components/Input";
import AddMultiBookForm from "@/components/Library/AddMultiBookForm";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import { Books, ISuccess } from "@/types";
import axios from "axios";
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import React, { useEffect, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { useQuery } from "react-query";

type TTable = {
  head: string[];
  body: string[][];
};

async function getBooksList(searchParams: ReadonlyURLSearchParams) {
  return (
    await axios.get(
      `${BASE_API}/library/physical/books?${searchParams.toString()}`
    )
  ).data;
}

const colIndexToFildKey: any = {
  phy_lib_book_id: "phy_lib_book_id",
  "0": "book_name",
  "1": "edition",
  "2": "author",
  "3": "row_number",
  "4": "shelf",
};

export default function PhysicalLibraryBooks() {
  const [booksTable, setBookTable] = useState<TTable>({
    head: ["Books Name", "Edition/Vol", "Author", "Row No.", "Shelf", "Action"],
    body: [],
  });

  const [currentEditRowIndex, setCurrentEditRowIndex] = useState<number[]>([]);

  const searchParams = useSearchParams();
  const route = useRouter();

  const {
    data: bookList,
    isFetching,
    error,
    refetch,
  } = useQuery<ISuccess<Books[]>>({
    queryKey: ["get-phy-lib-books", searchParams.toString()],
    queryFn: () => getBooksList(searchParams),
    onSuccess(data) {
      setBookTable((preState) => ({
        ...preState,
        body: data.data.map((item) => [
          item.book_name,
          item.edition,
          item.author,
          item.row_number.toString(),
          item.shelf,
          "actionBtn",
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

  const handleFormSubmit = (formData: FormData) => {
    const dataToStore: any[] = [];
    let obj: any = {};
    let loopIndex = 0;

    formData.forEach((value, key) => {
      if (key === "phy_lib_book_id" && loopIndex !== 0) {
        dataToStore.push(obj);
        obj = {};
      }

      obj[colIndexToFildKey[key]] = value;
      loopIndex++;
    });

    dataToStore.push(obj);
    obj = {};

    mutate({
      apiPath: "/library/physical/books",
      method: "put",
      formData: dataToStore,
      onSuccess() {
        setCurrentEditRowIndex([]);
        refetch();
      },
    });
  };

  return (
    <>
      <AddMultiBookForm bookList={bookList?.data || []}/>

      <div className="space-y-5">
        <SearchInput
          placeHolder="Search by book name"
          handleSearch={(search) => {
            const newUrlSearchParams = new URLSearchParams(searchParams);
            newUrlSearchParams.set("book_name", search);
            route.push(
              `/dashboard/library/phy-books?${newUrlSearchParams.toString()}`
            );
          }}
        />

        <HandleSuspence
          isLoading={isFetching}
          error={error}
          dataLength={bookList?.data.length}
        >
          <form action={handleFormSubmit} className="space-y-5">
            <div className="w-full overflow-hidden card-shdow">
              <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
                <table className="min-w-max w-full table-auto">
                  <thead className="uppercase w-full border-b border-gray-100">
                    <tr>
                      {booksTable.head.map((item) => (
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
                    {booksTable.body.map((itemArray, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="hover:bg-gray-100 group/bodyitem"
                      >
                        {currentEditRowIndex.includes(rowIndex) && (
                          <input
                            hidden
                            name="phy_lib_book_id"
                            value={bookList?.data[rowIndex].phy_lib_book_id}
                          />
                        )}

                        {itemArray.map((value, columnIndex) => (
                          <td
                            className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                            key={`${rowIndex}${columnIndex}`}
                          >
                            {value === "actionBtn" ? (
                              <CiEdit
                                onClick={() => {
                                  if (currentEditRowIndex.includes(rowIndex))
                                    return;

                                  setCurrentEditRowIndex((preState) => [
                                    ...preState,
                                    rowIndex,
                                  ]);
                                }}
                                size={18}
                                className="cursor-pointer active:scale-90"
                              />
                            ) : currentEditRowIndex.includes(rowIndex) ? (
                              <Input
                                name={columnIndex.toString()}
                                defaultValue={value}
                              />
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
            {currentEditRowIndex.length !== 0 && (
              <div className="flex items-center justify-end">
                <Button>Updated Info</Button>
              </div>
            )}
          </form>
        </HandleSuspence>

        <Pagination dataLength={bookList?.data.length} />
      </div>
    </>
  );
}
