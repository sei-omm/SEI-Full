"use client";

import React, { useEffect, useRef, useState } from "react";
import ChooseFileInput from "../ChooseFileInput";
import Button from "../Button";
import Input from "../Input";
import DropDown from "../DropDown";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { useQuery } from "react-query";
import { ICourse, ISuccess, OptionsType } from "@/types";
import HandleSuspence from "../HandleSuspence";
import { getFileName } from "@/app/utils/getFileName";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { AiOutlineDelete } from "react-icons/ai";
import { useRouter } from "next/navigation";
import DeleteCourseBtn from "./DeleteCourseBtn";
import TagInput from "../TagInput";
// import { upload } from "@vercel/blob/client";

interface IProps {
  slug: "add-course" | number;
}

type TMarketingTeam = {
  employee_id: number;
  name: string;
};

async function fetchDate(url: string) {
  const response = await axios.get(url);
  return response.data;
}
export default function CourseForm({ slug }: IProps) {
  const isNewCourse = slug === "add-course";
  const route = useRouter();

  const [scheduleInputVisibility, setScheduleInputVisibility] = useState(false);
  const whichBtnClicked = useRef<"add-update" | "delete">("add-update");
  const formRef = useRef<HTMLFormElement>(null);

  //mute the server
  const { mutate, isLoading } = useDoMutation();

  //get response form server
  const { isLoading: isQuerying, data: course } = useQuery<ISuccess<ICourse>>(
    "get-course-with-id",
    () => fetchDate(`${BASE_API}/course/${slug}`),
    {
      enabled: !isNewCourse,
      refetchOnMount: true,
      cacheTime: 0,
    }
  );

  const { data: marketingTeam } = useQuery<ISuccess<TMarketingTeam[]>>({
    queryKey: "get-marketing-team",
    queryFn: async () =>
      (await axios.get(BASE_API + "/employee/marketing-team")).data,
  });

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

  const handleCourseVisibilityDropdown = (item: OptionsType) => {
    if (item.value === "Schedule") return setScheduleInputVisibility(true);
    setScheduleInputVisibility(false);
  };

  const handleFilePicked = async () => {
    if(!confirm("Are you sure ?")) return;

    // const blob = await upload(`myfolder/${file.name}`, file, {
    //   access: "public",
    //   handleUploadUrl: "http://192.168.0.192:8081/api/v1/student/upload", // Endpoint on your server
    //   clientPayload: JSON.stringify({ size: file.size }),
    // });
  };

  useEffect(() => {
    handleCourseVisibilityDropdown({
      text: course?.data.course_visibility || "",
      value: course?.data.course_visibility || "",
    });
  }, [course]);

  return (
    <HandleSuspence isLoading={isQuerying}>
      <form ref={formRef} onSubmit={handleFormSubmit}>
        <div className="flex items-start flex-wrap *:basis-80 *:flex-grow gap-x-3 gap-y-4">
          <Input
            disabled={course?.data.course_code ? true : false}
            defaultValue={course?.data.course_code}
            name="course_code"
            placeholder="HV(OP)"
            label="Course Code"
          />
          <Input
            required
            name="course_name"
            placeholder="HIGH VOLTAGE (Operation level)"
            label="Course Name *"
            defaultValue={course?.data.course_name}
          />

          <DropDown
            key="institute"
            name="institute"
            label="Institute *"
            options={[
              { text: "Kolkata", value: "Kolkata" },
              { text: "Faridabad", value: "Faridabad" },
            ]}
            defaultValue={course?.data.institute}
          />
          <DropDown
            key="course_type"
            name="course_type"
            label="Course Type *"
            options={[
              { text: "DGS Approved", value: "DGS Approved" },
              { text: "Value Added", value: "Value Added" },
            ]}
            defaultValue={course?.data.course_type}
          />
          <TagInput
            required
            name="require_documents"
            wrapperCss="!basis-[50rem]"
            label="Require Documents *"
            placeholder="Enter required documents and press enter"
            defaultValue={course?.data.require_documents}
          />
          <TagInput
            required
            name="subjects"
            wrapperCss="!basis-[50rem]"
            label="Subjects *"
            placeholder="Enter Subjects and press enter"
            defaultValue={course?.data.subjects}
          />
          <Input
            required
            name="course_duration"
            label="Course Duration *"
            placeholder="3 days"
            defaultValue={course?.data.course_duration}
          />
          <Input
            required
            name="course_fee"
            label="Course Fee *"
            type="number"
            placeholder="2800"
            defaultValue={course?.data.course_fee}
          />
          <Input
            name="min_pay_percentage"
            label="Minimum To Pay In Percentage"
            type="number"
            placeholder="100"
            defaultValue={course?.data.min_pay_percentage || 100}
          />
          <Input
            required
            name="total_seats"
            label="Total Seats *"
            type="number"
            placeholder="10"
            defaultValue={course?.data.total_seats}
          />
          <Input
            required
            name="remain_seats"
            label="Remain Seats *"
            type="number"
            placeholder="10"
            defaultValue={course?.data.remain_seats}
          />

          <DropDown
            label="Course Visibility *"
            name="course_visibility"
            options={[
              { text: "Public", value: "Public" },
              { text: "Private", value: "Private" },
              // { text: "Schedule", value: "Schedule" },
            ]}
            onChange={handleCourseVisibilityDropdown}
            defaultValue={course?.data.course_visibility}
          />

          {scheduleInputVisibility ? (
            <Input
              required
              name="course_update_time"
              label="Schedule Time"
              type="datetime-local"
              defaultValue={new Date(
                course?.data.course_update_time || Date.now()
              )
                .toISOString()
                .slice(0, 16)}
            />
          ) : null}

          <DropDown
            label="Concern Marketing Executive *"
            name="concern_marketing_executive_id"
            options={
              marketingTeam?.data.map((item) => ({
                text: item.name,
                value: item.employee_id,
              })) || []
            }
          />

          <Input
            label="Course Showing Order"
            name="course_showing_order"
            placeholder="1"
            defaultValue={course?.data.course_showing_order}
          />

          <ChooseFileInput
            onFilePicked={handleFilePicked}
            accept=".pdf"
            fileName={getFileName(course?.data.course_pdf) || "Choose Your Pdf"}
            key="choose_pdf"
            id="choose_pdf"
            label="Upload Course Module"
            name="course_pdf"
            viewLink={
              course?.data.course_pdf
                ? BASE_API + "/" + course?.data.course_pdf
                : undefined
            }
          />
        </div>
        <div className="flex items-center gap-5 mt-5">
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
