import { BASE_API } from "@/app/constant";
import { ISuccess, TCourseDropDown2 } from "@/types";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import HandleSuspence from "../HandleSuspence";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import DropDownNew from "../FormInputs/DropDownNew";
import { PackageForm } from "@/app/dashboard/course/manage-package-course/[slug]/page";
import { AiOutlineDelete } from "react-icons/ai";
import { IoPricetagOutline } from "react-icons/io5";
import InputNew from "../FormInputs/InputNew";

interface IProps {
  institute: string;
  index: number;
  control: Control<PackageForm, any>;
  register: UseFormRegister<PackageForm>;
  setValue: UseFormSetValue<PackageForm>;
  clearErrors: UseFormClearErrors<PackageForm>;
  onRemove?:(index : number) => void;
  errors: FieldErrors<PackageForm>;
  course_fee: number;
}

function ChooseCourse({
  index,
  institute,
  register,
  clearErrors,
  onRemove,
  setValue,
  control,
  errors,
  course_fee
}: IProps) {
  const [currentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [currentCoursePrice, setCurrentCoursePrice] = useState(course_fee);

  useEffect(() => {
    setValue(`course_info.${index}.course_fee`, currentCoursePrice);
  }, [currentCoursePrice]);

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
      (await axios.get(`${BASE_API}/course/drop-down?institute=${institute}`))
        .data,
    refetchOnMount: true,
  });

  return (
    <li>
      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={courses?.data.length}
      >
        <div className="flex items-center gap-3">
          <AiOutlineDelete
            onClick={() => onRemove?.(index)}
            size={18}
            className="cursor-pointer flex-grow-0 mt-5"
          />
          <div className="flex-1 max-w-[80%]">
            <Controller
              name={`course_info.${index}.course_id`}
              control={control}
              render={({ field }) => (
                <DropDownNew
                  label=""
                  key={"CourseName"}
                  {...register(`course_info.${index}.course_id`, {
                    valueAsNumber: true,
                  })}
                  onChange={(option) => {
                    const currentCourseFee = courses?.data.find(
                      (item) => item.course_id == parseInt(option.value)
                    )?.course_fee;
                    setValue(
                      `course_info.${index}.course_id`,
                      parseInt(option.value)
                    );
                    clearErrors(`course_info.${index}.course_id`);
                    setCurrentCoursePrice(currentCourseFee || 0);
                  }}
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
          </div>

          <span className="flex items-center gap-3">
            <IoPricetagOutline />
            <InputNew
              disabled
              iconBeforeFild={<>₹</>}
              {...register(`course_info.${index}.course_fee`, {
                valueAsNumber: true,
              })}
            />
          </span>
        </div>
      </HandleSuspence>
    </li>
  );
}

export default ChooseCourse;
