"use client";

import DialogBody from "./DialogBody";
import Button from "../Button";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "react-toastify";
import { queryClient } from "@/redux/MyProvider";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { getDate } from "@/app/utils/getDate";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { Controller, useForm } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import DateInputNew from "../FormInputs/DateInputNew";
import InputNew from "../FormInputs/InputNew";
import DropDownNew from "../FormInputs/DropDownNew";

const formSchema = z.object({
  start_date: z.string().min(1, "Batch Start Date Is Required"),
  end_date: z.string().min(1, "Batch End Date Is Required"),
  batch_fee: z
    .number({ message: "Input Must Be A Number" })
    .min(1, "Batch Fee Is "),
  min_pay_percentage: z
    .number({ message: "Input Must Be A Number" })
    .min(1, "Add Min To Pay In Percentage"),
  batch_total_seats: z
    .number({ message: "Input Must Be A Number" })
    .min(1, "Total Seats Is "),
  batch_reserved_seats: z
    .number({ message: "Input Must Be A Number" })
    .min(0, "Remain Seats Is "),
  visibility: z.string().min(1, "Choose Batch Visibility"),
  // course_id: z.string().min(1, "Choose Batch Visibility"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ManageCourseBatchDialog() {
  const { extraValue } = useSelector((state: RootState) => state.dialogs);
  const [batchStartDate, setBatchStartDate] = useState("");
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

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const { mutate, isLoading } = useDoMutation();
  const isNewBatch = btnType === "add";

  const handleFormSubmit = (formData: FormValues) => {
    if (!course_id) {
      return toast.error("Need course id for manage course batch");
    }

    if (isNewBatch) {
      mutate({
        apiPath: "/course/batch",
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        formData: {
          ...formData,
          course_id,
        },
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
      formData: {
        ...formData,
        course_id,
      },
      id: batch_id,
      onSuccess: () => {
        queryClient.invalidateQueries(["get-course-batches"]);
        dispatch(setDialog({ type: "CLOSE", dialogId: "" }));
      },
    });
  };

  useEffect(() => {
    reset({
      batch_fee: batch_fee,
      batch_reserved_seats: batch_reserved_seats,
      batch_total_seats: batch_total_seats,
      end_date: end_date,
      min_pay_percentage: min_to_pay,
      start_date: start_date,
      visibility: visibility,
    });
  }, []);

  return (
    <DialogBody className="w-[35rem]">
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="mt-5 space-y-4"
      >
        <div className="flex items-start gap-4 flex-wrap *:basis-40 *:flex-grow">
          <DateInputNew
            {...register("start_date")}
            viewOnly={!isNewBatch}
            label="Batch Start Date *"
            date={start_date ? getDate(new Date(start_date)) : ""}
            viewOnlyText={start_date ? beautifyDate(start_date) : undefined}
            error={errors.start_date?.message}
            onChange={(e) => {
              setBatchStartDate(e.currentTarget.value)
            }}
          />
          <DateInputNew
            {...register("end_date")}
            min={batchStartDate}
            viewOnly={!isNewBatch}
            label="Batch End Date *"
            date={end_date ? getDate(new Date(end_date)) : ""}
            viewOnlyText={end_date ? beautifyDate(end_date) : undefined}
            error={errors.end_date?.message}
          />

          <InputNew
            {...register("batch_fee", { valueAsNumber: true })}
            type="number"
            label="Batch Fee *"
            placeholder="0"
            error={errors.batch_fee?.message}
          />
          <InputNew
            {...register("min_pay_percentage", { valueAsNumber: true })}
            type="number"
            label="Minimum To Pay In Percentage *"
            placeholder="0"
            error={errors.min_pay_percentage?.message}
          />
          <InputNew
            {...register("batch_total_seats", { valueAsNumber: true })}
            type="number"
            label="Total Seats *"
            placeholder="0"
            error={errors.batch_total_seats?.message}
          />
          <InputNew
            required
            {...register("batch_reserved_seats", { valueAsNumber: true })}
            type="number"
            label="Seat Reserved *"
            placeholder="0"
            error={errors.batch_reserved_seats?.message}
          />

          <Controller
            name="visibility"
            control={control}
            render={({ field }) => (
              <DropDownNew
                {...register("visibility")}
                label="Visibility"
                options={[
                  { text: "Public", value: "Public" },
                  { text: "Private", value: "Private" },
                ]}
                onChange={(option) => {
                  setValue("visibility", option.value);
                  clearErrors("visibility");
                }}
                error={errors.visibility?.message}
                defaultValue={field.value}
              />
            )}
          />
        </div>

        <Button loading={isLoading} disabled={isLoading}>
          {isNewBatch ? "Add New Batch" : "Update Batch Info"}
        </Button>
      </form>
    </DialogBody>
  );
}
