import { BASE_API } from "@/app/constant";
import Button from "@/components/Button";
import CourseListItem from "@/components/CourseListItem";
import DropDown from "@/components/DropDown";
import { ICourse, ISuccess } from "@/types";
import Link from "next/link";
import React from "react";
import { IoIosAdd } from "react-icons/io";

interface IProps {
  searchParams: {
    institute?: string;
  };
}

export default async function page({ searchParams }: IProps) {
  const institute = searchParams.institute;
  const response = await fetch(
    `${BASE_API}/course/with-batches${institute ? `?center=${institute}` : "?center=Kolkata"}`,
    {
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzA0NTYwMTl9.NCC5Jo3AyoOlR6VP8WTZgnI2uyTBTq4EzO_1IaRF23Y`,
      },
      cache: "no-store",
    }
  );
  const courses = (await response.json()) as ISuccess<ICourse[]>;

  return (
    <div>
      <section className="space-y-5 px-5 py-5">
        {/* course action buttons */}
        <div className="w-full flex items-center justify-between gap-x-5">
          {/* <Input wrapperCss="w-96" placeholder="Search Course.." /> */}
          <DropDown
            key={"institute"}
            label=""
            name="institute"
            options={[
              { text: "Kolkata", value: "Kolkata" },
              { text: "Faridabad", value: "Faridabad" },
            ]}
            changeSearchParamsOnChange = {true}
          />
          <Link href={"manage-course/add-course"}>
            <Button className="flex-center gap-x-2">
              <IoIosAdd size={23} />
              Add New Course
            </Button>
          </Link>
        </div>

        {courses.data.length === 0 ? (
          <h2 className="text-center font-semibold text-gray-600">
            No Course Avilable
          </h2>
        ) : (
          <ul className="w-full grid grid-cols-1 gap-6">
            {courses.data.map((item) => (
              <CourseListItem key={item.course_id} course={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
