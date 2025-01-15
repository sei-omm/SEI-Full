"use client";

import { BASE_API } from "@/app/constant";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Button from "@/components/Button";
import SearchAndEditScheduleCourse from "@/components/Course/SearchAndEditScheduleCourse";
import DateInput from "@/components/DateInput";
import DropDown from "@/components/DropDown";
import HandleSuspence from "@/components/HandleSuspence";
import { ICourse, ISuccess, OptionsType } from "@/types";
import axios from "axios";
import { useRef, useState } from "react";
import { useQuery } from "react-query";

export default function ScheduleCourse() {
  const [courseCenter, setCourseCenter] = useState("Kolkata");
  const isNewBatch = useRef(true);

  const { mutate, isLoading: isMutating } = useDoMutation();

  //get courses for dropdown
  const { data, isFetching } = useQuery<ISuccess<ICourse[]>>({
    queryKey: ["get-courses", courseCenter],
    queryFn: async () =>
      (await axios.get(`${BASE_API}/course?center=${courseCenter}`)).data,
  });

  const coursesList =
    (data?.data.map((item) => ({
      text: item.course_name,
      value: item.course_id,
    })) as OptionsType[]) || [];

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (isNewBatch) {
      mutate({
        apiPath: "/course/schedule",
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        formData,
      });

      return;
    }
  };

  return (
    <div className="space-y-7">
      <form className="space-y-4" onSubmit={handleFormSubmit}>
        <div className="flex items-center flex-wrap gap-5 *:flex-grow *:basis-44">
          <DropDown
            onChange={(item) => setCourseCenter(item.value)}
            label="Campus"
            options={[
              { text: "Kolkata", value: "Kolkata" },
              { text: "Faridabad", value: "Faridabad" },
            ]}
          />

          <HandleSuspence isLoading={isFetching}>
            <DropDown
              name="course_id"
              label="Select Course"
              options={coursesList}
            />
          </HandleSuspence>

          <DateInput required name="start_date" label="Add Start Date" />
          <DateInput required name="end_date" label="Add End Date" />

          <DropDown
            label="Visibility"
            name="visibility"
            options={[
              { text: "Public", value: "Public" },
              { text: "Private", value: "Private" },
            ]}
          />
        </div>
        <div className="space-x-2">
          <Button loading={isMutating} disabled={isMutating}>
            Add
          </Button>
          <Button loading={isMutating} disabled={isMutating}>
            Update
          </Button>
        </div>
      </form>

      <SearchAndEditScheduleCourse />
    </div>
  );
}
