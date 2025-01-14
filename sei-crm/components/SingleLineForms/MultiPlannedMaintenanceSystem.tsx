import React, { useState } from "react";
import Button from "../Button";
import { IoIosAdd } from "react-icons/io";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import HandleDataSuspense from "../HandleDataSuspense";
import { ISuccess } from "@/types";
import DropDown from "../DropDown";
import DateInput from "../DateInput";
import Input from "../Input";
import { AiOutlineDelete } from "react-icons/ai";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { queryClient } from "@/redux/MyProvider";
import { getDate } from "@/app/utils/getDate";

export default function MultiPlannedMaintenanceSystem() {
  const [inputs, setInputs] = useState<number[]>([]);

  const [frequency, setFrequency] = useState("Daily");
  const [newDueDate, setNextDueDate] = useState<Date | null>(null);

  const { isLoading, mutate } = useDoMutation();

  function handleFormSubmit(formData: FormData) {
    const datasToStore: any[] = [];
    let trackIndex = 0;

    let obj: any = {};

    formData.forEach((value, key) => {
      if (trackIndex >= 5) {
        trackIndex = 0;
        obj[key] = value;
        datasToStore.push(obj);
        obj = {};
      }

      obj[key] = value;
      trackIndex++;
    });
    mutate({
      apiPath: "/inventory/planned-maintenance-system/multi",
      method: "post",
      formData: datasToStore,
      onSuccess() {
        queryClient.invalidateQueries("get-planned-maintenance-system");
        setInputs([]);
      },
    });
  }

  const { data, isFetching, error } = useQuery<
    ISuccess<{ item_id: number; item_name: string }[]>
  >({
    queryKey: ["get-items-for-drop-down"],
    queryFn: async () =>
      (await axios.get(BASE_API + "/inventory/item/drop-down")).data,
  });

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
            preStates.push(
              preStates.length === 0 ? 1 : preStates[preStates.length - 1] + 1
            );
            setInputs(preStates);
          }}
          className="flex-center gap-3"
        >
          <IoIosAdd size={18} />
          Add New Row
        </Button>
      </div>

      <form action={handleFormSubmit} className="space-y-5">
        {inputs.length !== 0 ? (
          <div className="w-full overflow-x-auto space-y-5 pb-20">
            {inputs.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-5 *:min-w-60 relative"
              >
                <div className="!min-w-6 pt-5">
                  <AiOutlineDelete
                    onClick={() => handleDeleteItem(index)}
                    className="cursor-pointer"
                  />
                </div>
                <HandleDataSuspense
                  isLoading={isFetching}
                  error={error}
                  data={data?.data}
                >
                  {(items) => (
                    <DropDown
                      name="item_id"
                      label="Choose Item"
                      options={items?.map((item) => ({
                        text: item.item_name,
                        value: item.item_id,
                      }))}
                    />
                  )}
                </HandleDataSuspense>

                <DropDown
                  onChange={(item) => setFrequency(item.value)}
                  name="frequency"
                  label="Frequency"
                  options={[
                    { text: "Daily", value: "Daily" },
                    { text: "Weekly", value: "Weekly" },
                    { text: "Monthly", value: "Monthly" },
                    { text: "Half Yearly", value: "Half Yearly" },
                    { text: "Yearly", value: "Yearly" },
                  ]}
                />

                <DateInput
                  onChange={(value) => {
                    const date = new Date(value);
                    if (frequency === "Daily") {
                      date.setDate(date.getDate() + 1);
                    } else if (frequency === "Weekly") {
                      date.setDate(date.getDate() + 7);
                    } else if (frequency === "Monthly") {
                      date.setDate(date.getDate() + 30);
                    } else if (frequency === "Half Yearly") {
                      date.setDate(date.getDate() + 182);
                    } else {
                      date.setDate(date.getDate() + 365);
                    }
                    setNextDueDate(date);
                  }}
                  required
                  name="last_done"
                  label="Last Done"
                />
                <DateInput
                  required
                  name="next_due"
                  label="Next Due"
                  date={newDueDate ? getDate(newDueDate) : null}
                />

                <Input
                  required
                  name="description"
                  label="Checks / Maintenance Required"
                  placeholder="Type here..."
                />
                <Input
                  name="remark"
                  label="Remarks"
                  placeholder="Type here..."
                />
              </div>
            ))}
          </div>
        ) : null}

        {inputs.length !== 0 ? (
          <div className="w-full flex items-center justify-end">
            <Button loading={isLoading} disabled={isLoading}>
              Save Info
            </Button>
          </div>
        ) : null}
      </form>
    </div>
  );
}
