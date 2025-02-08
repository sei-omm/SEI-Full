import React, { useState } from "react";
import Input from "../Input";
import HandleDataSuspense from "../HandleDataSuspense";
import DateInput from "../DateInput";
import { AiOutlineDelete } from "react-icons/ai";
import DropDown from "../DropDown";
import { ISuccess, TVendorIdName } from "@/types";

// type TStockInfo = {
//   total_stock: number;
//   total_item_consumed: number;
//   remain_stock: number;
//   total_spend: number;
// };

interface IProps {
  handleDeleteBtnClick: () => void;
  remain_stock: number;
  item_id: number;
  suppliers_fetching : boolean,
  suppliers_error : any,
  suppliers: ISuccess<TVendorIdName[]> | undefined;
}

type TInputId = "opening_stock" | "item_consumed" | "cost_per_unit_current";

export default function InventoryFormItem({
  handleDeleteBtnClick,
  remain_stock,
  item_id,
  suppliers,
  suppliers_error,
  suppliers_fetching
}: IProps) {
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

  return (
    <div className="flex items-center gap-5 *:min-w-60 relative">
      <div className="!min-w-6 pt-5 ">
        <AiOutlineDelete
          onClick={handleDeleteBtnClick}
          className="cursor-pointer"
        />
      </div>
      <Input
        wrapperCss="!min-w-28"
        viewOnly={true}
        viewOnlyText={remain_stock.toString() || "0"}
        type="number"
        label="Opening Stock"
        placeholder="0"
      />

      <input hidden type="number" name="item_consumed" value={0} />
      <input
        hidden
        type="number"
        name="closing_stock"
        value={inputValues.opening_stock - inputValues.item_consumed}
      />
      <input hidden name="item_id" value={item_id} />
      <input hidden name="type" value={"add"} />

      <Input
        required
        onChange={(e) => handleSomeInputChange("opening_stock", e)}
        type="number"
        name="opening_stock"
        label="New Stock To Add *"
        placeholder="0"
      />
      <Input name="status" label="Status" placeholder="Enter Some Status" />
      <DateInput name="purchase_date" label="Purchased Date" />

      <HandleDataSuspense
        error={suppliers_error}
        isLoading={suppliers_fetching}
        data={suppliers?.data}
      >
        {(supplier) => (
          <DropDown
            name="vendor_id"
            label="Supplier"
            options={supplier.map((item) => ({
              text: item.vendor_name,
              value: item.vendor_id,
            }))}
          />
        )}
      </HandleDataSuspense>

      <Input
        required
        moneyInput={true}
        type="number"
        wrapperCss="!min-w-28"
        //   label="Cost per Unit (Current Cost)"
        label="Cost / Unit"
        name="cost_per_unit_current"
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
