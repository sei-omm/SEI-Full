"use client";

import React, { useEffect } from "react";
import Input from "./Input";
import Button from "./Button";
import { AiOutlineDelete } from "react-icons/ai";
import { useMutation, useQueries, UseQueryResult } from "react-query";
import axios, { AxiosError } from "axios";
import { BASE_API } from "@/app/constant";
import { IDepartment, IError, IJob, ISuccess } from "@/types";
import { toast } from "react-toastify";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import TextArea from "./TextArea";
import DropDown from "./DropDown";
import HandleSuspence from "./HandleSuspence";

interface IProps {
  action: string; //it could be add or the id of job posting for update
}

interface IParams {
  id?: number;
  method: "post" | "put" | "delete";
  formData?: FormData;
}

const doDbMutation = async ({ method, id, formData }: IParams) => {
  let url = BASE_API + "/hr/job"; //this default api for creating new department;

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

const fetchAJob = async (job_id: string) => {
  if (job_id === "add") return [];

  const { data } = await axios.get(BASE_API + "/hr/job/" + job_id);
  return data;
};

export default function JobForm({ action }: IProps) {
  const dispatch = useDispatch();
  const route = useRouter();

  // const [selectedDepartment, setSelectedDepartment] = useState(-1);

  const showProgressDialog = () => {
    dispatch(setDialog({ type: "OPEN", dialogId: "progress-dialog" }));
  };

  const closeProgressDialog = () => {
    dispatch(setDialog({ type: "CLOSE", dialogId: "progress-dialog" }));
  };

  const response = useQueries<
    [UseQueryResult<ISuccess<IJob[]>>, UseQueryResult<ISuccess<IDepartment[]>>]
  >([
    {
      queryKey: ["get-a-job-info", action],
      queryFn: () => fetchAJob(action),
      onSuccess: () => closeProgressDialog,
      onError: () => closeProgressDialog,
    },
    {
      queryKey: ["get-department"],
      queryFn: async () => (await axios.get(BASE_API + "/hr/department")).data,
    },
  ]);

  const { mutate } = useMutation(doDbMutation, {
    onSuccess: (data: ISuccess<IJob>) => {
      toast.success(data.message);
      route.push(
        `/dashboard/hr-module/job-posting?success-code=${Math.round(
          Math.random() * 1000
        )}`
      );
    },
    onError: (error: AxiosError<IError>) => {
      toast.error(error.response?.data.message);
    },
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    if (action === "add") {
      mutate({
        method: "post",
        formData,
      });
    } else {
      mutate({
        method: "put",
        id: response[0].data?.data?.[0].id,
        formData,
      });
    }
  };

  const handleDeleteButton = () => {
    if (confirm("Are you sure you want to delete ?")) {
      mutate({
        method: "delete",
        id: response[0].data?.data?.[0]?.id,
      });
    }
  };

  useEffect(() => {
    if (response[0].isLoading) {
      showProgressDialog();
    } else {
      closeProgressDialog();
    }
  }, [response[0].isLoading]);

  return (
    <HandleSuspence
      isLoading={response[0].isFetching}
      error={response[0].error}
      dataLength={1}
    >
      <form onSubmit={onSubmit} className="w-full">
        <div className="grid grid-cols-2 py-5 gap-6">
          <Input
            defaultValue={response[0].data?.data?.[0]?.job_title}
            name="job_title"
            label="Job Title"
            placeholder="Software engineer"
          />
          <Input
            defaultValue={response[0].data?.data?.[0]?.address}
            name="address"
            label="Address"
            placeholder="South 24 Parganas ASHINA, MAKHNA, Falta, West Bengal 743503"
          />
          <Input
            defaultValue={response[0].data?.data?.[0]?.exprience}
            name="exprience"
            label="Exprience"
            placeholder="2 years"
          />
          {/* <Input
          defaultValue={response[0]?.data?.[0]?.department}
          name="department"
          label="Department"
          placeholder="Marketing"
        /> */}
          <DropDown
            label="Department"
            name="department"
            options={
              response[1].data?.data.map((item) => ({
                text: item.name,
                value: item.id,
              })) || []
            }
            defaultValue={
              response[0].data?.data?.[0]?.department ||
              response[1].data?.data[0].id
            }
          />
          <TextArea
            name="job_description"
            placeholder="Enter your job description"
            label="Job Description"
            defaultValue={response[0].data?.data?.[0].job_description}
          />
        </div>
        <div className="space-x-6 flex items-center">
          <Button type="submit" className="min-w-48">
            {action === "add" ? "Publish Job" : "Update Job"}
          </Button>
          {action === "add" ? null : (
            <Button
              onClick={handleDeleteButton}
              type="button"
              className="min-w-48 !bg-[#F44336] flex-center gap-x-2"
            >
              <AiOutlineDelete />
              Remove Job
            </Button>
          )}
        </div>
      </form>
    </HandleSuspence>
  );
}
