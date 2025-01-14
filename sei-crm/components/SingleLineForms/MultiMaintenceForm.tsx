"use client";

import { BASE_API } from "@/app/constant";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Button from "@/components/Button";
import DateInput from "@/components/DateInput";
import DropDown from "@/components/DropDown";
import HandleDataSuspense from "@/components/HandleDataSuspense";
import Input from "@/components/Input";
import { queryClient } from "@/redux/MyProvider";
import { ISuccess } from "@/types";
import axios from "axios";
import { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { IoIosAdd } from "react-icons/io";
import { useQueries, UseQueryResult } from "react-query";

export default function MultiMaintenceForm() {
  const [inputs, setInputs] = useState<
    { id: number; status: "Completed" | "Pending" }[]
  >([]);

  const { isLoading: isMutating, mutate } = useDoMutation();

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
    const datasToStore: any[] = [];
    let trackIndex = 0;

    let obj: any = {};

    formData.forEach((value, key) => {
      if (trackIndex >= 11) {
        trackIndex = 0;
        if (key === "completed_date" && value === "") {
          obj[key] = null;
        } else {
          obj[key] = value;
        }
        datasToStore.push(obj);
        obj = {};
      }

      if (key === "completed_date" && value === "") {
        obj[key] = null;
      } else {
        obj[key] = value;
      }
      trackIndex++;
    });

    mutate({
      apiPath: "/inventory/maintence-record/multi",
      method: "post",
      formData: datasToStore,
      onSuccess() {
        queryClient.invalidateQueries("maintence-record");
        setInputs([]);
      },
    });
  }

  function handleDeleteItem(index: number) {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-end">
        <Button
          type="button"
          onClick={() => {
            const preStates = [...inputs];

            preStates.push({
              id:
                preStates.length === 0
                  ? 1
                  : preStates[preStates.length - 1].id + 1,
              status: "Completed",
            });
            setInputs(preStates);
          }}
          className="flex-center gap-3"
        >
          <IoIosAdd size={18} />
          Add New Record
        </Button>
      </div>
      <form action={handleSubmit} className="space-y-5">
        {inputs.length !== 0 ? (
          <div className="w-full overflow-x-auto space-y-5 pb-20">
            {inputs.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-5 *:min-w-60 relative"
              >
                <div className="!min-w-6 pt-5">
                  <AiOutlineDelete
                    onClick={() => handleDeleteItem(index)}
                    className="cursor-pointer"
                  />
                </div>
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

                <DateInput
                  required
                  name="maintence_date"
                  label="Maintence Date *"
                />
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
                  onChange={(dropDownState) => {
                    const preStates = [...inputs];

                    const indexOfItem = preStates.findIndex(
                      (fItem) => fItem.id === item.id
                    );
                    if (indexOfItem !== -1) {
                      preStates[indexOfItem].status = dropDownState.value;
                    }
                    setInputs(preStates);
                  }}
                  name="status"
                  label="Status *"
                  options={[
                    { text: "Completed", value: "Completed" },
                    { text: "Pending", value: "Pending" },
                  ]}
                />
                <DateInput
                  required={
                    inputs.find((cItem) => cItem.id === item.id)?.status ===
                    "Completed"
                  }
                  viewOnly={
                    inputs.find((cItem) => cItem.id === item.id)?.status ===
                    "Pending"
                  }
                  viewOnlyText="NA"
                  name="completed_date"
                  label={`Complete Date ${
                    inputs.find((cItem) => cItem.id === item.id)?.status ===
                    "Completed"
                      ? "*"
                      : ""
                  }`}
                  date={
                    inputs.find((cItem) => cItem.id === item.id)?.status ===
                    "Completed"
                      ? null
                      : null
                  }
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
            ))}
          </div>
        ) : null}

        {inputs.length !== 0 ? (
          <div className="w-full flex items-center justify-end">
            <Button loading={isMutating} disabled={isMutating}>
              Save Info
            </Button>
          </div>
        ) : null}
      </form>
    </div>
  );
}
