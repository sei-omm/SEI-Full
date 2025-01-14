"use client";

import { BASE_API } from "@/app/constant";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Button from "@/components/Button";
import DateInput from "@/components/DateInput";
import DropDown from "@/components/DropDown";
import HandleDataSuspense from "@/components/HandleDataSuspense";
import Input from "@/components/Input";
import { ISuccess } from "@/types";
import axios from "axios";
import { useState } from "react";
import { useQueries, UseQueryResult } from "react-query";

interface IProps {
  params: {
    id: "add" | number;
  };
}

export default function MaintenceRecordForm({ params }: IProps) {
  const isNewRecord = params.id === "add";

  const { isLoading: isMutating, mutate } = useDoMutation();
  const [dropDownStatus, setDropDownStatus] = useState<"Completed" | "Pending">(
    "Completed"
  );

  const [itemsForDropDown] = useQueries<
    [UseQueryResult<ISuccess<{ item_id: number; item_name: string }[]>>]
  >([
    {
      queryKey: ["get-items-for-drop-down"],
      queryFn: async () =>
        (await axios.get(BASE_API + "/inventory/item/drop-down")).data,
    },
  ]);

  function handleSubmit(formData: FormData) {
    if (dropDownStatus === "Pending") {
      formData.delete("completed_date");
    }
    mutate({
      apiPath: "/inventory/maintence-record",
      method: isNewRecord ? "post" : "put",
      headers: {
        "Content-Type": "application/json",
      },
      formData,
      id: isNewRecord ? undefined : parseInt(params.id as string),
    });
  }

  

  return (
    <div>
      <form action={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <HandleDataSuspense
            isLoading={itemsForDropDown.isLoading}
            error={itemsForDropDown.error}
            data={itemsForDropDown.data?.data}
          >
            {(items) => (
              <DropDown
                name="item_id"
                label="Choose Item"
                options={items.map((item) => ({
                  text: item.item_name,
                  value: item.item_id,
                }))}
              />
            )}
          </HandleDataSuspense>

          <DateInput required name="maintence_date" label="Maintence Date *" />
          <Input
            required
            name="work_station"
            label="Work Station *"
            placeholder="Type Work Station Name"
          />
          <Input
            required
            name="description_of_work"
            label="Description of Work *"
            placeholder="Type Description of Work"
          />
          <Input
            name="department"
            label="Department"
            placeholder="Type Department Name"
          />
          <Input
            required
            name="assigned_person"
            label="Assigned Personnel / Contractor *"
            placeholder="Type Assigned Personnel / Contractor Name"
          />
          <Input
            required
            name="approved_by"
            label="Approved By *"
            placeholder="Type Who Approved"
          />
          <Input
            required
            name="cost"
            moneyInput={true}
            type="number"
            label="Cost (Approx) *"
            placeholder="0"
          />
          <DropDown
            onChange={(item) => setDropDownStatus(item.value)}
            name="status"
            label="Status *"
            options={[
              { text: "Completed", value: "Completed" },
              { text: "Pending", value: "Pending" },
            ]}
          />
          <DateInput
            // required={dropDownStatus === "Completed"}
            name="completed_date"
            label={`Complete Date ${dropDownStatus === "Completed" ? "*" : ""}`}
          />
          <Input name="remark" label="Remark" placeholder="Type Remark" />
          <DropDown
            name="institute"
            label="Institute *"
            options={[
              { text: "Kolkata", value: "Kolkata" },
              { text: "Faridabad", value: "Faridabad" },
            ]}
          />
        </div>

        <Button disabled={isMutating} loading={isMutating}>
          Insert New Record
        </Button>
      </form>
    </div>
  );
}
