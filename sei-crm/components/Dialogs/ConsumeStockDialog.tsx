import React from "react";
import DialogBody from "./DialogBody";
import Input from "../Input";
import Button from "../Button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { queryClient } from "@/redux/MyProvider";
import { sendNoification } from "@/utils/sendNoification";
// import DateInput from "../DateInput";

export default function ConsumeStockDialog() {
  const { extraValue } = useSelector((state: RootState) => state.dialogs);
  const dispatch = useDispatch();

  // const CURRENT_DATE = new Date().toISOString().split("T")[0]

  const { mutate, isLoading: isMutating } = useDoMutation();

  function handleFormSubmit(formData: FormData) {
    formData.set("item_id", extraValue?.item_id);

    mutate({
      apiPath: "/inventory/item-stock/consumed",
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      formData,
      onSuccess() {
        const consumeStockValue = parseInt(
          formData.get("consume_stock")?.toString() || "0"
        );
        if (
          extraValue?.remain_stock - consumeStockValue <
          extraValue?.minimum_stock
        ) {
          //Send Notification
          sendNoification({
            notification_title: "Notification From Inventory Management",
            notification_description: `${extraValue?.item_name} Stock Is Low Please Fullfill The Stock As Soon As Possible`,
            notification_type: "role_base",
            employee_roles: ["Admin", "Employee"],
            notification_link: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/inventory/inventory-list?item_name=${extraValue?.item_name}`,
          });
        }

        queryClient.invalidateQueries(["inventory-item-list"]);
        dispatch(setDialog({ type: "CLOSE", dialogId: "" }));
      },
    });
  }

  return (
    <DialogBody>
      <form action={handleFormSubmit} className="space-y-5">
        <div>
          <div>
            <Input
              title="Invalid Number Of Item You Want To Consume"
              required
              type="number"
              name="consume_stock"
              min={1}
              max={extraValue?.remain_stock || 0}
              label="Number Of Stock Want To Consume *"
              // label="Stock"
            />
            {/* <DateInput
              name="consume_date"
              label="Consume Date"
              max={CURRENT_DATE}
            /> */}
          </div>
          <span className="text-xs text-gray-500">
            Your Have{" "}
            <span className="font-semibold">
              {extraValue?.remain_stock || 0}
            </span>{" "}
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
