"use client";

import Button from "@/components/Button";
import Input from "@/components/Input";
import { CiEdit } from "react-icons/ci";
import { AiOutlineDelete } from "react-icons/ai";
import { useQuery, useQueryClient } from "react-query";
import axios, { AxiosError } from "axios";
import { BASE_API } from "@/app/constant";
import { IError, ISuccess, TConsumableCategory } from "@/types";
import { toast } from "react-toastify";
import { useRef } from "react";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import HandleSuspence from "@/components/HandleSuspence";
import { useDoMutation } from "@/app/utils/useDoMutation";

const fetchSubjects = async () => {
  const { data } = await axios.get(BASE_API + "/inventory/category");
  return data;
};

export default function ConsumableCategory() {
  const { closeDialog, openDialog } = useLoadingDialog();

  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const whichBtnClicked = useRef<"add" | "update">("add");
  const currentSelectedCategoryId = useRef(0);

  const {
    isFetching,
    error,
    data: response,
  } = useQuery<ISuccess<TConsumableCategory[]>, AxiosError<IError>>({
    queryKey: "get-categories",
    queryFn: fetchSubjects,
    onSuccess: () => {
      closeDialog();
    },
    onError: () => {
      closeDialog();
    },
  });

  const { mutate } = useDoMutation(
    () => {
      queryClient.invalidateQueries(["get-categories"]);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    () => {
      closeDialog();
    }
  );

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    if (formData.get("category_name") === "") {
      return toast.warn("Enter some category name");
    }

    openDialog();

    if (whichBtnClicked.current === "add") {
      mutate({
        apiPath: "/inventory/category",
        method: "post",
        formData,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else if (whichBtnClicked.current === "update") {
      mutate({
        apiPath: "/inventory/category",
        method: "put",
        id: currentSelectedCategoryId.current,
        formData,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      toast.warning("No Button Selected");
    }
  };

  const handleDeleteButton = (id: number) => {
    if (confirm("Are you sure you want to delete ?")) {
      mutate({
        apiPath: "/inventory/category",
        method: "delete",
        id: id,
      });
    }
  };

  const handleEditButton = (id: number, inputValue: string) => {
    if (inputRef.current) {
      currentSelectedCategoryId.current = id;
      inputRef.current.value = inputValue;
    }
  };

  return (
    <section>
      <form onSubmit={onFormSubmit} className="flex items-end gap-5 py-5">
        <div className="flex-grow">
          <Input
            required
            referal={inputRef}
            name="category_name"
            className="!w-full"
            type="text"
            label="Enter Category Name"
            placeholder="Software Engineer"
          />
        </div>
        <Button
          onClick={() => (whichBtnClicked.current = "add")}
          className="mb-1"
        >
          Add
        </Button>
        <Button
          onClick={() => (whichBtnClicked.current = "update")}
          className="mb-1"
        >
          Update
        </Button>
      </form>

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={response?.data.length}
      >
        <ul className="w-full grid grid-cols-4 py-10 gap-6">
          {response?.data.map((category) => (
            <li
              key={category.category_id}
              className="card-shdow p-5 rounded-xl border border-gray-200"
            >
              <h2 className="font-semibold">{category.category_name}</h2>
              <div className="w-full flex items-center justify-end gap-4 *:cursor-pointer">
                <CiEdit
                  onClick={() =>
                    handleEditButton(
                      category.category_id,
                      category.category_name
                    )
                  }
                  className="active:scale-90"
                />
                <AiOutlineDelete
                  onClick={() => handleDeleteButton(category.category_id)}
                  className="active:scale-90"
                />
              </div>
            </li>
          ))}
        </ul>
      </HandleSuspence>
    </section>
  );
}
