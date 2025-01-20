import React, { useState } from "react";
import Input from "../Input";
import DropDown from "../DropDown";
import Button from "../Button";
import { BASE_API } from "@/app/constant";
import { AiOutlineDelete } from "react-icons/ai";
import DateInput from "../DateInput";
import HandleDataSuspense from "../HandleDataSuspense";
import { useQuery } from "react-query";
import axios from "axios";
import { ISuccess, TVendorIdName } from "@/types";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useDispatch } from "react-redux";
import { MdOutlineAdd } from "react-icons/md";
import { BiLayerMinus } from "react-icons/bi";
import { queryClient } from "@/redux/MyProvider";
import { useDoMutation } from "@/app/utils/useDoMutation";

type TInputId = "opening_stock" | "item_consumed" | "cost_per_unit_current";

async function getVendorIdName() {
  return (await axios.get(`${BASE_API}/inventory/vendor/id-name`)).data;
}

interface IProps {
  remain_stock: number | undefined;
  item_id: number;
}

export default function MultiInventoryItemStockForm({
  remain_stock,
  item_id,
}: IProps) {
  const [inputs, setInputs] = useState<number[]>([]);
  const dispatch = useDispatch();

  const [inputValues, setInputValues] = useState<{
    opening_stock: number;
    item_consumed: number;
    cost_per_unit_current: number;
  }>({ opening_stock: 0, item_consumed: 0, cost_per_unit_current: 0 });

  function handleDeleteItem(index: number) {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  }

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
    data: suppliers,
    error,
    isFetching,
  } = useQuery<ISuccess<TVendorIdName[]>>({
    queryKey: "get-vendor-id-names",
    queryFn: getVendorIdName,
  });

  const { isLoading, mutate } = useDoMutation();

  function handleFormAction(formData: FormData) {
    const datasToStore: any[] = [];
    let trackIndex = 0;

    let obj: any = {};

    formData.forEach((value, key) => {
      if (trackIndex >= 10) {
        trackIndex = 0;
        if (key === "completed_date" && value === "") {
          obj[key] = null;
        } else {
          obj[key] = value;
        }
        datasToStore.push(obj);
        obj = {};
        return;
      }

      if (key === "completed_date" && value === "") {
        obj[key] = null;
      } else {
        obj[key] = value;
      }
      trackIndex++;
    });

    mutate({
      apiPath: "/inventory/item-stock/multi",
      method: "post",
      formData: datasToStore,
      onSuccess() {
        queryClient.invalidateQueries("get-item-stock-all-info");
        setInputs([]);
      },
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-6">
        <Button
          onClick={() => {
            const preStates = [...inputs];

            preStates.push(
              preStates.length === 0 ? 1 : preStates[preStates.length - 1] + 1
            );
            setInputs(preStates);
          }}
          type="button"
          className="flex-center gap-2"
        >
          <MdOutlineAdd size={18} />
          Add New Stock
        </Button>
        <Button
          onClick={() =>
            dispatch(
              setDialog({
                dialogId: "inventory-stock-consume-dialog",
                type: "OPEN",
                extraValue: {
                  remain_stock: remain_stock,
                  item_id,
                },
              })
            )
          }
          type="button"
          className="flex-center gap-2"
        >
          <BiLayerMinus size={18} />
          Consume Stock
        </Button>
      </div>
      <form action={handleFormAction} className="space-y-5">
        {inputs.length === 0 ? null : (
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
                <Input
                  viewOnly={true}
                  viewOnlyText={remain_stock?.toString() || "0"}
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
                <Input
                  name="status"
                  label="Status"
                  placeholder="Enter Some Status"
                />
                <DateInput name="purchase_date" label="Purchased Date" />

                <HandleDataSuspense
                  error={error}
                  isLoading={isFetching}
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
                  label="Cost per Unit (Current Cost)"
                  name="cost_per_unit_current"
                  placeholder="0"
                  onChange={(e) =>
                    handleSomeInputChange("cost_per_unit_current", e)
                  }
                />
                <Input
                  viewOnly={true}
                  required
                  moneyInput={true}
                  name="total_value"
                  label="Total Value"
                  placeholder="Total Value"
                  value={
                    inputValues.opening_stock *
                    inputValues.cost_per_unit_current
                  }
                />
                <Input
                  name="remark"
                  label="Remarks"
                  placeholder="Type Remarks"
                />
              </div>
            ))}
          </div>
        )}

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
