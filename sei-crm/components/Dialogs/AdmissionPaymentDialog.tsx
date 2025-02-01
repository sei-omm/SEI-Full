"use client";

import { LiaMoneyCheckSolid } from "react-icons/lia";
import Input from "../Input";
import DialogBody from "./DialogBody";
import { useState } from "react";
import Button from "../Button";
import { useDispatch, useSelector } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { RootState } from "@/redux/store";
import { useSearchParams } from "next/navigation";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { queryClient } from "@/redux/MyProvider";
import RadioInput from "../RadioInput";
import RefundForm from "../RefundForm";
import { PAYMENT_MODES } from "@/app/constant";

const paymentTypes = [
  { id: 1, text: "Part Payment" },
  { id: 2, text: "Clear Due" },
  { id: 3, text: "Refund" },
];

export default function AdmissionPaymentDialog() {
  const dispatch = useDispatch();
  const { extraValue } = useSelector((state: RootState) => state.dialogs);

  const [selectedPaymentTypeIndex, setSelectedPaymentTypeIndex] = useState(
    extraValue?.selected_tab_index || 0
  );
  const [selectedPaymentModeIndex, setSelectedPaymentModeIndex] = useState(0);
  const [currentAmount] = useState(0);

  const { mutate, isLoading: isMutating } = useDoMutation();
  const {
    mutate: updateEnrollmentStatus,
    isLoading: isUpdatingEnrollmentStatus,
  } = useDoMutation();

  const searchParams = useSearchParams();

  const handleFormSubmit = (formData: FormData) => {
    formData.set("student_id", `${searchParams.get("student-id")}`);
    formData.set("form_id", `${searchParams.get("form-id")}`);

    if (formData.get("refund_id") === "") {
      formData.delete("refund_id");
    }

    if (selectedPaymentTypeIndex === 2) {
      formData.delete("payment_type");

      // if refund radio selected
      mutate({
        apiPath: "/payment/refund",
        method: "post",
        formData,
        onSuccess: () => {
          queryClient.invalidateQueries(["fetch-admission-details"]);
          dispatch(setDialog({ type: "CLOSE", dialogId: "" }));
        },
      });

      return;
    }

    if (formData.get("misc_payment") === "") {
      formData.set("misc_payment", "0");
    }

    const paidAmount = formData.get("paid_amount");
    if (selectedPaymentTypeIndex === 2 && paidAmount !== null) {
      const result = -Math.abs(parseInt(paidAmount.toString()));
      formData.set("paid_amount", `${result}`);
    }

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

  const handleSkipRefund = () => {
    updateEnrollmentStatus({
      apiPath: "/admission/enrollment-status",
      method: "patch",
      formData: {
        enrollment_status: "Cancel",
      },
      id: extraValue?.enroll_id,
      onSuccess() {
        queryClient.invalidateQueries(["fetch-admission-details"]);
        dispatch(setDialog({ type: "CLOSE", dialogId: "" }));
      },
    });
  };

  return (
    <DialogBody className="w-[45rem] max-h-[35rem] overflow-y-scroll">
      <form action={handleFormSubmit} className="space-y-5">
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

        {selectedPaymentTypeIndex === 2 ? (
          <RefundForm
            student_course_info={extraValue.student_course_info}
            selected_batch_id={extraValue?.selected_batch_id}
          />
        ) : (
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
                  className={
                    selectedPaymentTypeIndex === 1 ? "bg-gray-200" : ""
                  }
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
        )}

        {/* payment mode */}
        <div className="flex items-center justify-between *:cursor-pointer">
          {PAYMENT_MODES.map((item, index) =>
            item.id === 5 && selectedPaymentTypeIndex !== 2 ? null : (
              <RadioInput
                disabled={isMutating}
                name="mode"
                key={item.id}
                label={item.text}
                onClick={() => setSelectedPaymentModeIndex(index)}
                checked={selectedPaymentModeIndex === index ? true : false}
              />
            )
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div>
            {selectedPaymentTypeIndex === 2 && extraValue?.enroll_id ? (
              <Button
                className="bg-yellow-500 text-black font-semibold"
                loading={isUpdatingEnrollmentStatus}
                disabled={isUpdatingEnrollmentStatus}
                type="button"
                onClick={handleSkipRefund}
              >
                Skip Refund & Cancel
              </Button>
            ) : null}
          </div>
          <div className="flex items-center justify-end gap-4">
            <Button
              disabled={isMutating || isUpdatingEnrollmentStatus}
              loading={isMutating}
              className="border border-foreground"
            >
              {selectedPaymentTypeIndex === 2
                ? "Initiate Refund"
                : "Add"}
            </Button>
            <Button
              disabled={isMutating || isUpdatingEnrollmentStatus}
              type="button"
              onClick={() =>
                dispatch(setDialog({ type: "CLOSE", dialogId: "" }))
              }
              className="bg-transparent border-foreground border text-foreground"
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </DialogBody>
  );
}
