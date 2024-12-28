import React, { useState } from "react";
import DialogBody from "./DialogBody";
import Input from "../Input";
import Button from "../Button";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { useSearchParams } from "next/navigation";
import { queryClient } from "@/redux/MyProvider";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import RadioInput from "../RadioInput";

const paymentModes = [
  { id: 1, text: "CASH" },
  { id: 2, text: "ICICI BANK" },
  { id: 3, text: "CANARA BANK" },
  { id: 4, text: "SWIPE CARD" },
];

export default function AddDiscountDialog() {
  const { isLoading, mutate } = useDoMutation();
  const searchParams = useSearchParams();

  const [selectedPaymentModeIndex, setSelectedPaymentModeIndex] = useState(0);

  const dispatch = useDispatch();

  function handleAddDiscount(formData: FormData) {
    formData.set("student_id", searchParams.get("student-id")!);
    formData.set("form_id", searchParams.get("form-id")!);
    formData.set("payment_type", "Discount");
    mutate({
      headers: {
        "Content-Type": "application/json",
      },
      apiPath: "/payment/add",
      method: "post",
      formData,
      onSuccess: () => {
        queryClient.invalidateQueries(["fetch-admission-details"]);
        dispatch(setDialog({ type: "CLOSE", dialogId: "" }));
      },
    });
  }

  return (
    <DialogBody>
      <form action={handleAddDiscount} className="space-y-3">
        <Input
          type="number"
          required
          moneyInput
          name="discount_amount"
          label="Manual Discount (Rs) *"
          placeholder="0"
        />
        <Input
          name="discount_remark"
          label="Remark (if any)"
          placeholder="Type here.."
        />

        <div className="flex items-center justify-between *:cursor-pointer flex-wrap gap-5">
          {paymentModes.map((item, index) => (
            <RadioInput
              disabled={isLoading}
              name="mode"
              key={item.id}
              label={item.text}
              onClick={() => setSelectedPaymentModeIndex(index)}
              checked={selectedPaymentModeIndex === index ? true : false}
            />
          ))}
        </div>

        <Button disabled={isLoading} loading={isLoading}>
          Add Discount
        </Button>
      </form>
    </DialogBody>
  );
}
