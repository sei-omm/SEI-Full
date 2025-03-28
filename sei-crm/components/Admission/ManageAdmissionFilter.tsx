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
import Input from "../Input";
import DateInput from "../DateInput";
import Campus from "../Campus";
import { usePurifyCampus } from "@/hooks/usePurifyCampus";

interface IProps {
  withMoreFilter?: boolean;
}

export default function ManageAdmissionFilter({ withMoreFilter }: IProps) {
  const route = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [currentBatches, setCurrentBatches] = useState<string[]>([]);
  const [currentBatchDate, setCurrentBatchDate] = useState<string>("");
  const { campus, setCampus } = usePurifyCampus(searchParams);
  const [currentMonth, setCurrentMonth] = useState(
    searchParams?.get("month_year") || new Date().toISOString().slice(0, 7)
  );

  const {
    data: courses,
    isFetching,
    error,
  } = useQuery<ISuccess<TCourseDropDown[]>>({
    queryKey: ["get-courses-dropdown", campus, currentMonth],
    queryFn: async () =>
      (
        await axios.get(
          `${BASE_API}/course/drop-down?institute=${campus}&month_year=${currentMonth}`
        )
      ).data,
    onSuccess(data) {
      const batchesInfo =
        data.data.find(
          (fItem) =>
            fItem.course_id ==
            parseInt(
              searchParams?.get("course_id") ||
                data.data[0].course_id.toString()
            )
        )?.course_batches || [];
      setCurrentBatches(batchesInfo);
      setCurrentBatchDate(searchParams?.get("batch_date") || batchesInfo[0]);
    },
    refetchOnMount: true,
  });

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const urlSearchParams = new URLSearchParams();

    if (formData.has("form_1")) {
      formData.delete("form_1");

      formData.forEach((value, key) => {
        if (value !== "" && urlSearchParams.size === 0) {
          urlSearchParams.set(key, value.toString());
        }
      });
    }

    if (formData.has("form_2")) {
      formData.delete("form_2");
      // formData.delete("month_year");

      formData.forEach((value, key) => {
        urlSearchParams.set(key, value.toString());
      });
    }

    route.push(`${pathname}?${urlSearchParams.toString()}`);
  };

  function handleMonthChange(value: string) {
    setCurrentMonth(value);
  }

  return (
    <div className="space-y-2">
      {withMoreFilter ? (
        <>
          <form
            onSubmit={handleFormSubmit}
            className="w-full flex items-end justify-between *:flex-grow gap-x-5 pb-5"
          >
            <input name="form_1" hidden />
            <Input name="form_id" label="Form ID" placeholder="Type here.." />
            <span className="text-xs">OR</span>
            <Input
              name="indos_number"
              label="INDOS No."
              placeholder="Type here.."
            />
            <span className="text-xs">OR</span>
            <Input name="cdc_num" label="CDC No." placeholder="Type here.." />
            <span className="text-xs">OR</span>
            <Input
              name="passport_num"
              label="Passport No."
              placeholder="Type here.."
            />
            <div className="mb-2">
              <Button>Search</Button>
            </div>
          </form>
          <span className="font-semibold">OR</span>
        </>
      ) : null}

      <form onSubmit={handleFormSubmit} className="w-full">
        <input name="form_2" hidden />
        <div className="flex items-end justify-between flex-wrap gap-4 *:flex-grow gap-x-5 pb-5">
          <Campus onChange={(item) => setCampus(item.value)} />
          <DropDown
            key={"course_type"}
            name="course_type"
            label="Course Type"
            options={[
              { text: "DGS Approved", value: "DGS Approved" },
              { text: "Value Added", value: "Value Added" },
            ]}
            defaultValue={searchParams?.get("course_type") || "DGS Approved"}
          />
          <HandleDataSuspense
            isLoading={isFetching}
            error={error}
            data={courses}
          >
            {(course) => (
              <DropDown
                onChange={(item) => {
                  const batchesInfo =
                    course.data.find((fItem) => fItem.course_id == item.value)
                      ?.course_batches || [];
                  setCurrentBatchDate(
                    searchParams?.get("batch_date") || batchesInfo[0]
                  );
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
                  searchParams?.get("course_id") || course.data[0]?.course_id
                }
              />
            )}
          </HandleDataSuspense>
          <DateInput
            name="month_year"
            onChange={handleMonthChange}
            type="month"
            label="Choose Month & Year"
            date={currentMonth}
          />
          <DropDown
            key={"batch_date"}
            name="batch_date"
            label="Select Batch"
            options={currentBatches.map((item) => ({
              text: item,
              value: item,
            }))}
            defaultValue={currentBatchDate}
          />
        </div>

        <div className="mb-2">
          <Button>Search</Button>
        </div>
      </form>
    </div>
  );
}
