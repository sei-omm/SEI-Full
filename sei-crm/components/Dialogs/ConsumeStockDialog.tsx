import React from "react";
import DialogBody from "./DialogBody";
import Input from "../Input";
import Button from "../Button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { queryClient } from "@/redux/MyProvider";

export default function ConsumeStockDialog() {
  const { extraValue } = useSelector((state: RootState) => state.dialogs);
  const dispatch = useDispatch();

  const { mutate, isLoading: isMutating } = useDoMutation();

  function handleFormSubmit(formData: FormData) {
    formData.set("item_id", extraValue?.item_id);
    formData.set("type", "consumed");

    mutate({
      apiPath: "/inventory/item-stock/consumed",
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      formData,
      onSuccess() {
        queryClient.invalidateQueries(["inventory-item-list"]);
        dispatch(setDialog({ type: "CLOSE", dialogId: "" }));
      },
    });
  }

  return (
    <DialogBody>
      <form action={handleFormSubmit} className="space-y-5">
        <div>
          <Input
            required
            type="number"
            name="item_consumed"
            min={0}
            max={extraValue?.remain_stock}
            label="Number Of Stock Want To Consume *"
          />
          <span className="text-xs text-gray-500">
            Your Have{" "}
            <span className="font-semibold">{extraValue?.remain_stock}</span>{" "}
            Stock Remain
          </span>
        </div>
        <Input name="remark" label="Remark" />
        <Button loading={isMutating} disabled={isMutating}>
          Update
        </Button>
      </form>
    </DialogBody>
  );
}
