"use client";

import { BASE_API } from "@/app/constant";
import { setDialog } from "@/redux/slices/dialogs.slice";

import { ApplicationStatusType, IError, ISuccess } from "@/types";
import axios, { AxiosError } from "axios";
import { ChangeEvent, useEffect, useRef } from "react";
import { useMutation } from "react-query";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

interface IProps {
  application_list_id: number;
  status: ApplicationStatusType;
}

interface IParams {
  application_list_id: number;
  status: string | undefined;
}
const updateCandidateApplicationStatus = async ({
  application_list_id,
  status,
}: IParams) => {
  const { data } = await axios.patch(
    BASE_API + "/hr/job/apply/" + application_list_id,
    {
      application_status: status,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return data;
};

export default function ApplicationStatusDropDown({
  status,
  application_list_id,
}: IProps) {
  const selectRef = useRef<HTMLSelectElement>(null);
  const dispatch = useDispatch();

  const openProgressDialog = () => {
    dispatch(setDialog({ type: "OPEN", dialogId: "progress-dialog" }));
  };

  const closeProgressDialog = () => {
    dispatch(setDialog({ type: "CLOSE", dialogId: "progress-dialog" }));
  };

  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.value = status;
    }
  }, []);

  const { mutate } = useMutation(updateCandidateApplicationStatus, {
    onSuccess: (data: ISuccess<string>) => {
      toast.success(data.message);
      closeProgressDialog();
    },
    onError: (error: AxiosError<IError>) => {
      toast.error(error.response?.data.message);
      closeProgressDialog();
    },
  });

  const onSelectChanged = (
    event: ChangeEvent<HTMLSelectElement> | undefined
  ) => {
    const value = event?.currentTarget.value;
    openProgressDialog();
    mutate({
      application_list_id,
      status: value,
    });
  };

  return (
    <select
      onChange={onSelectChanged}
      ref={selectRef}
      className="outline-none text-gray-500 text-sm cursor-pointer"
    >
      <option className="cursor-pointer" value="success">
        Approved
      </option>
      <option value="decline">Reject</option>
      <option value="pending">Pending</option>
    </select>
  );
}
