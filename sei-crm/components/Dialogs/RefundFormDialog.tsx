import React from "react";
import DialogBody from "./DialogBody";
import RefundForm from "../RefundForm";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Button from "../Button";
import { TRefundDetails } from "@/types";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { PAYMENT_MODES } from "@/app/constant";
import RadioInput from "../RadioInput";
import { queryClient } from "@/redux/MyProvider";
import { setDialog } from "@/redux/slices/dialogs.slice";

// type FormDataPayload = {
//   student_id: number;
//   [key: string]: string | Blob | number;
// };

export default function RefundFormDialog() {
  const { extraValue } = useSelector((state: RootState) => state.dialogs);
  const dispatch = useDispatch();

  const extraValueInfo = extraValue as TRefundDetails | undefined;

  const { isLoading, mutate } = useDoMutation();
  const handleFormSubmit = (formData: FormData) => {
    if (!confirm("Are you sure you want to continue?")) return;

    formData.set("student_id", `${extraValueInfo?.student_id}`);
    formData.set("course_id", `${extraValueInfo?.course_id}`);
    formData.set("refund_amount", `${extraValueInfo?.refund_amount}`);
    formData.set("form_id", `${extraValueInfo?.form_id}`);
    formData.set("batch_id", `${extraValueInfo?.batch_id}`);

    mutate({
      apiPath: "/payment/refund",
      method: "put",
      headers: {
        "Content-Type": "application/json",
      },
      formData,
      onSuccess() {
        queryClient.invalidateQueries("refund-list");
        dispatch(setDialog({ type: "CLOSE", dialogId: "" }));
      },
    });
  };

  return (
    <DialogBody className="min-w-[40rem]">
      <form action={handleFormSubmit} className="space-y-3">
        <RefundForm selected_batch_id={2} refund_info={extraValueInfo} />
        {/* payment mode */}
        <div className="flex items-center justify-between *:cursor-pointer">
          {PAYMENT_MODES.map((item) => (
            <RadioInput
              name="mode"
              key={item.id}
              label={item.text}
              defaultChecked={item.text === extraValueInfo?.mode ? true : false}
            />
          ))}
        </div>
        <div className="w-full flex items-center justify-end">
          <Button loading={isLoading} disabled={isLoading}>
            Proceed
          </Button>
        </div>
      </form>
    </DialogBody>
  );
}
