"use client";

import React, { useEffect, useState } from "react";
import Button from "../Button";
import AddMultiBookFormItem from "./AddMultiBookFormItem";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import { queryClient } from "@/redux/MyProvider";
import GenarateExcelReportBtn from "../GenarateExcelReportBtn";
import { Books } from "@/types";
import { useSearchParams } from "next/navigation";
import { usePurifyCampus } from "@/hooks/usePurifyCampus";
import Campus from "../Campus";

interface IProps {
  bookList: Books[];
}

export default function AddMultiBookForm({ bookList }: IProps) {
  const [inputs, setInputs] = useState<number[]>([]);
  const searchParams = useSearchParams();
  const { campus } = usePurifyCampus(searchParams);

  const addNewFormRow = () => {
    setInputs((preState) => [
      ...preState,
      (preState[preState.length - 1] || 0) + 1,
    ]);
  };

  const { isLoading, mutate } = useDoMutation();
  const { openDialog, closeDialog } = useLoadingDialog();

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
      if (key === "book_name" && loopIndex !== 0) {
        dataToStore.push(obj);
        obj = {};
      }

      obj[key] = value;
      obj["institute"] = campus;
      loopIndex++;
    });

    dataToStore.push(obj);
    obj = {};

    mutate({
      apiPath: "/library/physical/books",
      method: "post",
      formData: dataToStore,
      onSuccess() {
        setInputs([]);
        queryClient.invalidateQueries(["get-phy-lib-books"]);
      },
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">

        <Campus changeSearchParamsOnChange label="" />

        <div className="flex items-center gap-4">
          <GenarateExcelReportBtn
            hidden={bookList.length === 0}
            apiPath={`/report/physical-library-book/excel?institute=${campus}`}
          />
          <Button onClick={addNewFormRow}>Add New Book</Button>
        </div>
      </div>

      <form action={handleFormSubmit} className="space-y-3">
        {inputs.map((input) => (
          <AddMultiBookFormItem
            key={input}
            handleDeleteItem={() => {
              setInputs((preState) =>
                preState.filter((eachInput) => eachInput !== input)
              );
            }}
          />
        ))}
        {inputs.length !== 0 && (
          <div
            hidden={inputs.length !== 0}
            className="flex items-center justify-end mt-5"
          >
            <Button>Save Books Info</Button>
          </div>
        )}
      </form>
    </section>
  );
}
