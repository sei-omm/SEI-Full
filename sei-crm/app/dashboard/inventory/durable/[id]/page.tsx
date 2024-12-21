"use client";

import { BASE_API } from "@/app/constant";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Button from "@/components/Button";
import DropDown from "@/components/DropDown";
import HandleDataSuspense from "@/components/HandleDataSuspense";
import Input from "@/components/Input";
import TagInput from "@/components/TagInput";
import { ISuccess, TDurable } from "@/types";
import axios from "axios";
import { useRef } from "react";
import { useQuery } from "react-query";

interface IProps {
  params: {
    id: "add" | number;
  };
}

export default function ManageDurableForm({ params }: IProps) {
  const isNewItem = params.id === "add" ? true : false;
  const formRef = useRef<HTMLFormElement>(null);

  const { data, isFetching, error } = useQuery<ISuccess<TDurable>>({
    queryKey: ["get-single-durable-info"],
    queryFn: async () =>
      (await axios.get(BASE_API + "/inventory/durable/" + params.id)).data,
    enabled: !isNewItem,
    refetchOnMount: true,
  });

  const { mutate, isLoading: isMutating } = useDoMutation();

  function handleFormSubmit(formData: FormData) {
    if (isNewItem) {
      mutate({
        apiPath: "/inventory/durable",
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        formData,
      });
      return;
    }

    mutate({
      apiPath: "/inventory/durable",
      method: "put",
      headers: {
        "Content-Type": "application/json",
      },
      formData,
      id: params.id as number,
    });
  }

  return (
    <div>
      <HandleDataSuspense
        isLoading={isFetching}
        data={data?.data}
        error={error}
      >
        {(info) => (
          <form ref={formRef} action={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Input
                required
                name="room_name"
                label="Room Name"
                placeholder="Type Room Name"
                defaultValue={info.room_name}
              />
              <Input
                required
                type="number"
                name="floor"
                label="Room Located Floor"
                placeholder="Room located floor"
                defaultValue={info.floor}
              />
              <Input
                required
                type="number"
                name="number_of_rows"
                label="Number Of Rows"
                placeholder="Rows In That Room"
                defaultValue={info.number_of_rows}
              />
              <Input
                required
                type="number"
                name="capasity"
                label="Students Capasity"
                placeholder="Enter Number Of Student Capasity"
                defaultValue={info.capasity}
              />
              <DropDown
                name="is_available"
                label="Is Room Avilable"
                options={[
                  {
                    text: "Yes",
                    value: true,
                  },
                  {
                    text: "No",
                    value: false,
                  },
                ]}
                defaultValue={info.is_available}
              />
            </div>
            <TagInput
              required
              name="available_items"
              label="Available Items"
              placeholder="Avilable Items In That Room"
              defaultValue={info.available_items}
            />
            <Button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              disabled={isMutating}
              loading={isMutating}
            >
              Save Info
            </Button>
          </form>
        )}
      </HandleDataSuspense>
    </div>
  );
}
