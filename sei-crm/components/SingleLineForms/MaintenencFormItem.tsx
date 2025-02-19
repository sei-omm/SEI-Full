import React, { useState } from "react";
import DropDown from "../DropDown";
import Input from "../Input";
import DateInput from "../DateInput";
import HandleDataSuspense from "../HandleDataSuspense";
import { AiOutlineDelete } from "react-icons/ai";
import { ISuccess } from "@/types";

interface IProps {
  handleDeleteItem: () => void;
  itemsForDropDownIsLoading: boolean;
  itemsForDropDownError: any;
  itemsForDropDownData:
    | ISuccess<{ item_id: number; item_name: string }[]>
    | undefined;
  currentCampus : string;
}

export default function MaintenencFormItem({
  handleDeleteItem,
  itemsForDropDownData,
  itemsForDropDownError,
  itemsForDropDownIsLoading,
  currentCampus
}: IProps) {
  const [status, setStatus] = useState<"Completed" | "Pending">("Completed");
  const [itemFrom, setItemFrom] = useState<"Inventory" | "Custom">("Custom");
  return (
    <div className="flex items-center gap-5 *:min-w-60 relative">
      <div className="!min-w-6 pt-5">
        <AiOutlineDelete
          onClick={handleDeleteItem}
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
          isLoading={itemsForDropDownIsLoading}
          error={itemsForDropDownError}
          data={itemsForDropDownData?.data}
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
      ) : (
        <Input
          name="custom_item"
          required
          label="Enter Custom Item *"
          placeholder="type here.."
        />
      )}

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
        onChange={(option) => setStatus(option.value)}
        name="status"
        label="Status *"
        options={[
          { text: "Completed", value: "Completed" },
          { text: "Pending", value: "Pending" },
        ]}
      />
      <DateInput
        required={status === "Completed"}
        viewOnly={status === "Pending"}
        viewOnlyText="NA"
        name="completed_date"
        label={`Complete Date ${status === "Completed" ? "*" : ""}`}
        date={status === "Completed" ? null : null}
      />

      <Input name="remark" label="Remark" placeholder="Type Remark" />
      <DropDown
        name="institute"
        label="Campus *"
        options={[
          { text: "Kolkata", value: "Kolkata" },
          { text: "Faridabad", value: "Faridabad" },
        ]}
        defaultValue={currentCampus}
      />
    </div>
  );
}
