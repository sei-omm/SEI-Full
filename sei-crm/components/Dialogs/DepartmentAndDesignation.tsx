import React, { useRef } from "react";
import DialogBody from "./DialogBody";
import Input from "../Input";
import TagInput from "../TagInput";
import Button from "../Button";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { useDispatch, useSelector } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { RootState } from "@/redux/store";
import { queryClient } from "@/redux/MyProvider";
import { IDepartment, ISuccess } from "@/types";
import { BASE_API } from "@/app/constant";
import axios from "axios";
import { useQuery } from "react-query";
import HandleSuspence from "../HandleSuspence";

async function fetchSingleDepartment(dId: number | undefined) {
  if(!dId) return;
  const { data } = await axios.get(`${BASE_API}/hr/department/${dId}`);
  return data;
}

export default function DepartmentAndDesignation() {
  const { extraValue } = useSelector((state: RootState) => state.dialogs);
  const departmentId = extraValue?.department_id;
  const dispatch = useDispatch();
  const { isLoading, mutate } = useDoMutation();

  const {
    data: departement,
    isFetching,
    error,
  } = useQuery<ISuccess<IDepartment>>({
    queryKey: "get-single-department",
    queryFn: () => fetchSingleDepartment(departmentId),
    refetchOnMount: true,
  });

  const formRef = useRef<HTMLFormElement>(null);
  function handleFormSubmit(formData: FormData) {
    mutate({
      apiPath: `/hr/department`,
      method: departmentId ? "put" : "post",
      formData,
      id: departmentId,
      onSuccess() {
        queryClient.invalidateQueries("get-department");
        dispatch(setDialog({ dialogId: "", type: "CLOSE" }));
      },
    });
  }
  return (
    <DialogBody className="min-w-[30rem]">
      <HandleSuspence isLoading={isFetching} dataLength={1} error={error}>
        <form
          ref={formRef}
          action={handleFormSubmit}
          className="pt-4 space-y-5"
        >
          <Input
            required
            name="name"
            placeholder="Type here.."
            label="Department Name *"
            defaultValue={departement?.data.name || ""}
          />
          <TagInput
            name="designation"
            placeholder="Type and enter.."
            label="Designations"
            defaultValue={departement?.data.designation || ""}
          />
        </form>
        <Button
          onClick={() => {
            formRef.current?.requestSubmit();
          }}
          loading={isLoading}
          disabled={isLoading}
        >
          Save
        </Button>
      </HandleSuspence>
    </DialogBody>
  );
}
