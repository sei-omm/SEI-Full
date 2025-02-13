"use client";

import { CourseType } from "../type";
import { formateDate } from "../utils/formateDate";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getLocalLoginInfo } from "../utils/getLocalLoginInfo";

interface IProps {
  course: CourseType
}

export default function CourseBatchDateList({ course }: IProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const route = useRouter();

  function handleBatchClick(
    batchId: number,
    batchStartDate: string,
    isInWaitingList: boolean
  ) {
    // if (selectedDateList.has(batchStartDate)) {
    //   if (selectedDateList.get(batchStartDate) === batchId) {
    //     selectedDateList.delete(batchStartDate);
    //   } else {
    //     return alert("You have already selected a course on the same date.");
    //   }
    // }

    // selectedDateList.set(batchStartDate, batchId);

    const loginInfo = getLocalLoginInfo();
    if (loginInfo !== null) {
      const enrolled_courses = loginInfo.enrolled_courses;
      const indexOfBatchId = enrolled_courses?.findIndex(
        (item) => item.batch_id === batchId
      );
      if (indexOfBatchId !== -1) {
        return alert("You have already enrolled this course");
      }

      const indexOfBatchStartDate = enrolled_courses?.findIndex(
        (item) => item.start_date === batchStartDate
      );
      if (indexOfBatchStartDate !== -1) {
        return alert(
          "You have already registered for a course on the same date."
        );
      }
    }

    if (isInWaitingList) {
      alert(
        "Your form will be in waiting list and will be approved if any one previous cancels"
      );
    }

    const urlSearchParams = new URLSearchParams(searchParams);
    const key = `bid${course.course_id}`;
    if (
      urlSearchParams.has(key) &&
      urlSearchParams.get(key) === batchId.toString()
    ) {
      urlSearchParams.delete(key);
    } else {
      urlSearchParams.set(key, batchId.toString());
    }
    route.push(`${pathname}?${urlSearchParams.toString()}`, { scroll: false });
  }

  return (
    <ul className="flex items-center gap-3 flex-wrap">
      {course.batches?.map((batch) => {
        const isInWaitingList =
          batch.batch_total_seats === 0 ||
          batch.batch_total_seats <= batch.batch_reserved_seats;
        return (
          <li
            key={batch.batch_id}
            onClick={() =>
              handleBatchClick(
                batch.batch_id,
                batch.start_date,
                isInWaitingList
              )
            }
            className={`text-xs font-semibold cursor-pointer max-w-32 text-center p-2 px-3 flex-grow border border-[#E9B858] ${
              searchParams.has(`bid${course.course_id}`) &&
              searchParams.get(`bid${course.course_id}`) ===
                batch.batch_id.toString()
                ? "bg-[#E9B858] text-black"
                : isInWaitingList
                ? "bg-gray-400"
                : "bg-transparent"
            } transition-all duration-300 card-shdow rounded-lg`}
          >
            {formateDate(batch.start_date)}
          </li>
        );
      })}
    </ul>
  );
}
