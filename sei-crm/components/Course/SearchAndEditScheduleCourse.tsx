"use client";

import { useQuery } from "react-query";
import Button from "../Button";
import DropDown from "../DropDown";
import HandleSuspence from "../HandleSuspence";
import { useState } from "react";
import { ICourse, ISuccess, OptionsType } from "@/types";
import { BASE_API } from "@/app/constant";
import axios from "axios";

// interface IPorps {
//   courses: OptionsType[];
// }

export default function SearchAndEditScheduleCourse() {
  const [searchCourseCenter, setSearchCourseCenter] = useState("Kolkata");

    //get courses for dropdown
    const { data : searchCourseData } = useQuery<ISuccess<ICourse[]>>({
      queryKey: ["get-courses", searchCourseCenter],
      queryFn: async () =>
        (await axios.get(`${BASE_API}/course?center=${searchCourseCenter}`)).data,
    });
  
    const coursesList =
      (searchCourseData?.data.map((item) => ({
        text: item.course_name,
        value: item.course_id,
      })) as OptionsType[]) || [];

  return (
    <div className="space-y-5">
      <h2 className="text-xl">Search Courses Schedules</h2>

      <div className="flex items-end flex-wrap gap-5 *:flex-grow *:basis-44">
        <DropDown
          key={"select_institute"}
          onChange={(item) => {
            setSearchCourseCenter(item.value);
          }}
          label="Institute"
          options={[
            { text: "Kolkata", value: "Kolkata" },
            { text: "Faridabad", value: "Faridabad" },
          ]}
        />

        <HandleSuspence isLoading={false}>
          <DropDown
            key={"select_course"}
            name="course_id"
            label="Select Course"
            options={coursesList}
          />
        </HandleSuspence>

        <Button className="max-w-max mb-1">Search</Button>
      </div>
    </div>
  );
}
