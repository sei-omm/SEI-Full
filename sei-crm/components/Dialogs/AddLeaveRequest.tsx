import React from "react";
import DialogBody from "./DialogBody";
import DateInput from "../DateInput";
import TextArea from "../TextArea";
import Button from "../Button";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useDispatch } from "react-redux";
import { getAuthToken } from "@/app/utils/getAuthToken";
import { queryClient } from "@/redux/MyProvider";

export default function AddLeaveRequest() {
  const { isLoading, mutate } = useDoMutation();
  const dispatch = useDispatch();

  function handleSubmit(formData: FormData) {
    mutate({
      apiPath: "/employee/leave",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        ...getAuthToken(),
      },
      formData,
      onSuccess: () => {
        dispatch(setDialog({ type: "CLOSE", dialogId: "add-leave-request" }));
        queryClient.invalidateQueries({ queryKey: ["employee-leave-request"] });
      },
    });
  }

  return (
    <DialogBody>
      <form action={handleSubmit} className="space-y-3">
        <DateInput required name="leave_from" label="From" />
        <DateInput required name="leave_to" label="To" />
        <TextArea
          required
          name="leave_reason"
          label="Reason"
          placeholder="Type your reason here..."
        />
        <Button loading={isLoading} disabled={isLoading}>
          Submit
        </Button>
      </form>
    </DialogBody>
  );
}
