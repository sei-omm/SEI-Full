"use client";

import { useQuery } from "react-query";
import Button from "../Button";
import DropDown from "../DropDown";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { useState } from "react";
import { ISuccess, TCourseDropDown } from "@/types";
import HandleDataSuspense from "../HandleDataSuspense";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function CourseWithBatchFilter() {
  const route = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [currentBatches, setCurrentBatches] = useState<string[]>([]);
  const [currentBatchDate, setCurrentBatchDate] = useState<string>("");
  const [institute, setInstitute] = useState(
    searchParams.get("institute") || "Kolkata"
  );

  const {
    data: courses,
    isFetching,
    error,
  } = useQuery<ISuccess<TCourseDropDown[]>>({
    queryKey: ["get-courses-dropdown", institute],
    queryFn: async () =>
      (await axios.get(`${BASE_API}/course/drop-down?institute=${institute}`))
        .data,
    onSuccess(data) {
      const batchesInfo = data.data.find(
        (fItem) =>
          fItem.course_id == parseInt(searchParams.get("course_id") || data.data[0].course_id.toString())
      )?.course_batches || [];
      setCurrentBatches(batchesInfo);
      setCurrentBatchDate(searchParams.get("batch_date") || batchesInfo[0]);
    },
    refetchOnMount: true,
  });

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const urlSearchParams = new URLSearchParams();
    formData.forEach((value, key) => {
      urlSearchParams.set(key, value.toString());
    });
    route.push(`${pathname}?${urlSearchParams.toString()}`);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="w-full flex items-end justify-between *:flex-grow gap-x-5 pb-5"
    >
      <DropDown
        onChange={(item) => setInstitute(item.value)}
        key={"institute"}
        name="institute"
        label="Institute"
        options={[
          { text: "Kolkata", value: "Kolkata" },
          { text: "Faridabad", value: "Faridabad" },
        ]}
        defaultValue={searchParams.get("institute") || "Kolkata"}
      />
      <DropDown
        key={"course_type"}
        name="course_type"
        label="Course Type"
        options={[
          { text: "DGS Approved", value: "DGS Approved" },
          { text: "Value Added", value: "Value Added" },
        ]}
        defaultValue={searchParams.get("course_type") || "DGS Approved"}
      />

      <HandleDataSuspense isLoading={isFetching} error={error} data={courses}>
        {(course) => (
          <DropDown
            onChange={(item) => {
              const batchesInfo = course.data.find((fItem) => fItem.course_id == item.value)
              ?.course_batches || []
              setCurrentBatchDate(searchParams.get("batch_date") || batchesInfo[0]);
              setCurrentBatches(batchesInfo);
            }}
            key={"course_id"}
            name="course_id"
            label="Courses"
            options={course.data.map((item) => ({
              text: item.course_name,
              value: item.course_id,
            }))}
            defaultValue={
              searchParams.get("course_id") || course.data[0].course_id
            }
          />
        )}
      </HandleDataSuspense>

      <DropDown
        key={"batch_date"}
        name="batch_date"
        label="Select Batch"
        options={currentBatches.map((item) => ({ text: item, value: item }))}
        defaultValue={currentBatchDate}
      />

      <div className="mb-2">
        <Button>Search</Button>
      </div>
    </form>
  );
}
