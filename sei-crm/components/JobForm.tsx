"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { IoMdArrowBack } from "react-icons/io";
import TagInput from "./TagInput";

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
  const formRef = useRef<HTMLFormElement>(null);

  // const [selectedDepartment, setSelectedDepartment] = useState(-1);

  const showProgressDialog = () => {
    dispatch(setDialog({ type: "OPEN", dialogId: "progress-dialog" }));
  };

  const closeProgressDialog = () => {
    dispatch(setDialog({ type: "CLOSE", dialogId: "progress-dialog" }));
  };

  const [informVendorState, setInformVendor] = useState(false);

  const response = useQueries<
    [UseQueryResult<ISuccess<IJob[]>>, UseQueryResult<ISuccess<IDepartment[]>>]
  >([
    {
      queryKey: ["get-a-job-info", action],
      queryFn: () => fetchAJob(action),
      onSuccess: () => closeProgressDialog,
      onError: () => closeProgressDialog,
      refetchOnMount: true,
    },
    {
      queryKey: ["get-department"],
      queryFn: async () => (await axios.get(BASE_API + "/hr/department")).data,
    },
  ]);

  const { mutate, isLoading } = useMutation(doDbMutation, {
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

  const onSubmit = (formData: FormData) => {
    const objToStore: any = {
      department_name: response[1].data?.data[0].name,
    };

    if(informVendorState) {};
    const informVendor = formData.get("inform_vendor") === "on";
    formData.set("inform_vendor", informVendor as any);

    if (!informVendor) {
      formData.delete("vendors_email");
    }

    formData.forEach((value, key) => {
      objToStore[key] = value;
    });

    if (action === "add") {
      mutate({
        method: "post",
        formData: objToStore,
      });
    } else {
      mutate({
        method: "put",
        id: response[0].data?.data?.[0].id,
        formData: objToStore,
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
    <>
      <HandleSuspence
        isLoading={response[0].isFetching}
        error={response[0].error}
        dataLength={1}
      >
        <form ref={formRef} action={onSubmit} className="w-full space-y-4">
          <div className="grid grid-cols-2 py-5 gap-6">
            <Input
              required
              defaultValue={response[0].data?.data?.[0]?.job_title}
              name="job_title"
              label="Job Title *"
              placeholder="Software engineer"
            />
            <DropDown
              name="address"
              label="Campus *"
              options={[
                {
                  text: "Debamita, B.B.T Road, Vill. - Gopalpur, P.O. Sarkarpool, P.S. - Maheshtala, Kolkata - 700141, India",
                  value:
                    "Debamita, B.B.T Road, Vill. - Gopalpur, P.O. Sarkarpool, P.S. - Maheshtala, Kolkata - 700141, India",
                },
                {
                  text: "S - 13 Sector 11D Market, Faridabad-121006, Haryana,India",
                  value:
                    "S - 13 Sector 11D Market, Faridabad-121006, Haryana,India",
                },
              ]}
              defaultValue={response[0].data?.data?.[0]?.address}
            />
            <Input
              defaultValue={response[0].data?.data?.[0]?.exprience}
              name="exprience"
              label="Exprience *"
              placeholder="2 years"
            />
            <DropDown
              label="Department *"
              name="department"
              options={
                response[1].data?.data.map((item) => ({
                  text: item.name,
                  value: item.id,
                })) || []
              }
              defaultValue={
                response[0].data?.data?.[0]?.department ||
                response[1].data?.data?.[0].id
              }
            />
          </div>
          <TextArea
            required
            name="job_description"
            placeholder="Enter your job description"
            label="Job Description *"
            defaultValue={response[0].data?.data?.[0].job_description}
            rows={10}
          />
          <div className="space-y-4">
            <h2 className="font-semibold text-xl">Inform Vendors</h2>
            <TagInput
              name="vendors_email"
              label="Vendors Email"
              placeholder="Type Email And Press Enter"
              defaultValue={response[0].data?.data?.[0].vendors_email}
            />
            <span className="flex items-center gap-2 text-sm">
              <input
                onChange={(e) =>
                  setInformVendor(e.currentTarget.value === "On")
                }
                name="inform_vendor"
                type="checkbox"
              />
              <span>Inform Vendors</span>
            </span>
          </div>
          <div className="space-x-6 flex items-center">
            <Button
              disabled={isLoading}
              type="button"
              onClick={() => {
                route.back();
              }}
              className="flex items-center gap-2"
            >
              <IoMdArrowBack />
              Back
            </Button>
            <Button
              disabled={isLoading}
              loading={isLoading}
              onClick={() => {
                formRef.current?.requestSubmit();
              }}
              type="button"
              className="min-w-48"
            >
              {action === "add" ? "Publish Job" : "Update Job"}
            </Button>
            {action === "add" ? null : (
              <Button
                disabled={isLoading}
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
    </>
  );
}
