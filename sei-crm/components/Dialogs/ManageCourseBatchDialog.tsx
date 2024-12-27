"use client";

import DialogBody from "./DialogBody";
import DateInput from "../DateInput";
import DropDown from "../DropDown";
import Button from "../Button";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "react-toastify";
import { queryClient } from "@/redux/MyProvider";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { getDate } from "@/app/utils/getDate";
import Input from "../Input";
import { beautifyDate } from "@/app/utils/beautifyDate";

export default function ManageCourseBatchDialog() {
  const { extraValue } = useSelector((state: RootState) => state.dialogs);
  const dispatch = useDispatch();
  const {
    btnType,
    course_id,
    batch_id,
    start_date,
    end_date,
    batch_fee,
    min_to_pay,
    batch_total_seats,
    batch_reserved_seats,
    visibility,
  } = extraValue; //course_id -> number | null

  const { mutate } = useDoMutation();
  const isNewBatch = btnType === "add";

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (!course_id) {
      return toast.error("Need course id for manage course batch");
    }

    formData.append("course_id", `${course_id}`);

    if (isNewBatch) {
      mutate({
        apiPath: "/course/batch",
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        formData,
        onSuccess: () => {
          queryClient.invalidateQueries(["get-course-batches"]);
          dispatch(setDialog({ type: "CLOSE", dialogId: "" }));
        },
      });

      return;
    }

    mutate({
      apiPath: `/course/batch`,
      method: "put",
      headers: {
        "Content-Type": "application/json",
      },
      formData,
      id: batch_id,
      onSuccess: () => {
        queryClient.invalidateQueries(["get-course-batches"]);
        dispatch(setDialog({ type: "CLOSE", dialogId: "" }));
      },
    });
  };

  return (
    <DialogBody className="w-[35rem]">
      <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
        <div className="flex items-start gap-4 flex-wrap *:basis-40 *:flex-grow">
          <DateInput
            viewOnly={!isNewBatch}
            required
            name="start_date"
            label="Batch Start Date *"
            date={start_date ? getDate(new Date(start_date)) : ""}
            viewOnlyText={start_date ? beautifyDate(start_date) : undefined}
          />
          <DateInput
            required
            viewOnly={!isNewBatch}
            name="end_date"
            label="Batch End Date *"
            date={end_date ? getDate(new Date(end_date)) : ""}
            viewOnlyText={end_date ? beautifyDate(end_date) : undefined}
          />

          <Input
            required
            name="batch_fee"
            type="number"
            label="Batch Fee *"
            placeholder="0"
            defaultValue={batch_fee}
          />
          <Input
            required
            name="min_pay_percentage"
            type="number"
            label="Minimum To Pay In Percentage *"
            placeholder="0"
            defaultValue={min_to_pay}
          />
          <Input
            required
            name="batch_total_seats"
            type="number"
            label="Total Seats *"
            placeholder="0"
            defaultValue={batch_total_seats}
          />
          <Input
            required
            name="batch_reserved_seats"
            type="number"
            label="Seat Reserved *"
            placeholder="0"
            defaultValue={batch_reserved_seats}
          />

          <DropDown
            defaultValue={visibility}
            label="Visibility"
            name="visibility"
            options={[
              { text: "Public", value: "Public" },
              { text: "Private", value: "Private" },
            ]}
          />
        </div>

        <Button>{isNewBatch ? "Add New Batch" : "Update Batch Info"}</Button>
      </form>
    </DialogBody>
  );
}
