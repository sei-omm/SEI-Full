"use client";

import React, { useRef } from "react";
import Button from "../Button";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { useQueries, UseQueryResult } from "react-query";
import { ICourse, ISuccess } from "@/types";
import HandleSuspence from "../HandleSuspence";
import { getFileName } from "@/app/utils/getFileName";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { AiOutlineDelete, AiOutlinePercentage } from "react-icons/ai";
import { useRouter } from "next/navigation";
import DeleteCourseBtn from "./DeleteCourseBtn";
import { IoMdArrowBack } from "react-icons/io";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface IProps {
  slug: "add-course" | number;
}

type TMarketingTeam = {
  employee_id: number;
  name: string;
};

import { z } from "zod";
import DropDownNew from "../FormInputs/DropDownNew";
import InputNew from "../FormInputs/InputNew";
import ChooseFileInputNew from "../FormInputs/ChooseFileInputNew";
import TagInputNew from "../FormInputs/TagInputNew";

const formSchema = z.object({
  course_code: z.string().min(1, { message: "Course Code Is Required" }),
  course_name: z.string().min(1, "Course Name Is Required"),
  institute: z.string().min(1, "Institute Is Required"),
  course_type: z.string().min(1, "Course Type Is Required"),
  category: z.string().min(1, "Choose Course Category"),
  require_documents: z.string().min(1, "Course Documents Is Required"),
  subjects: z.string().min(1, "Subject Is Required"),
  course_duration: z.string().min(1, "Course Duration Is Required"),

  course_fee: z
    .number({ message: "Input Must Be A Number" })
    .min(1, "Course Fee Is Required"),
  min_pay_percentage: z
    .number({
      message: "Please enter a valid percentage value between 1 and 100.",
    })
    .min(1, "Please enter a valid percentage value between 1 and 100.")
    .max(100, "Please enter a valid percentage value between 1 and 100."),
  total_seats: z
    .number({ message: "Input Must Be A Number" })
    .min(1, "Total Seats Is Required"),
  remain_seats: z
    .number({ message: "Input Must Be A Number" })
    .min(1, "Remain Seats Is Required"),
  course_visibility: z.string().min(1, "Choose Course Visibility"),

  concern_marketing_executive_id: z
    .number({ message: "Choose Current Marketing Executive" })
    .min(1, "Choose Current Marketing Executive"),
  course_showing_order: z
    .number({ message: "Input Must Be A Number" })
    .min(1, "Add In Which Position Course Will Show"),

  max_batch: z
    .number({ message: "Input Must Be A Number" })
    .min(1, "Add Max Batch Per Batch"),
  course_pdf: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CourseForm({ slug }: IProps) {
  const isNewCourse = slug === "add-course";
  const route = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
    setError,
    control,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const whichBtnClicked = useRef<"add-update" | "delete">("add-update");
  const formRef = useRef<HTMLFormElement>(null);

  //mute the server
  const { mutate, isLoading } = useDoMutation(
    () => {},
    (error) => {
      const errorKey: any = error.response?.data.key;
      if (errorKey) {
        setError(errorKey, { message: error.response?.data.message });
        return;
      }
      setError("root", { message: error.response?.data.message });
    },
    true
  );

  const [marketingTeam, course] = useQueries<
    [
      UseQueryResult<ISuccess<TMarketingTeam[]>>,
      UseQueryResult<ISuccess<ICourse>>
    ]
  >([
    {
      queryKey: ["get-marketing-team", watch("institute")],
      queryFn: async () =>
        (
          await axios.get(
            BASE_API +
              "/employee/marketing-team?institute=" +
              watch("institute") || "Kolkata"
          )
        ).data,
      refetchOnMount: true,
    },
    {
      queryKey: "get-course-with-id",
      queryFn: async () => (await axios.get(BASE_API + "/course/" + slug)).data,
      refetchOnMount: true,
      enabled: !isNewCourse,
      onSettled(data: any) {
        const finalData = data as ISuccess<ICourse>;

        const cleanedData = Object.fromEntries(
          Object.entries(finalData.data).map(([key, value]) => [
            key,
            value ?? "",
          ])
        );

        reset(cleanedData); // Set cleaned data
      },
    },
  ]);

  const handleFormSubmit = (formData: FormValues) => {
    if (isNewCourse) {
      // if (formData.get("course_showing_order") === "") {
      //   formData.delete("course_showing_order");
      // }

      return mutate({
        formData,
        method: "post",
        apiPath: "/course",
        onSuccess() {
          route.push(
            `/dashboard/course/manage-course?institute=${
              formData.institute
            }&code=${Math.round(Math.random() * 100)}`
          );
        },
      });
    }

    delete (formData as any).course_code;
    mutate({
      formData,
      method: "put",
      id: slug,
      apiPath: "/course",
      onSuccess() {
        route.push(
          `/dashboard/course/manage-course?institute=${
            formData.institute
          }&code=${Math.round(Math.random() * 100)}`
        );
      },
    });
  };

  return (
    <HandleSuspence key={slug} isLoading={course.isFetching} dataLength={1}>
      <form ref={formRef} onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="flex items-start flex-wrap *:basis-80 *:flex-grow gap-x-3 gap-y-4">
          <InputNew
            disabled={
              isNewCourse ? false : course.data?.data.course_code ? true : false
            }
            placeholder="HV(OP)"
            label="Course Code *"
            {...register("course_code")}
            error={errors.course_code?.message}
          />
          <InputNew
            placeholder="HIGH VOLTAGE (Operation level)"
            label="Course Name *"
            // defaultValue={isNewCourse ? "" : course.data?.data.course_name}
            {...register("course_name")}
            error={errors.course_name?.message}
          />

          <Controller
            name="institute"
            control={control}
            render={({ field }) => (
              <DropDownNew
                {...register("institute")}
                key="institute"
                label="Campus *"
                options={[
                  { text: "Kolkata", value: "Kolkata" },
                  { text: "Faridabad", value: "Faridabad" },
                ]}
                onChange={(option) => {
                  setValue("institute", option.value);
                  clearErrors("institute");
                }}
                error={errors.institute?.message}
                defaultValue={field.value}
              />
            )}
          />

          <Controller
            name="course_type"
            control={control}
            render={({ field }) => (
              <DropDownNew
                {...register("course_type")}
                key="course_type"
                label="Course Type *"
                options={[
                  { text: "DGS Approved", value: "DGS Approved" },
                  { text: "Value Added", value: "Value Added" },
                ]}
                onChange={(option) => {
                  setValue("course_type", option.value);
                  clearErrors("course_type");
                }}
                error={errors.course_type?.message}
                defaultValue={field.value}
              />
            )}
          />

          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <DropDownNew
                {...register("category")}
                key="category"
                label="Category *"
                options={[
                  { text: "COMPETENCY COURSES", value: "competency-courses" },
                  { text: "SIMULATOR COURSES", value: "simulator-courses" },
                  {
                    text: "ADVANCED MODULAR COURSES",
                    value: "advanced-modular-courses",
                  },
                  {
                    text: "BASIC MODULAR COURSES",
                    value: "basic-modular-courses",
                  },
                  { text: "REFRESHER COURSES", value: "refresher-courses" },
                  { text: "PACKAGED COURSES", value: "packaged-courses" },
                ]}
                onChange={(option) => {
                  setValue("category", option.value);
                  clearErrors("category");
                }}
                error={errors.category?.message}
                defaultValue={field.value}
              />
            )}
          />

          <Controller
            name="require_documents"
            control={control}
            render={({ field }) => (
              <TagInputNew
                key="require_documents"
                wrapperCss="!basis-[50rem]"
                label="Enter  documents and press enter *"
                placeholder="Enter  documents and press enter"
                error={errors.require_documents?.message}
                defaultValue={field.value}
                onChange={field.onChange} // ✅ Make sure field value updates
              />
            )}
          />

          <Controller
            name="subjects"
            control={control}
            render={({ field }) => (
              <TagInputNew
                key="subjects"
                wrapperCss="!basis-[50rem]"
                label="Subjects *"
                placeholder="Enter Subjects and press enter"
                error={errors.subjects?.message}
                defaultValue={field.value}
                onChange={field.onChange} // ✅ Make sure field value updates
              />
            )}
          />

          <InputNew
            label="Course Duration *"
            placeholder="3 days"
            // defaultValue={isNewCourse ? "" : course.data?.data.course_duration}
            {...register("course_duration")}
            error={errors.course_duration?.message}
          />
          <InputNew
            {...register("course_fee", { valueAsNumber: true })}
            label="Course Fee *"
            // type="number"
            placeholder="2800"
            // defaultValue={isNewCourse ? 0 : course.data?.data.course_fee}
            error={errors.course_fee?.message}
          />
          <InputNew
            label={`Minimum To Pay In Percentage * (₹${
              (watch("min_pay_percentage") / 100) * watch("course_fee")
            })`}
            // type="number"
            placeholder="100"
            // defaultValue={
            //   isNewCourse ? 0 : course.data?.data.min_pay_percentage || 100
            // }
            iconBeforeFild={<AiOutlinePercentage />}
            {...register("min_pay_percentage", { valueAsNumber: true })}
            error={errors.min_pay_percentage?.message}
          />
          <InputNew
            label="Total Seats *"
            // type="number"
            placeholder="10"
            // defaultValue={isNewCourse ? 0 : course.data?.data.total_seats}
            {...register("total_seats", { valueAsNumber: true })}
            error={errors.total_seats?.message}
          />
          <InputNew
            label="Remain Seats *"
            // type="number"
            placeholder="10"
            // defaultValue={isNewCourse ? 0 : course.data?.data.remain_seats}
            {...register("remain_seats", { valueAsNumber: true })}
            error={errors.remain_seats?.message}
          />

          <Controller
            name="course_visibility"
            control={control}
            render={({ field }) => (
              <DropDownNew
                {...register("course_visibility")}
                label="Course Visibility *"
                options={[
                  { text: "Public", value: "Public" },
                  { text: "Private", value: "Private" },
                ]}
                onChange={(option) => {
                  setValue("course_visibility", option.value);
                  clearErrors("course_visibility");
                }}
                error={errors.course_visibility?.message}
                defaultValue={field.value}
              />
            )}
          />

          <Controller
            name="concern_marketing_executive_id"
            control={control}
            render={({ field }) => (
              <DropDownNew
                {...register("concern_marketing_executive_id")}
                label="Concern Marketing Executive *"
                options={
                  marketingTeam.data?.data.map((item) => ({
                    text: item.name,
                    value: item.employee_id as any,
                  })) || []
                }
                defaultValue={field.value}
                onChange={(option) => {
                  setValue(
                    "concern_marketing_executive_id",
                    parseInt(option.value)
                  );
                  clearErrors("concern_marketing_executive_id");
                }}
                error={errors.concern_marketing_executive_id?.message}
              />
            )}
          />

          <InputNew
            label="Course Showing Order *"
            placeholder="1"
            // defaultValue={
            //   isNewCourse ? 0 : course.data?.data.course_showing_order
            // }
            {...register("course_showing_order", { valueAsNumber: true })}
            error={errors.course_showing_order?.message}
          />

          <InputNew
            // type="number"
            placeholder="Maximum Batch To Be Conducted This Month"
            label="Maximum Batch / Month *"
            // defaultValue={isNewCourse ? 0 : course.data?.data.max_batch || 0}
            {...register("max_batch", { valueAsNumber: true })}
            error={errors.max_batch?.message}
          />

          <Controller
            name="course_pdf"
            control={control}
            render={({ field }) => (
              <ChooseFileInputNew
                accept=".pdf"
                fileName={
                  getFileName(course.data?.data.course_pdf) || "Choose Your Pdf"
                }
                key="choose_pdf"
                id="choose_pdf"
                label="Upload Course Module"
                viewLink={
                  course.data?.data.course_pdf
                    ? course.data?.data.course_pdf
                    : undefined
                }
                error={errors.course_pdf?.message}
                onUploaded={(blob) => {
                  field.onChange(blob.url);
                }}
                onFileDelete={() => {
                  field.onChange("");
                }}
              />
            )}
          />

          {/* <TagInputNew
                key="subjects"
                wrapperCss="!basis-[50rem]"
                label="Subjects *"
                placeholder="Enter Subjects and press enter"
                error={errors.subjects?.message}
                defaultValue={field.value}
                onChange={field.onChange} // ✅ Make sure field value updates
              /> */}
        </div>
        <div className="flex items-center gap-5 mt-5">
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
            type="button"
            onClick={() => {
              whichBtnClicked.current = "add-update";
              formRef.current?.requestSubmit();
            }}
            loading={
              isLoading && whichBtnClicked.current === "add-update"
                ? true
                : false
            }
            disabled={isLoading}
          >
            {isNewCourse ? "Create Course" : "Update Course Info"}
          </Button>
          {/* <Button
            loading={
              isLoading && whichBtnClicked.current === "delete" ? true : false
            }
            disabled={isLoading}
            type="button"
            onClick={handleCourseDeleteBtn}
            className={`${
              isNewCourse ? "hidden" : "flex items-center justify-center gap-2"
            } !bg-[#F44336]`}
          >
            <AiOutlineDelete />
            Delete Course
          </Button> */}
          <div className={`${isNewCourse ? "hidden" : "block"}`}>
            <DeleteCourseBtn id={slug as number}>
              <Button type="button" className="!bg-[#F44336] flex-center gap-2">
                <AiOutlineDelete />
                Delete Course
              </Button>
            </DeleteCourseBtn>
          </div>
        </div>

        {errors.root ? (
          <span className="text-xs text-red-600 font-medium tracking-wider pl-1 inline-block pt-4">
            {errors.root.message}
          </span>
        ) : null}
      </form>
    </HandleSuspence>
  );
}
