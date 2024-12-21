import React, { useEffect, useState } from "react";
import DialogBody from "./DialogBody";
import Input from "../Input";
import DropDown from "../DropDown";
import { BASE_API } from "@/app/constant";
import DateInput from "../DateInput";
import HandleDataSuspense from "../HandleDataSuspense";
import { useQueries, UseQueryResult } from "react-query";
import { ISuccess, TInventoryStock, TVendorIdName } from "@/types";
import axios from "axios";
import Button from "../Button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { getDate } from "@/app/utils/getDate";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { queryClient } from "@/redux/MyProvider";

type TInputId = "opening_stock" | "item_consumed" | "cost_per_unit_current";

async function getVendorIdName() {
  return (await axios.get(`${BASE_API}/inventory/vendor/id-name`)).data;
}

async function getItemStockInfo(id: number) {
  return (await axios.get(`${BASE_API}/inventory/item-stock/${id}`)).data;
}

export default function AddInventoryStockDialog() {
  const { extraValue } = useSelector((state: RootState) => state.dialogs);
  const isNewItem = extraValue.stock_id === "add";

  const dispatch = useDispatch();

  const [inputValues, setInputValues] = useState<{
    opening_stock: number;
    item_consumed: number;
    cost_per_unit_current: number;
  }>({ opening_stock: 0, item_consumed: 0, cost_per_unit_current: 0 });

  const [suppliers, stockItemInfo] = useQueries<
    [
      UseQueryResult<ISuccess<TVendorIdName[]>>,
      UseQueryResult<ISuccess<TInventoryStock>>
    ]
  >([
    {
      queryKey: "get-vendor-id-names",
      queryFn: getVendorIdName,
    },
    {
      queryKey: ["get-item-stock-info", extraValue.stock_id],
      queryFn: () => getItemStockInfo(extraValue.stock_id),
      enabled: !isNewItem,
    },
  ]);

  useEffect(() => {
    setInputValues({
      opening_stock: stockItemInfo.data?.data.opening_stock || 0,
      item_consumed: stockItemInfo.data?.data.item_consumed || 0,
      cost_per_unit_current: parseInt(
        stockItemInfo.data?.data.cost_per_unit_current || "0"
      ),
    });
  }, [stockItemInfo.isFetching]);

  const { mutate, isLoading: isMutating } = useDoMutation();

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

  function handleFormSubmit(formData: FormData) {
    if (!isNewItem) return;

    formData.set("item_id", extraValue.item_id);
    formData.set("type", "add");

    mutate({
      apiPath: "/inventory/item-stock",
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      formData,
      onSuccess() {
        queryClient.refetchQueries("get-inventory-item-info");
        dispatch(setDialog({ type: "CLOSE", dialogId: "" }));
      },
    });
  }

  return (
    <DialogBody className="min-w-[60rem] overflow-y-auto">
      <form action={handleFormSubmit} className="space-y-6">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <Input
              viewOnly={!isNewItem}
              required
              onChange={(e) => handleSomeInputChange("opening_stock", e)}
              type="number"
              name="opening_stock"
              label="Opening Stock"
              placeholder="0"
              defaultValue={stockItemInfo?.data?.data.opening_stock}
            />
          </div>
          <Input
            viewOnly={!isNewItem}
            required
            onChange={(e) => handleSomeInputChange("item_consumed", e)}
            type="number"
            name="item_consumed"
            label="Item Consumed"
            placeholder="0"
            defaultValue={stockItemInfo?.data?.data?.item_consumed || "0"}
          />
          <Input
            required
            viewOnly={true}
            key={"closing_stock"}
            type="number"
            name="closing_stock"
            label="Closing Stock"
            placeholder="0"
            value={inputValues.opening_stock - inputValues.item_consumed}
          />

          <Input
            viewOnly={!isNewItem}
            name="status"
            label="Status"
            placeholder="Enter Some Status"
            defaultValue={stockItemInfo?.data?.data.status}
          />

          <DateInput
            viewOnly={!isNewItem}
            name="purchase_date"
            label="Purchased Date"
            date={getDate(
              new Date(stockItemInfo?.data?.data.purchase_date || "")
            )}
          />
          <HandleDataSuspense
            error={suppliers.error}
            isLoading={suppliers.isFetching}
            data={suppliers?.data?.data}
          >
            {(supplier) => (
              <DropDown
                viewOnly={!isNewItem}
                name="vendor_id"
                label="Supplier"
                options={supplier.map((item) => ({
                  text: item.vendor_name,
                  value: item.vendor_id,
                }))}
                defaultValue={stockItemInfo?.data?.data.vendor_id}
              />
            )}
          </HandleDataSuspense>
          <Input
            viewOnly={!isNewItem}
            required
            moneyInput={true}
            type="number"
            label="Cost per Unit (Current Cost)"
            name="cost_per_unit_current"
            placeholder="0"
            defaultValue={stockItemInfo?.data?.data.cost_per_unit_current}
            onChange={(e) => handleSomeInputChange("cost_per_unit_current", e)}
          />
          <Input
            viewOnly={true}
            required
            moneyInput={true}
            name="total_value"
            label="Total Value"
            placeholder="Total Value"
            value={
              inputValues.opening_stock * inputValues.cost_per_unit_current
            }
          />
          <Input
            viewOnly={!isNewItem}
            name="remark"
            label="Remarks"
            placeholder="Type Remarks"
            defaultValue={stockItemInfo?.data?.data.remark || "..."}
          />
        </div>
        {!isNewItem ? null : (
          <Button
            disabled={isMutating}
            loading={isMutating}
            className={isMutating ? "opacity-40" : ""}
          >
            Add Stock Info
          </Button>
        )}
      </form>
    </DialogBody>
  );
}
