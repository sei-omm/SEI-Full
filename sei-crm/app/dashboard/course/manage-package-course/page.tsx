"use client";

import { BASE_API } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Button from "@/components/Button";
import Campus from "@/components/Campus";
import HandleSuspence from "@/components/HandleSuspence";
import Pagination from "@/components/Pagination";
import Spinner from "@/components/Spinner";
import TagsBtn from "@/components/TagsBtn";
import { usePurifySearchParams } from "@/hooks/usePurifySearchParams";
import { IPackageCourse, ISuccess } from "@/types";
import axios from "axios";
import Link from "next/link";

import React from "react";
import { CiEdit } from "react-icons/ci";
import { IoIosAdd } from "react-icons/io";
import { IoPricetagOutline } from "react-icons/io5";
import {
  MdOutlineDateRange,
  MdOutlineVisibility,
  MdOutlineVisibilityOff,
} from "react-icons/md";
import { useQuery } from "react-query";

async function getCourseList(searchParams: URLSearchParams) {
  searchParams.delete("code");
  return (
    await axios.get(`${BASE_API}/course/package?${searchParams.toString()}`)
  ).data;
}

export default function ManagePackageCourses() {
  const searchParams = usePurifySearchParams();

  const {
    data: packageCourse,
    isFetching,
    error,
    refetch,
  } = useQuery<ISuccess<IPackageCourse[]>>({
    queryKey: ["get-course-list", searchParams.toString()],
    queryFn: () => getCourseList(searchParams),
  });

  const { isLoading, mutate } = useDoMutation();

  const handleVisibility = (visibility: string, packageId: number) => {
    if (!confirm("Are you sure you want to change the visibility ?")) return;

    mutate({
      apiPath: "/course/package",
      method: "patch",
      formData: {
        visibility,
      },
      id: packageId,
      onSuccess() {
        refetch();
      },
    });
  };

  return (
    <div>
      <section className="space-y-5 px-5 py-5">
        {/* course action buttons */}
        <div className="w-full flex items-center justify-between gap-x-5">
          <Campus
            changeSearchParamsOnChange
            defaultValue={searchParams.get("institute")}
          />
          <div className="flex items-center gap-4">
            <Link href={"manage-package-course/add?" + searchParams.toString()}>
              <Button className="flex-center gap-x-2">
                <IoIosAdd size={23} />
                Add Package course
              </Button>
            </Link>
          </div>
        </div>

        <HandleSuspence
          isLoading={isFetching}
          error={error}
          dataLength={packageCourse?.data.length}
          noDataMsg="No Package Course Avilable"
        >
          <ul className="w-full grid grid-cols-1 gap-6">
            {packageCourse?.data.map((packageCourse) => (
              <li
                key={packageCourse.package_id}
                className={`card-shdow border-gray-400 rounded-xl p-10 space-y-2`}
              >
                <h2 className="font-semibold text-2xl">
                  {packageCourse.package_name}
                </h2>

                <div className="space-y-1">
                  <h3 className="font-semibold">Include Courses</h3>
                  <ul className="flex items-center gap-5 flex-wrap">
                    {packageCourse.course_info?.map((courseInfo) => (
                      <li
                        key={courseInfo.course_id}
                        className="bg-gray-500 px-5 py-1 rounded-full text-xs text-white"
                      >
                        <span>{courseInfo.course_name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    {packageCourse.visibility === "Public" ? (
                      <TagsBtn type="SUCCESS">Public</TagsBtn>
                    ) : (
                      <TagsBtn type="FAILED">Private</TagsBtn>
                    )}

                    <span className="flex items-center gap-2">
                      <MdOutlineDateRange />
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold">Created At : </span>
                        <span>{beautifyDate(packageCourse.created_at)}</span>
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <IoPricetagOutline />
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold">Package Price : </span>
                        <span className="line-through mr-2">
                          ₹{packageCourse.total_course_fee}
                        </span>
                        <span>₹{packageCourse.price}</span>
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-5">
                    <Link
                      href={`manage-package-course/${packageCourse.package_id}`}
                    >
                      <CiEdit size={20} className="cursor-pointer" />
                    </Link>
                    {isLoading ? (
                      <Spinner size="18px" />
                    ) : packageCourse.visibility === "Public" ? (
                      <MdOutlineVisibilityOff
                        onClick={() =>
                          handleVisibility("Private", packageCourse.package_id)
                        }
                        size={20}
                        className="cursor-pointer"
                      />
                    ) : (
                      <MdOutlineVisibility
                        onClick={() =>
                          handleVisibility("Public", packageCourse.package_id)
                        }
                        size={20}
                        className="cursor-pointer"
                      />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </HandleSuspence>

        <Pagination dataLength={packageCourse?.data.length} />
      </section>
    </div>
  );
}
