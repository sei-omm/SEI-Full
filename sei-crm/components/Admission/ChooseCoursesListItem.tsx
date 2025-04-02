import React, { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { useQuery } from "react-query";
import { BASE_API } from "@/app/constant";
import axios from "axios";
import { ISuccess, StudentForm, TCourseDropDown2 } from "@/types";
import HandleSuspence from "../HandleSuspence";
import {
  Control,
  Controller,
  FieldErrors,
  UseFieldArrayRemove,
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import DropDownNew from "../FormInputs/DropDownNew";
import DateInputNew from "../FormInputs/DateInputNew";
import CampusNew from "../CampusNew";

interface IProps {
  index: number;
  register: UseFormRegister<StudentForm>;
  control: Control<StudentForm, any>;
  errors: FieldErrors<StudentForm>;
  setValue: UseFormSetValue<StudentForm>;
  clearErrors: UseFormClearErrors<StudentForm>;
  remove: UseFieldArrayRemove;
}

export default function ChooseCoursesListItem({
  index,
  register,
  control,
  errors,
  setValue,
  clearErrors,
  remove,
}: IProps) {
  const [institute, setInstitute] = useState("Kolkata");
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [currentBatches, setCurrentBatches] = useState<
    { batch_id: number; start_date: string }[]
  >([]);

  const {
    data: courses,
    isFetching,
    error,
  } = useQuery<ISuccess<TCourseDropDown2[]>>({
    queryKey: [
      `get-courses-dropdown-choose-course-${index}`,
      institute,
      currentMonth,
    ],
    queryFn: async () =>
      (
        await axios.get(
          `${BASE_API}/course/drop-down?institute=${institute}&month_year=${currentMonth}&with_full_batch_info=true`
        )
      ).data,
    onSuccess(data) {
      const batchesInfo =
        data.data.find(
          (fItem) =>
            fItem.course_id == parseInt(data.data[0].course_id.toString())
        )?.course_batches || [];
      setCurrentBatches(batchesInfo);
    },
    refetchOnMount: true,
  });

  return (
    <li className="flex items-center *:flex-grow gap-5">
      <Controller
        name="institute"
        control={control}
        render={({ field }) => (
          <CampusNew
            {...register("institute")}
            onChange={(item) => {
              setValue("institute", item.value);
              clearErrors("institute");
              setInstitute(item.value);
            }}
            defaultValue={field.value}
            error={errors.course_info?.[0]?.institute?.message}
          />
        )}
      />
      <DateInputNew
        {...register(`course_info.${index}.month_year`)}
        onChange={(value) => {
          setValue(`course_info.${index}.month_year`, value.target.value);
          clearErrors(`course_info.${index}.month_year`);
          setCurrentMonth(value.target.value);
        }}
        key={"MonthAndYearChoose"}
        type="month"
        label="Choose Month & Year"
        date={new Date().toISOString().slice(0, 7)}
        error={errors.course_info?.[0]?.month_year?.message}
      />
      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={courses?.data.length}
      >
        <>
          <Controller
            name={`course_info.${index}.course_id`}
            control={control}
            render={({ field }) => (
              <DropDownNew
                key={"CourseName"}
                {...register(`course_info.${index}.course_id`)}
                onChange={(item) => {
                  const batchesInfo =
                    courses?.data.find(
                      (fItem) => fItem.course_id == parseInt(item.value)
                    )?.course_batches || [];
                  setCurrentBatches(batchesInfo);
                  setValue(
                    `course_info.${index}.course_id`,
                    parseInt(item.value)
                  );
                  clearErrors(`course_info.${index}.course_id`);
                }}
                label="Course Name"
                options={[
                  { text: "Choose Course", value: "0" },
                  ...(courses?.data.map((course) => ({
                    text: course.course_name,
                    value: course.course_id.toString(),
                  })) || []),
                ]}
                defaultValue={field.value}
                error={errors.course_info?.[0]?.course_id?.message}
              />
            )}
          />

          <Controller
            name={`course_info.${index}.batch_id`}
            control={control}
            render={({ field }) => (
              <DropDownNew
                {...register(`course_info.${index}.batch_id`)}
                key={"BatchDate"}
                label="Choose Batch Date"
                options={[
                  { text: "Choose Batch", value: "0" },
                  ...currentBatches.map((batch) => ({
                    text: batch.start_date,
                    value: batch.batch_id.toString(),
                  })),
                ]}
                onChange={(item) => {
                  setValue(
                    `course_info.${index}.batch_id`,
                    parseInt(item.value)
                  );
                  clearErrors(`course_info.${index}.batch_id`);
                }}
                defaultValue={field.value}
                error={errors.course_info?.[0]?.batch_id?.message}
              />
            )}
          />
        </>
      </HandleSuspence>
      {index === 0 ? null : (
        <AiOutlineDelete
          onClick={() => remove(index)}
          size={18}
          className="cursor-pointer flex-grow-0 mt-5"
        />
      )}
    </li>
  );
}
