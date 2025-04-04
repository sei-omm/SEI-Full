import React from "react";
import { BASE_API } from "@/app/constant";
import { CourseType, IResponse } from "@/app/type";
import CourseItem from "../CourseItem";
import { capitalizeFirstChar } from "@/app/utils/capitalizeFirstChar";

interface IProps {
    centerName: string | undefined;
}

export default async function PackageCourseListView({ centerName } : IProps) {
  const response = await fetch(
    `${BASE_API}/course/package?institute=${capitalizeFirstChar(centerName || "")}&with_batches=true`,
    {
      cache: "no-store",
    }
  );

  const result = (await response.json()) as IResponse<
    {
      package_id: number;
      package_name: number;
      price: number;
      course_info: CourseType[];
      total_course_fee: number;
    }[]
  >;

  return (
    <section className="w-full py-10">
      <ul className="space-y-12">
        {result.data.map((eachPackage) => (
          <li
            key={eachPackage.package_id}
            className="shadow-xl border relative border-gray-200 rounded-3xl p-7"
          >
            <div className="flex items-center">
              <h2 className="font-semibold text-gray-600 underline flex-1">
                {eachPackage.package_name}
              </h2>

              <div className="flex items-center gap-2">
                <span className="line-through text-sm">
                  <span className="font-mono">₹</span>
                  <span>{eachPackage.total_course_fee}</span>
                </span>
                <span className="text-lg font-semibold">
                  <span className="font-mono">₹</span>
                  <span>{eachPackage.price}</span>
                </span>
              </div>
            </div>

            <h3 className="text-center text-blue-700 animate-pulse underline">
              Choose both batches of this package to receive the discount.
            </h3>

            {eachPackage.course_info.map((course_info) => (
              <CourseItem
                withoutBatchDates={false}
                withoutEnrollBtn={false}
                key={course_info.course_id}
                className="!max-w-full sm:!max-w-full !shadow-none !border-none"
                course={course_info}
                package_id={eachPackage.package_id}
              />
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}
