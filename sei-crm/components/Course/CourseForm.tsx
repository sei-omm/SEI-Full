"use client";

import React, { useRef } from "react";
import ChooseFileInput from "../ChooseFileInput";
import Button from "../Button";
import Input from "../Input";
import DropDown from "../DropDown";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { useQueries, UseQueryResult } from "react-query";
import { ICourse, ISuccess } from "@/types";
import HandleSuspence from "../HandleSuspence";
import { getFileName } from "@/app/utils/getFileName";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { AiOutlineDelete } from "react-icons/ai";
import { useRouter } from "next/navigation";
import DeleteCourseBtn from "./DeleteCourseBtn";
import TagInput from "../TagInput";
import { IoMdArrowBack } from "react-icons/io";

interface IProps {
  slug: "add-course" | number;
}

type TMarketingTeam = {
  employee_id: number;
  name: string;
};

export default function CourseForm({ slug }: IProps) {
  const isNewCourse = slug === "add-course";
  const route = useRouter();

  const whichBtnClicked = useRef<"add-update" | "delete">("add-update");
  const formRef = useRef<HTMLFormElement>(null);

  //mute the server
  const { mutate, isLoading } = useDoMutation();

  const [marketingTeam, course] = useQueries<
    [
      UseQueryResult<ISuccess<TMarketingTeam[]>>,
      UseQueryResult<ISuccess<ICourse>>
    ]
  >([
    {
      queryKey: "get-marketing-team",
      queryFn: async () =>
        (await axios.get(BASE_API + "/employee/marketing-team")).data,
      refetchOnMount: true,
    },
    {
      queryKey: "get-course-with-id",
      queryFn: async () => (await axios.get(BASE_API + "/course/" + slug)).data,
      refetchOnMount: true,
      enabled : !isNewCourse
    },
  ]);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    if (isNewCourse) {
      if (formData.get("course_showing_order") === "") {
        formData.delete("course_showing_order");
      }
      return mutate({
        formData,
        method: "post",
        apiPath: "/course",
        onSuccess() {
          route.push(
            "/dashboard/course/manage-course?code=" +
              Math.round(Math.random() * 100)
          );
        },
      });
    }

    formData.delete("course_code");
    mutate({
      formData,
      method: "put",
      id: slug,
      apiPath: "/course",
      onSuccess() {
        route.push(
          "/dashboard/course/manage-course?code=" +
            Math.round(Math.random() * 100)
        );
      },
    });
  };

  return (
    <HandleSuspence isLoading={course.isFetching} dataLength={1}>
      <form ref={formRef} onSubmit={handleFormSubmit}>
        <div className="flex items-start flex-wrap *:basis-80 *:flex-grow gap-x-3 gap-y-4">
          <Input
            disabled={course.data?.data.course_code ? true : false}
            defaultValue={course.data?.data.course_code}
            name="course_code"
            placeholder="HV(OP)"
            label="Course Code"
          />
          <Input
            required
            name="course_name"
            placeholder="HIGH VOLTAGE (Operation level)"
            label="Course Name *"
            defaultValue={course.data?.data.course_name}
          />

          <DropDown
            key="institute"
            name="institute"
            label="Institute *"
            options={[
              { text: "Kolkata", value: "Kolkata" },
              { text: "Faridabad", value: "Faridabad" },
            ]}
            defaultValue={course.data?.data.institute}
          />
          <DropDown
            key="course_type"
            name="course_type"
            label="Course Type *"
            options={[
              { text: "DGS Approved", value: "DGS Approved" },
              { text: "Value Added", value: "Value Added" },
            ]}
            defaultValue={course.data?.data.course_type}
          />
          <TagInput
            required
            name="require_documents"
            wrapperCss="!basis-[50rem]"
            label="Require Documents *"
            placeholder="Enter required documents and press enter"
            defaultValue={course.data?.data.require_documents}
          />
          <TagInput
            required
            name="subjects"
            wrapperCss="!basis-[50rem]"
            label="Subjects *"
            placeholder="Enter Subjects and press enter"
            defaultValue={course.data?.data.subjects}
          />
          <Input
            required
            name="course_duration"
            label="Course Duration *"
            placeholder="3 days"
            defaultValue={course.data?.data.course_duration}
          />
          <Input
            required
            name="course_fee"
            label="Course Fee *"
            type="number"
            placeholder="2800"
            defaultValue={course.data?.data.course_fee}
          />
          <Input
            name="min_pay_percentage"
            label="Minimum To Pay In Percentage"
            type="number"
            placeholder="100"
            defaultValue={course.data?.data.min_pay_percentage || 100}
          />
          <Input
            required
            name="total_seats"
            label="Total Seats *"
            type="number"
            placeholder="10"
            defaultValue={course.data?.data.total_seats}
          />
          <Input
            required
            name="remain_seats"
            label="Remain Seats *"
            type="number"
            placeholder="10"
            defaultValue={course.data?.data.remain_seats}
          />

          <DropDown
            label="Course Visibility *"
            name="course_visibility"
            options={[
              { text: "Public", value: "Public" },
              { text: "Private", value: "Private" },
            ]}
            defaultValue={course.data?.data.course_visibility}
          />

          <DropDown
            label="Concern Marketing Executive *"
            name="concern_marketing_executive_id"
            options={
              marketingTeam.data?.data.map((item) => ({
                text: item.name,
                value: item.employee_id,
              })) || []
            }
          />

          <Input
            label="Course Showing Order"
            name="course_showing_order"
            placeholder="1"
            defaultValue={course.data?.data.course_showing_order}
          />

          <Input
            name="max_batch"
            type="number"
            placeholder="Maximum Batch To Be Conducted This Month"
            label="Maximum Batch / Month"
            defaultValue={course.data?.data.max_batch || 0}
          />

          <ChooseFileInput
            accept=".pdf"
            fileName={
              getFileName(course.data?.data.course_pdf) || "Choose Your Pdf"
            }
            key="choose_pdf"
            id="choose_pdf"
            label="Upload Course Module"
            name="course_pdf"
            viewLink={
              course.data?.data.course_pdf
                ? course.data?.data.course_pdf
                : undefined
            }
          />
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
            {isNewCourse ? "Add New Course" : "Update Course Info"}
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
      </form>
    </HandleSuspence>
  );
}
