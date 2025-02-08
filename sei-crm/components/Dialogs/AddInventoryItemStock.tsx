import React, { useState } from "react";
import DialogBody from "./DialogBody";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Button from "../Button";
import { BASE_API } from "@/app/constant";
import axios from "axios";
import { useQueries, UseQueryResult } from "react-query";
import { ISuccess, TVendorIdName } from "@/types";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { queryClient } from "@/redux/MyProvider";
import { IoIosAdd } from "react-icons/io";
import { BiLayerMinus } from "react-icons/bi";
import { GiSandsOfTime } from "react-icons/gi";
import { PiMoney } from "react-icons/pi";
import { setDialog } from "@/redux/slices/dialogs.slice";
import InventoryFormItem from "../Inventory/InventoryFormItem";

async function getVendorIdName() {
  return (await axios.get(`${BASE_API}/inventory/vendor/id-name`)).data;
}

async function getStockInfo(item_id: number) {
  return (await axios.get(`${BASE_API}/inventory/item-stock/item/${item_id}`))
    .data;
}

type TStockInfo = {
  total_stock: number;
  total_item_consumed: number;
  remain_stock: number;
  total_spend: number;
};

export default function AddInventoryItemStock() {
  const { extraValue } = useSelector((state: RootState) => state.dialogs);
  const [inputs, setInputs] = useState<number[]>([1]);
  const dispatch = useDispatch();

  function handleDeleteItem(index: number) {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  }

  const [suppliers, stock_info] = useQueries<
    [
      UseQueryResult<ISuccess<TVendorIdName[]>>,
      UseQueryResult<ISuccess<TStockInfo>>
    ]
  >([
    {
      queryKey: "get-vendor-id-names",
      queryFn: getVendorIdName,
    },
    {
      queryKey: "get-stock-info",
      queryFn: () => getStockInfo(extraValue?.item_id || 0),
      refetchOnMount: true,
    },
  ]);

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
        dispatch(setDialog({ type: "CLOSE", dialogId: "" }));
        setInputs([]);
        queryClient.invalidateQueries(["inventory-item-list"]);
      },
    });
  }

  return (
    <DialogBody className="min-w-[65%] max-h-[90%] overflow-y-scroll">
      <div className="flex items-center w-full">
        <Button
          onClick={() => {
            const preStates = [...inputs];

            preStates.push(
              preStates.length === 0 ? 1 : preStates[preStates.length - 1] + 1
            );
            setInputs(preStates);
          }}
        >
          <IoIosAdd size={17} color="#fff" />
        </Button>
        <div className="flex items-center justify-between w-full px-5">
          {/* <div className="flex-center gap-2 font-semibold text-xs">
            <IoLayersOutline />
            <span>Total Stock : {stock_info.data?.data.total_stock}</span>
          </div> */}

          <div className="flex-center gap-2 font-semibold text-xs">
            <BiLayerMinus />
            <span>
              Stock Consumed : {stock_info.data?.data.total_item_consumed}
            </span>
          </div>

          <div className="flex-center gap-2 font-semibold text-xs">
            <GiSandsOfTime />
            <span>Remain Stock : {stock_info.data?.data.remain_stock}</span>
          </div>

          <div className="flex-center gap-2 font-semibold text-xs">
            <PiMoney />
            <span>Total Spend : ₹{stock_info.data?.data.total_spend}</span>
          </div>
        </div>
      </div>
      <form action={handleFormAction} className="space-y-5">
        {inputs.length === 0 ? null : (
          <div className="w-full overflow-x-auto space-y-5 py-8">
            {inputs.map((item, index) => (
              <InventoryFormItem
                key={item}
                handleDeleteBtnClick={() => handleDeleteItem(index)}
                item_id={extraValue?.item_id || 0}
                remain_stock={stock_info.data?.data.remain_stock || 0}
                suppliers={suppliers.data}
                suppliers_fetching={suppliers.isFetching}
                suppliers_error={suppliers.error}
              />
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
    </DialogBody>
  );
}
