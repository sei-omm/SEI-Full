import React, { useState } from "react";
import Button from "../Button";
import { IoIosAdd } from "react-icons/io";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { queryClient } from "@/redux/MyProvider";
import PlannedMaintenanceItem from "./PlannedMaintenanceItem";
import DropDown from "../DropDown";

export default function MultiPlannedMaintenanceSystem() {
  const [inputs, setInputs] = useState<number[]>([]);

  const { isLoading, mutate } = useDoMutation();

  function handleFormSubmit(formData: FormData) {
    const datasToStore: any[] = [];
    let trackIndex = 0;

    let obj: any = {};

    formData.forEach((value, key) => {
      if (trackIndex >= 6) {
        trackIndex = 0;
        obj[key] = value.toString().trim();
        datasToStore.push(obj);
        obj = {};
        return;
      }

      obj[key] = value.toString().trim();
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

  function handleDeleteItem(index: number) {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <DropDown
          changeSearchParamsOnChange
          name="institute"
          label="Campus"
          options={[
            { text: "Kolkata", value: "Kolkata" },
            { text: "Faridabad", value: "Faridabad" },
          ]}
        />
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
          Add New Record
        </Button>
      </div>

      <form action={handleFormSubmit} className="space-y-5">
        {inputs.length !== 0 ? (
          <div className="w-full overflow-x-auto space-y-5 pb-20">
            {inputs.map((item, index) => (
              <PlannedMaintenanceItem
                key={item}
                deleteBtnOnClick={() => {
                  handleDeleteItem(index);
                }}
              />
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
