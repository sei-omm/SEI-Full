"use client";

import { BASE_API } from "@/app/constant";
import Button from "@/components/Button";
import Campus from "@/components/Campus";
import CourseListItem from "@/components/CourseListItem";
import HandleSuspence from "@/components/HandleSuspence";
import Pagination from "@/components/Pagination";
import { usePurifySearchParams } from "@/hooks/usePurifySearchParams";
import { ICourse, ISuccess } from "@/types";
import axios from "axios";
import Link from "next/link";
import React from "react";
import { IoIosAdd } from "react-icons/io";
import { useQuery } from "react-query";

async function getCourseList(searchParams: URLSearchParams) {
  searchParams.delete("code");
  return (
    await axios.get(
      `${BASE_API}/course/with-batches?${searchParams.toString()}`
    )
  ).data;
}

export default async function CourseList() {
  const searchParams = usePurifySearchParams();

  const {
    data: courses,
    isFetching,
    error,
  } = useQuery<ISuccess<ICourse[]>>({
    queryKey: ["get-course-list", searchParams.toString()],
    queryFn: () => getCourseList(searchParams),
  });

  return (
    <div>
      <section className="space-y-5 px-5 py-5">
        {/* course action buttons */}
        <div className="w-full flex items-center justify-between gap-x-5">
          <Campus changeSearchParamsOnChange defaultValue={searchParams.get("institute")}/>
          <Link href={"manage-course/add-course"}>
            <Button className="flex-center gap-x-2">
              <IoIosAdd size={23} />
              Add course
            </Button>
          </Link>
        </div>

        <HandleSuspence
          isLoading={isFetching}
          error={error}
          dataLength={courses?.data.length}
          noDataMsg="No Course Avilable"
        >
          <ul className="w-full grid grid-cols-1 gap-6">
            {courses?.data.map((item) => (
              <CourseListItem key={item.course_id} course={item} />
            ))}
          </ul>
        </HandleSuspence>

        <Pagination dataLength={courses?.data.length} />
      </section>
    </div>
  );
}
