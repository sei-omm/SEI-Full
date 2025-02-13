import React, { useState } from "react";
import DialogBody from "./DialogBody";
import { useDispatch } from "react-redux";
import Button from "../Button";
import { BASE_API } from "@/app/constant";
import axios from "axios";
import { useQuery } from "react-query";
import { ISuccess, TVendorIdName } from "@/types";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { queryClient } from "@/redux/MyProvider";
import { IoIosAdd } from "react-icons/io";
import { setDialog } from "@/redux/slices/dialogs.slice";
import InventoryFormItem from "../Inventory/InventoryFormItem";
import HandleSuspence from "../HandleSuspence";
import DropDown from "../DropDown";

async function getVendorIdName() {
  return (await axios.get(`${BASE_API}/inventory/vendor/id-name`)).data;
}
 
export default function AddInventoryItemStock() {
  const [inputs, setInputs] = useState<number[]>([1]);
  const [currentVendorId, setCurrentVendorid] = useState(-1);
  const dispatch = useDispatch();

  function handleDeleteItem(index: number) {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  }

  // const [suppliers, stock_info] = useQueries<
  //   [
  //     UseQueryResult<ISuccess<TVendorIdName[]>>,
  //     UseQueryResult<ISuccess<TStockInfo>>
  //   ]
  // >([
  //   {
  //     queryKey: "get-vendor-id-names",
  //     queryFn: getVendorIdName,
  //   },
  //   {
  //     queryKey: "get-stock-info",
  //     queryFn: () => getStockInfo(extraValue?.item_id || 0),
  //     refetchOnMount: true,
  //   },
  // ]);

  const {
    data: suppliers,
    error,
    isFetching,
  } = useQuery<ISuccess<TVendorIdName[]>>({
    queryKey: "get-vendor-id-names",
    queryFn: getVendorIdName,
    onSuccess(data) {
      if (data.data.length !== 0) {
        setCurrentVendorid(data.data[0].vendor_id);
      }
    },
    refetchOnMount : true
  });

  const { isLoading, mutate } = useDoMutation();

  function handleFormAction(formData: FormData) {
    const datasToStore: any[] = [];
    let trackIndex = 0;

    let obj: any = {};

    formData.forEach((value, key) => {
      if (trackIndex >= 6) {
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
      <div className="flex items-center justify-between">
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
        <HandleSuspence
          isLoading={isFetching}
          error={error}
          dataLength={suppliers?.data.length}
        >
          <DropDown
            onChange={(option) => setCurrentVendorid(option.value)}
            key="Choose Supplier"
            label="Choose Supplier"
            options={
              suppliers?.data.map((item) => ({
                text: item.vendor_name,
                value: item.vendor_id,
              })) || []
            }
          />
        </HandleSuspence>
      </div>
      <form action={handleFormAction} className="space-y-5">
        {inputs.length === 0 ? null : (
          <div className="w-full overflow-x-auto space-y-5 py-8">
            {inputs.map((item, index) => (
              <InventoryFormItem
                key={item}
                handleDeleteBtnClick={() => handleDeleteItem(index)}
                currentVendorId={currentVendorId}
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
