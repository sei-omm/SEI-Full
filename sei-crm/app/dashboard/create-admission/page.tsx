"use client";

import { useDoMutation } from "@/app/utils/useDoMutation";
import ChooseCoursesListItem from "@/components/Admission/ChooseCoursesListItem";
import StudentInputForm from "@/components/Admission/StudentInputForm";
import Button from "@/components/Button";
import { studentFormSchema } from "@/FormSchema";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { ISuccess, StudentForm } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { GrFormNextLink } from "react-icons/gr";
import { IoAdd } from "react-icons/io5";
import { useDispatch } from "react-redux";

export default function CreateAdmission() {
  const route = useRouter();
  const dispatch = useDispatch();
  const formRef = useRef<HTMLFormElement>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    clearErrors,
    setError,
  } = useForm<StudentForm>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      course_info: [
        {
          batch_id: 0,
          course_id: 0,
          institute: "Kolkata",
          month_year: new Date().toISOString().slice(0, 7),
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "course_info",
    control: control,
  });

  const [paymentMode, setPaymentMode] = useState<"Cash" | "Online">("Cash");

  const { isLoading, mutate } = useDoMutation(
    () => {},
    (error) => {
      const errorKey = error.response?.data.key;
      if (errorKey) {
        setError(errorKey as any, { message: error.response?.data.message });
      } else {
        setError("root", { message: error.response?.data.message });
      }
    }
  );

  const handleFormSubmit = (formData: StudentForm) => {
    // const courseInfo: any[] = [];
    // const formInfo: any = {};
    // let tempObj: any = {};
    // let tempIndex = 1;
    // formData.forEach((value, key) => {
    //   if (key === "course_id" || key === "batch_id") {
    //     tempObj[key] = value;
    //     if (tempIndex === 2) {
    //       courseInfo.push(tempObj);
    //       tempObj = {};
    //       tempIndex = 1;
    //     } else {
    //       tempIndex++;
    //     }
    //   } else {
    //     formInfo[key] = value;
    //   }
    // });
    // const payment_type = formInfo.payment_type;
    // const payment_mode = formData.payment_mode;
    const payment_type = formData.payment_type;
    const payment_mode = formData.payment_mode;
    delete (formData as any).payment_type;
    delete (formData as any).payment_mode;
    mutate({
      apiPath: "/admission/create",
      method: "post",
      formData,
      onSuccess(data) {
        const response = data as ISuccess<{
          form_id: string;
          student_id: number;
        }>;
        if (payment_mode === "Cash") {
          return route.replace(
            `/dashboard/admission/manage-form?form-id=${response.data.form_id}&student-id=${response.data.student_id}`
          );
        }
        dispatch(
          setDialog({
            dialogId: "generate-payment-link-dialog",
            type: "OPEN",
            extraValue: {
              student_id: response.data.student_id,
              // batch_ids: courseInfo.map((item) => item.batch_id).join(","),
              batch_ids: formData?.course_info?.map((item) => item.batch_id).join(","),
              payment_type,
              form_id: response.data.form_id,
            },
          })
        );
      },
    });
  };

  return (
    <div className="w-full main-layout space-y-4">
      <h2 className="text-2xl font-semibold">Create Admission</h2>

      <form
        ref={formRef}
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        {/* Choose Courses */}
        <div className="p-10 border card-shdow rounded-3xl space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              Choose Course And Batch Date
            </h2>
            <Button
              onClick={() =>
                append({
                  batch_id: 0,
                  course_id: 0,
                  institute: "Kolkata",
                  month_year: new Date().toISOString().slice(0, 7),
                })
              }
              type="button"
              className="flex items-center gap-4"
            >
              <IoAdd size={20} />
              Assign Course
            </Button>
          </div>

          {/* <ul className="space-y-5">
            {list.map((item, index) => (
              <ChooseCoursesListItem
                key={item}
                index={index}
                list={item}

                removeAssignCourse={removeAssignCourse}
                clearErrors={clearErrors}
                control={control}
                errors={errors}
                register={register}
                setValue={setValue}

                append={append}
                remove={remove}
              />
            ))}
          </ul> */}

          <ul className="space-y-5">
            {fields.map((fild, index) => (
              <ChooseCoursesListItem
                // key={fild.id}
                key={fild.id}
                index={index}
                clearErrors={clearErrors}
                control={control}
                errors={errors}
                register={register}
                setValue={setValue}
                remove={remove}
              />
            ))}
          </ul>
        </div>

        <StudentInputForm
          register={register}
          control={control}
          errors={errors}
          setValue={setValue}
          clearErrors={clearErrors}
          form_type="create-admission"
        />

        <div className="p-10 border card-shdow rounded-3xl space-y-5">
          <h2 className="text-2xl font-semibold">Payment Mode</h2>
          <div className="*:*:cursor-pointer space-x-5">
            <span className="space-x-2">
              <input
                {...register("payment_mode")}
                onChange={() => {
                  setPaymentMode("Cash");
                }}
                defaultChecked
                type="radio"
                id="case"
                // name="payment_mode"
                value="Cash"
              />
              <label htmlFor="Cash" className="font-semibold">
                Cash
              </label>
            </span>

            <span className="space-x-2">
              <input
                {...register("payment_mode")}
                onChange={() => {
                  setPaymentMode("Online");
                }}
                type="radio"
                id="online"
                // name="payment_mode"
                value="Online"
              />
              <label htmlFor="online" className="font-semibold">
                Online
              </label>
            </span>
          </div>
        </div>

        {paymentMode === "Cash" ? null : (
          <div className="p-10 border card-shdow rounded-3xl space-y-5">
            <h2 className="text-2xl font-semibold">Payment Type</h2>
            <div className="*:*:cursor-pointer space-x-5">
              <span className="space-x-2">
                <input
                  {...register("payment_type")}
                  defaultChecked
                  type="radio"
                  id="part-payment"
                  value="Part-Payment"
                />
                <label htmlFor="part-payment" className="font-semibold">
                  Part-Payment
                </label>
              </span>

              <span className="space-x-2">
                <input
                  {...register("payment_type")}
                  type="radio"
                  id="full-payment"
                  value="Full-Payment"
                />
                <label htmlFor="full-payment" className="font-semibold">
                  Full-Payment
                </label>
              </span>
            </div>
          </div>
        )}

        {errors.root ? (
          <span className="text-xs text-red-600 font-medium tracking-wider pl-1">
            {errors.root.message}
          </span>
        ) : null}

        <Button
          onClick={() => {
            formRef.current?.requestSubmit();
          }}
          type="submit"
          loading={isLoading}
          disabled={isLoading}
          className="flex items-center gap-3"
        >
          Save & Continue
          <GrFormNextLink size={18} />
        </Button>
      </form>
    </div>
  );
}
