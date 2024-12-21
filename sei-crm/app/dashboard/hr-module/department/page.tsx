"use client";

import Button from "@/components/Button";
import Input from "@/components/Input";
import { CiEdit } from "react-icons/ci";
import { AiOutlineDelete } from "react-icons/ai";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axios, { AxiosError } from "axios";
import { BASE_API } from "@/app/constant";
import { IDepartment, IError, ISuccess } from "@/types";
import { toast } from "react-toastify";
import { useRef } from "react";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import HandleSuspence from "@/components/HandleSuspence";

const fetchDepartments = async () => {
  const { data } = await axios.get(BASE_API + "/hr/department");
  return data;
};

interface IParams {
  method: "post" | "patch" | "delete";
  id?: number;
  formData?: FormData;
}
const muteDepartment = async ({ method, id, formData }: IParams) => {
  let url = BASE_API + "/hr/department"; //this default api for creating new department;

  if (method !== "post") {
    url = url + `/${id}`;
  }

  const { data } = await axios.request({
    url,
    method,
    data: method === "delete" ? [] : formData,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return data;
};

export default function Department() {
  const { closeDialog, openDialog } = useLoadingDialog();

  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const whichBtnClicked = useRef<"add" | "update">("add");
  const currentSelectedDepartmentId = useRef(0);

  const {
    isLoading,
    error,
    data: response,
  } = useQuery<ISuccess<IDepartment[]>, AxiosError<IError>>({
    queryKey: "get-departments",
    queryFn: fetchDepartments,
    onSuccess: () => {
      closeDialog();
    },
    onError: () => {
      closeDialog();
    },
  });

  const { mutate } = useMutation(muteDepartment, {
    onSuccess: (data: ISuccess) => {
      queryClient.invalidateQueries(["get-departments"]);
      toast.success(data.message);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    onError: (error: AxiosError<IError>) => {
      closeDialog();
      toast.error(error.response?.data.message);
    },
  });

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    if (formData.get("department_name") === "") {
      return toast.warn("Enter some department name");
    }

    openDialog();

    if (whichBtnClicked.current === "add") {
      mutate({
        method: "post",
        id: 0,
        formData,
      });
    } else if (whichBtnClicked.current === "update") {
      mutate({
        method: "patch",
        id: currentSelectedDepartmentId.current,
        formData,
      });
    } else {
      toast.warning("No Button Selected");
    }
  };

  const handleDeleteButton = (id: number) => {
    if (confirm("Are you sure you want to delete ?")) {
      mutate({
        method: "delete",
        id: id,
      });
    }
  };

  const handleEditButton = (id: number, inputValue: string) => {
    if (inputRef.current) {
      currentSelectedDepartmentId.current = id;
      inputRef.current.value = inputValue;
    }
  };

  return (
    <HandleSuspence isLoading={isLoading} dataLength={response?.data.length} error={error}>
      <section>
        <form onSubmit={onFormSubmit} className="flex items-end gap-5 py-5">
          <div className="flex-grow">
            <Input
              referal={inputRef}
              name="department_name"
              className="!w-full"
              type="text"
              label="Add new department"
              placeholder="Add new department"
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

        <ul className="w-full grid grid-cols-4 py-10 gap-6">
          {response?.data.map((department) => (
            <li
              key={department.id}
              className="card-shdow p-5 rounded-xl border border-gray-200"
            >
              <h2 className="font-semibold">{department.name}</h2>
              <div className="w-full flex items-center justify-end gap-4 *:cursor-pointer">
                <CiEdit
                  onClick={() =>
                    handleEditButton(department.id, department.name)
                  }
                  className="active:scale-90"
                />
                <AiOutlineDelete
                  onClick={() => handleDeleteButton(department.id)}
                  className="active:scale-90"
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </HandleSuspence>
  );
}
