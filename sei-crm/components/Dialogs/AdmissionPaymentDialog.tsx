"use client";

import { LiaMoneyCheckSolid } from "react-icons/lia";
import Input from "../Input";
import DialogBody from "./DialogBody";
import { FormEvent, useState } from "react";
import Button from "../Button";
import { useDispatch, useSelector } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { RootState } from "@/redux/store";
import { useSearchParams } from "next/navigation";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { queryClient } from "@/redux/MyProvider";
import RadioInput from "../RadioInput";

const paymentTypes = [
  { id: 1, text: "Part Payment" },
  { id: 2, text: "Clear Due" },
  { id: 3, text: "Revert" },
];

const paymentModes = [
  { id: 1, text: "CASH" },
  { id: 2, text: "ICICI BANK" },
  { id: 3, text: "CANARA BANK" },
  { id: 4, text: "SWIPE CARD" },
];

export default function AdmissionPaymentDialog() {
  const dispatch = useDispatch();
  const { extraValue } = useSelector((state: RootState) => state.dialogs);

  const [selectedPaymentTypeIndex, setSelectedPaymentTypeIndex] = useState(0);
  const [selectedPaymentModeIndex, setSelectedPaymentModeIndex] = useState(0);
  const [currentAmount] = useState(0);

  const { mutate, isLoading: isMutating } = useDoMutation();

  const searchParams = useSearchParams();

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    if (formData.get("misc_payment") === "") {
      formData.set("misc_payment", "0");
    }

    const paidAmount = formData.get("paid_amount");
    if (selectedPaymentTypeIndex === 2 && paidAmount !== null) {
      const result = -Math.abs(parseInt(paidAmount.toString()));
      formData.set("paid_amount", `${result}`);
    }

    formData.append("student_id", `${searchParams.get("student-id")}`);
    // formData.append("course_id", `${searchParams.get("course-id")}`);
    formData.append("form_id", `${searchParams.get("form-id")}`);

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
  };

  return (
    <DialogBody className="w-[45rem]">
      <form onSubmit={handleFormSubmit} className="space-y-5">
        {extraValue.payment_type === "add-misc-payment" ? null : (
          <div className="flex items-center gap-x-10 gap-y-4 flex-wrap *:flex *:items-center *:gap-2">
            <span className="font-semibold text-green-500">
              <LiaMoneyCheckSolid />
              Total Paid : ₹{extraValue.total_paid}
            </span>
            <span className="font-semibold  text-red-500">
              <LiaMoneyCheckSolid />
              Total Due : ₹{extraValue.total_due - currentAmount}
            </span>
          </div>
        )}

        {extraValue.payment_type === "add-misc-payment" ? (
          <RadioInput
            disabled={isMutating}
            name="payment_type"
            label={"Misc Payment"}
            checked={true}
          />
        ) : (
          // Payment Types
          <div className="flex items-center justify-between *:cursor-pointer">
            {paymentTypes.map((item, index) => (
              <RadioInput
                disabled={isMutating}
                name="payment_type"
                key={item.id}
                label={item.text}
                onClick={() => setSelectedPaymentTypeIndex(index)}
                checked={selectedPaymentTypeIndex === index ? true : false}
              />
            ))}
          </div>
        )}

        <div className="w-full grid grid-cols-2 gap-4">
          {extraValue.payment_type === "add-misc-payment" ? (
            <>
              <Input
                disabled={isMutating}
                name="misc_payment"
                label="Misc Payment(if any)"
                type="number"
                placeholder="1"
                min={1}
              />
              <Input
                disabled={isMutating}
                name="misc_remark"
                label="Misc Payment Remark (if any)"
                type="text"
                placeholder="Enter remark"
              />
            </>
          ) : (
            <>
              {selectedPaymentTypeIndex === 1 ? (
                <input
                  className="hidden"
                  key={"HiddenPaymentInput" + selectedPaymentTypeIndex}
                  name="paid_amount"
                  defaultValue={extraValue.total_due}
                />
              ) : null}
              <Input
                key={"PaymentInput" + selectedPaymentTypeIndex}
                required
                name="paid_amount"
                className={selectedPaymentTypeIndex === 1 ? "bg-gray-200" : ""}
                disabled={
                  selectedPaymentTypeIndex != 1 && !isMutating ? false : true
                }
                defaultValue={
                  selectedPaymentTypeIndex === 1 ? extraValue.total_due : 0
                }
                label="Amount *"
                type="number"
                placeholder="1"
                min={1}
                max={
                  selectedPaymentTypeIndex === 2
                    ? 500000000
                    : extraValue.total_due
                }
              />
              <Input
                disabled={isMutating}
                name="remark"
                label="Remark (if any)"
                type="text"
                placeholder="Enter remark"
              />
            </>
          )}
        </div>

        {/* payment mode */}
        <div className="flex items-center justify-between *:cursor-pointer">
          {paymentModes.map((item, index) => (
            <RadioInput
              disabled={isMutating}
              name="mode"
              key={item.id}
              label={item.text}
              onClick={() => setSelectedPaymentModeIndex(index)}
              checked={selectedPaymentModeIndex === index ? true : false}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 justify-end">
          <Button
            disabled={isMutating}
            loading={isMutating}
            className="border border-foreground"
          >
            Add
          </Button>
          <Button
            disabled={isMutating}
            type="button"
            onClick={() => dispatch(setDialog({ type: "CLOSE", dialogId: "" }))}
            className="bg-transparent border-foreground border text-foreground"
          >
            Cancel
          </Button>
        </div>
      </form>
    </DialogBody>
  );
}
