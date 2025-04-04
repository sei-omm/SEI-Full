import React, { useState } from "react";
import Input from "../Input";
import DateInput from "../DateInput";
import { AiOutlineDelete } from "react-icons/ai";
import DropDown from "../DropDown";
import { ISuccess } from "@/types";
import HandleSuspence from "../HandleSuspence";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { getDate } from "@/app/utils/getDate";

type TVendorItems = {
  item_id: number;
  item_name: string;
  current_purchase_date: string;
};

async function getVendorItems(vendorID: number) {
  const reponse = await axios.get(
    `${BASE_API}/inventory/vendor/item/${vendorID}`
  );
  return reponse.data;
}

interface IProps {
  handleDeleteBtnClick: () => void;
  currentVendorId: number;
}

type TInputId = "opening_stock" | "item_consumed" | "cost_per_unit_current";

export default function InventoryFormItem({
  handleDeleteBtnClick,
  currentVendorId,
}: IProps) {
  const [minPurchaseDate, setMinPurchaseDate] = useState("");

  const [inputValues, setInputValues] = useState<{
    opening_stock: number;
    item_consumed: number;
    cost_per_unit_current: number;
  }>({ opening_stock: 0, item_consumed: 0, cost_per_unit_current: 0 });

  function handleSomeInputChange(
    inputid: TInputId,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const parsedInputValue: number = parseInt(
      event.currentTarget.value === "" ? "0" : event.currentTarget.value
    );
    setInputValues((preState) => ({
      ...preState,
      [inputid]: parsedInputValue,
    }));
  }

  const {
    data: vendor_items,
    error,
    isFetching,
  } = useQuery<ISuccess<TVendorItems[]>>({
    queryKey: ["get-vendor-items", currentVendorId],
    queryFn: () => getVendorItems(currentVendorId),
    onSuccess: (data) => {
      const recent_purchase_date = data.data[0].current_purchase_date;
      setMinPurchaseDate(getDate(new Date(recent_purchase_date)));
    },
    enabled: currentVendorId !== -1,
  });

  return (
    <div className="flex items-center gap-5 *:min-w-60 relative">
      <div className="!min-w-6 pt-5 ">
        <AiOutlineDelete
          onClick={handleDeleteBtnClick}
          className="cursor-pointer"
        />
      </div>
      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={vendor_items?.data.length}
        noDataMsg="No Item Found"
      >
        <DropDown
          name="item_id"
          label="Items"
          onChange={(option) => {
            const recent_purchase_date = vendor_items?.data.find(
              (item) => item.item_id === option.value
            )?.current_purchase_date;
            if (recent_purchase_date !== undefined) {
              setMinPurchaseDate(getDate(new Date(recent_purchase_date)));
            }
          }}
          options={
            vendor_items?.data.map((item) => ({
              text: item.item_name,
              value: item.item_id,
            })) || []
          }
        />
      </HandleSuspence>
      {/* 
      <Input
        wrapperCss="!min-w-28"
        viewOnly={true}
        type="number"
        label="Opening Stock"
        placeholder="0"
        defaultValue={0}
      /> */}

      {/* <input hidden type="number" name="item_consumed" value={0} /> */}
      {/* <input
        hidden
        type="number"
        name="closing_stock"
        value={inputValues.opening_stock - inputValues.item_consumed}
      /> */}
      {/* <input hidden name="type" value={"add"} /> */}

      <Input
        required
        onChange={(e) => handleSomeInputChange("opening_stock", e)}
        type="number"
        name="stock"
        label="New Stock To Add *"
        placeholder="0"
      />
      <Input name="status" label="Status" placeholder="Enter Some Status" />
      <DateInput
        name="purchase_date"
        label="Purchased Date"
        min={minPurchaseDate}
      />

      <Input
        required
        moneyInput={true}
        type="number"
        wrapperCss="!min-w-28"
        //   label="Cost per Unit (Current Cost)"
        label="Cost / Unit"
        name="cost_per_unit"
        placeholder="0"
        onChange={(e) => handleSomeInputChange("cost_per_unit_current", e)}
      />
      <Input
        wrapperCss="!min-w-28"
        viewOnly={true}
        required
        moneyInput={true}
        name="total_value"
        label="Total Value"
        placeholder="Total Value"
        value={inputValues.opening_stock * inputValues.cost_per_unit_current}
      />
      <Input name="remark" label="Remarks" placeholder="Type Remarks" />
    </div>
  );
}
