"use client";

import Button from "@/components/Button";
import Input from "@/components/Input";
import { CiEdit } from "react-icons/ci";
import { AiOutlineDelete } from "react-icons/ai";
import {  useQuery, useQueryClient } from "react-query";
import axios, { AxiosError } from "axios";
import { BASE_API } from "@/app/constant";
import { IError, ISuccess, TSubject } from "@/types";
import { toast } from "react-toastify";
import { useRef } from "react";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import HandleSuspence from "@/components/HandleSuspence";
import { useDoMutation } from "@/app/utils/useDoMutation";

const fetchSubjects = async () => {
  const { data } = await axios.get(BASE_API + "/subject");
  return data;
};

// interface IParams {
//   method: "post" | "patch" | "delete";
//   id?: number;
//   formData?: FormData;
// }
// const muteDepartment = async ({ method, id, formData }: IParams) => {
//   let url = BASE_API + "/subject"; //this default api for creating new department;

//   if (method !== "post") {
//     url = url + `/${id}`;
//   }

//   const { data } = await axios.request({
//     url,
//     method,
//     data: method === "delete" ? [] : formData,
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });

//   return data;
// };

export default function Subject() {
  const { closeDialog, openDialog } = useLoadingDialog();

  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const whichBtnClicked = useRef<"add" | "update">("add");
  const currentSelectedSubjectId = useRef(0);

  const {
    isFetching,
    error,
    data: response,
  } = useQuery<ISuccess<TSubject[]>, AxiosError<IError>>({
    queryKey: "get-subjects",
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
      queryClient.invalidateQueries(["get-subjects"]);
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

    if (formData.get("subject_name") === "") {
      return toast.warn("Enter some subject name");
    }

    openDialog();

    if (whichBtnClicked.current === "add") {
      mutate({
        apiPath: "/subject",
        method: "post",
        formData,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else if (whichBtnClicked.current === "update") {
      mutate({
        apiPath: "/subject",
        method: "put",
        id: currentSelectedSubjectId.current,
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
        apiPath: "/subject",
        method: "delete",
        id: id,
      });
    }
  };

  const handleEditButton = (id: number, inputValue: string) => {
    if (inputRef.current) {
      currentSelectedSubjectId.current = id;
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
            name="subject_name"
            className="!w-full"
            type="text"
            label="Enter Your Subject Name"
            placeholder="History"
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
          {response?.data.map((subject) => (
            <li
              key={subject.subject_id}
              className="card-shdow p-5 rounded-xl border border-gray-200"
            >
              <h2 className="font-semibold">{subject.subject_name}</h2>
              <div className="w-full flex items-center justify-end gap-4 *:cursor-pointer">
                <CiEdit
                  onClick={() =>
                    handleEditButton(subject.subject_id, subject.subject_name)
                  }
                  className="active:scale-90"
                />
                <AiOutlineDelete
                  onClick={() => handleDeleteButton(subject.subject_id)}
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
