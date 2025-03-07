"use client";

import Button from "@/components/Button";
import { useRef } from "react";
import PaymentInfoLayout from "@/components/Admission/PaymentInfoLayout";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { ISuccess, StudentForm, TOneAdmission } from "@/types";
import HandleSuspence from "@/components/HandleSuspence";
import { FaRegSave } from "react-icons/fa";
import { useDoMutation } from "@/app/utils/useDoMutation";
import AppliedCourseListItem from "@/components/Course/AppliedCourseListItem";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useRouter, useSearchParams } from "next/navigation";
import { IoMdArrowBack } from "react-icons/io";
import StudentInputForm from "@/components/Admission/StudentInputForm";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentFormSchema } from "@/FormSchema";
import DropDownNew from "@/components/FormInputs/DropDownNew";

async function fetchData(url: string) {
  return (await axios.get(url)).data;
}

export default function ManageStudentAdmissionForm() {
  const { mutate } = useDoMutation();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const route = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    clearErrors,
    reset,
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
      
      name : "",
      email : "",
      mobile_number : "",
      indos_number : "",
      permanent_address : "",
      present_address : "",
      cdc_num : "",
      passport_num : "",
      coc_number : "",
      cert_of_completency : "",
      blood_group : "",
      next_of_kin_name : "",
      relation_to_sel : "",
      emergency_number : "",
      number_of_the_cert : "",
      issued_by_institute : "",
      issued_by_institute_indos_number : ""
    },
  });

  const { data, isFetching, error } = useQuery<ISuccess<TOneAdmission>>({
    queryKey: "fetch-admission-details",
    queryFn: () =>
      fetchData(`${BASE_API}/admission?form-id=${searchParams.get("form-id")}`),

    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    onSuccess(data) {
      reset(data.data.course_and_student_info as any);
    },
  });

  const handleFormSubmit = (formData: StudentForm) => {
    delete (formData as any).password;
    delete (formData as any).institute;

    mutate({
      apiPath: "/admission/save",
      method: "put",
      formData: {
        ...formData,
        student_id: searchParams.get("student-id"),
        form_id: data?.data.course_and_student_info.form_id,
      },
      onSuccess() {
        route.back();
      },
    });
  };

  return (
    <div className="w-full main-layout space-y-4">
      <h2 className="text-2xl font-semibold">Course Form</h2>

      <HandleSuspence isLoading={isFetching} dataLength={1} error={error}>
        <form
          ref={formRef}
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          {/* Courses Enrolled */}
          <div className="p-10 border card-shdow rounded-3xl space-y-3">
            <h2 className="text-2xl font-semibold">Courses Applied for</h2>

            <ul className="w-full space-y-10">
              {data?.data.course_and_student_info.enrolled_courses_info?.map(
                (item) => (
                  <AppliedCourseListItem
                    student_course_info={
                      data?.data.course_and_student_info.enrolled_courses_info
                    }
                    paymentsInfo={data?.data.student_payment_info}
                    key={item.enroll_id}
                    enroll_course_info={item}
                    course_batches={
                      data.data.course_batches.find(
                        (cItem) => cItem.course_id === item.course_id
                      )?.batches
                    }
                  />
                )
              )}
            </ul>
          </div>

          <StudentInputForm
            student_info={data?.data.course_and_student_info}
            form_type="manage-admission"
            control={control}
            clearErrors={clearErrors}
            errors={errors}
            register={register}
            setValue={setValue}
          />

          {/* Student Documentation */}
          <div className="p-10 border card-shdow rounded-3xl space-y-3">
            <h2 className="text-2xl font-semibold">Upload Student Document</h2>

            <Button
              onClick={() => {
                dispatch(
                  setDialog({
                    type: "OPEN",
                    dialogId: "upload-document-dialog",
                    extraValue: {
                      courseIds:
                        data?.data.course_and_student_info.enrolled_courses_info
                          .map((item) => item.course_id)
                          .join(","),
                      studentId: data?.data.course_and_student_info.student_id,
                    },
                  })
                );
              }}
              type="button"
            >
              Manage Student Documents
            </Button>
          </div>

          {/* Payment Info */}
          <PaymentInfoLayout
            paymentsInfo={data?.data.student_payment_info}
            form_id={searchParams.get("form-id") || ""}
            student_id={parseInt(searchParams.get("student-id") || "0")}
            student_course_info={
              data?.data.course_and_student_info.enrolled_courses_info
            }
          />

          <div className="p-10 border card-shdow rounded-3xl space-y-3">
            <h2 className="text-2xl font-semibold">Form Status *</h2>
            <Controller
              name="form_status"
              control={control}
              render={({ field }) => (
                <DropDownNew
                  {...register("form_status")}
                  label=""
                  options={[
                    { text: "Approve", value: "Approve" },
                    { text: "Cancel", value: "Cancel" },
                    { text: "Pending", value: "Pending" },
                  ]}
                  defaultValue={field.value}
                  onChange={(option) => {
                    setValue("form_status", option.value);
                    clearErrors("form_status");
                  }}
                  error={errors.form_status?.message as string}
                />
              )}
            />
          </div>
        </form>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            onClick={() => {
              route.back();
            }}
            className="flex items-center gap-2"
          >
            <IoMdArrowBack />
            Back
          </Button>
          <Button
            onClick={() => {
              formRef.current?.requestSubmit();
            }}
            type="button"
            className="!border !bg-foreground !text-background flex-center gap-3"
          >
            <FaRegSave />
            Save Data
          </Button>
        </div>
      </HandleSuspence>
    </div>
  );
}
