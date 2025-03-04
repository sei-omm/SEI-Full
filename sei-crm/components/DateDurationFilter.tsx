"use client";

import React, { useState } from "react";
import DropDown from "./DropDown";
import DateInput from "./DateInput";
import Button from "./Button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Input from "./Input";
import { BASE_API, STUDENT_RANKS } from "@/app/constant";
import { useQuery } from "react-query";
import axios from "axios";
import { ISuccess, TCourseDropDown } from "@/types";
import HandleSuspence from "./HandleSuspence";

interface IProps {
  withMoreFilter?: boolean;
  withStudentRank?: boolean;
  withCourse?: boolean;

  onCampusChange?: (campus : string) => void;

  children?: React.ReactNode;
  fromDateLable?:string;
  toDateLable?:string;
}

export default function DateDurationFilter({
  withMoreFilter,
  withStudentRank,
  withCourse,
  onCampusChange,
  children,
  toDateLable,
  fromDateLable
}: IProps) {
  const searchParams = useSearchParams();
  const route = useRouter();
  const pathname = usePathname();

  const [institute, setInstitute] = useState("Kolkata");

  // const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   const formData = new FormData(event.currentTarget);

  //   const searchParams = new URLSearchParams();
  //   searchParams.set("institute", `${formData.get("institute")}`);
  //   searchParams.set("from_date", `${formData.get("from_date")}`);
  //   searchParams.set("to_date", `${formData.get("to_date")}`);
  //   route.push(`${pathname}?${searchParams.toString()}`);
  // };

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

      formData.forEach((value, key) => {
        urlSearchParams.set(key, value.toString());
      });
    }

    route.push(`${pathname}?${urlSearchParams.toString()}`);
  };

  const { data, isFetching, error } = useQuery<ISuccess<TCourseDropDown[]>>({
    queryKey: ["get-course-for-filter", institute],
    queryFn: async () =>
      (await axios.get(`${BASE_API}/course/drop-down?institute=${institute}`))
        .data,
    enabled: withCourse,
  });

  return (
    <div className="w-full space-y-3">
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

      <form
        onSubmit={handleFormSubmit}
        className="flex items-end gap-5 *:flex-grow flex-wrap"
      >
        <input name="form_2" hidden />
        {withStudentRank ? (
          <DropDown
            key={"student_rank"}
            name="rank"
            label="Student Rank"
            options={STUDENT_RANKS.map((item) => ({ text: item, value: item }))}
            defaultValue={searchParams.get("rank") || STUDENT_RANKS[0]}
          />
        ) : null}

        {withCourse ? (
          <HandleSuspence
            noDataMsg="No Course Avilable"
            isLoading={isFetching}
            dataLength={data?.data.length}
            error={error}
          >
            <DropDown
              name="course_id"
              label="Choose Course"
              options={[
                { text: "All Courses", value: 0 },
                ...(data?.data.map((item) => ({
                  text: item.course_name,
                  value: item.course_id,
                })) || []),
              ]}
              defaultValue={
                searchParams.get("course_id") || data?.data[0]?.course_id
              }
            />
          </HandleSuspence>
        ) : null}

        <DropDown
          onChange={(institute) => {
            setInstitute(institute.value);
            onCampusChange?.(institute.value);
          }}
          name="institute"
          label="Campus"
          options={[
            { text: "Kolkata", value: "Kolkata" },
            { text: "Faridabad", value: "Faridabad" },
          ]}
          defaultValue={searchParams.get("institute") || "Kolkata"}
        />

        <DateInput
          required
          label={fromDateLable ?? "From Date *"}
          name="from_date"
          date={searchParams.get("from_date")}
        />

        <DateInput
          required
          label={toDateLable ?? "To Date *"}
          name="to_date"
          date={searchParams.get("to_date")}
        />

        {children}

        <div className="!mb-2 !flex-grow-0 flex items-center gap-5">
          <Button className="">Filter</Button>
        </div>
      </form>
    </div>
  );
}
