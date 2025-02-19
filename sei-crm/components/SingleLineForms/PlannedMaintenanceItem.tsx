import React, { useState } from "react";
import DateInput from "../DateInput";
import DropDown from "../DropDown";
import HandleDataSuspense from "../HandleDataSuspense";
import { AiOutlineDelete } from "react-icons/ai";
import { useQuery } from "react-query";
import { ISuccess, TPmsFrequency } from "@/types";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { getDate } from "@/app/utils/getDate";
import Input from "../Input";
import { getNextDueDate } from "@/utils/getNextDueDate";

interface IProps {
  deleteBtnOnClick: () => void;
  currentCampus : string;
}

export default function PlannedMaintenanceItem({ deleteBtnOnClick,  currentCampus}: IProps) {
  const [frequency, setFrequency] = useState<TPmsFrequency>("Daily");
  const [newDueDate, setNextDueDate] = useState<Date | null>(null);
  const [lastDoneDate, setLastDoneDate] = useState<string | null>(null);
  const [itemFrom, setItemFrom] = useState<"Inventory" | "Custom">("Custom");

  const { data, isFetching, error } = useQuery<
    ISuccess<{ item_id: number; item_name: string }[]>
  >({
    queryKey: ["get-items-for-drop-down"],
    queryFn: async () =>
      (await axios.get(BASE_API + "/inventory/item/drop-down")).data,
  });

  const handleSetNextDueDate = (
    nextDueDate: string,
    currentFrequency: TPmsFrequency
  ) => {
    setNextDueDate(getNextDueDate(nextDueDate, currentFrequency));
  };

  return (
    <div className="flex items-center gap-5 *:min-w-60 relative">
      <div className="!min-w-6 pt-5">
        <AiOutlineDelete
          onClick={deleteBtnOnClick}
          className="cursor-pointer"
        />
      </div>
      <DropDown
        onChange={(item) => setItemFrom(item.value)}
        label="Item From"
        options={[
          {
            text: "Custom",
            value: "Custom",
          },
          {
            text: "Inventory",
            value: "Inventory",
          },
        ]}
      />
      {itemFrom === "Inventory" ? (
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
      ) : (
        <Input
          name="custom_item"
          required
          label="Enter Custom Item *"
          placeholder="type here.."
        />
      )}

      <DropDown
        onChange={(item) => {
          setFrequency(item.value);
          if (lastDoneDate) {
            handleSetNextDueDate(lastDoneDate, item.value);
          }
        }}
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
        onChange={(date) => {
          setLastDoneDate(date);
          handleSetNextDueDate(date, frequency);
        }}
        required
        name="last_done"
        label="Last Done"
      />
      <DateInput
        viewOnly
        viewOnlyText={newDueDate ? getDate(newDueDate) : "Next Due Date"}
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
      <Input name="remark" label="Remarks" placeholder="Type here..." />

      <DropDown
        name="institute"
        label="Campus"
        options={[
          { text: "Kolkata", value: "Kolkata" },
          { text: "Faridabad", value: "Faridabad" },
        ]}
        defaultValue={currentCampus}
      />
    </div>
  );
}
