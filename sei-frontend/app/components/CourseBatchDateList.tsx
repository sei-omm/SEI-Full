"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteCourseFromCart,
  pushCourseToCart,
  updateCourseCart,
} from "../redux/slice/courseCart.slice";
import { CourseType, TLoginSuccess } from "../type";
import { RootState } from "../redux/store";
import { formateDate } from "../utils/formateDate";

interface IProps {
  course: CourseType;
}

export default function CourseBatchDateList({ course }: IProps) {
  const [selectedBatchId, setSelectedBatchId] = useState(-1);

  const batchesCart = useSelector((state: RootState) => state.courseCart);
  const dispatch = useDispatch();

  return (
    <ul className="flex items-center gap-3 flex-wrap">
      {course.batches?.map((batch) => {
        const isInWaitingList =
          batch.batch_total_seats === 0 ||
          batch.batch_total_seats === batch.batch_reserved_seats;
        return (
          <li
            key={batch.batch_id}
            onClick={() => {
              const courseIndex = batchesCart.findIndex(
                (item) => item.course_id === batch.course_id
              );

              const localLoginInfo = localStorage.getItem("login-info");
              if(localLoginInfo) {
                const loginInfo = JSON.parse(localLoginInfo || "{}") as TLoginSuccess;
                if(loginInfo.enrolled_courses.findIndex((item) => item.batch_id  === batch.batch_id) != -1) {
                  return alert("Your have already enrolled")
                }
              }


              if (selectedBatchId === batch.batch_id) {
                //user deselect any batch
                dispatch(deleteCourseFromCart(courseIndex));
                setSelectedBatchId(-1);
                return;
              }

              if (isInWaitingList) {
                if(!confirm(
                  "Your form will be in waiting list and will be approved if any one previous cancels"
                )) return;
              }

              if (courseIndex === -1) {
                //course is not inside list so add it
                dispatch(
                  pushCourseToCart({
                    course_id: batch.course_id,
                    course_name: course.course_name,
                    course_price: batch.batch_fee,
                    batch_id: batch.batch_id,
                    batch_start_date: batch.start_date,
                    batch_end_date: batch.end_date,
                    institute: course.institute,
                    isInWaitingList,
                  })
                );
              } else {
                dispatch(
                  updateCourseCart({
                    index: courseIndex,
                    values: {
                      course_id: course.course_id,
                      course_name: course.course_name,
                      course_price: batch.batch_fee,
                      batch_id: batch.batch_id,
                      batch_start_date: batch.start_date,
                      batch_end_date: batch.end_date,
                      institute: course.institute,
                      isInWaitingList,
                    },
                  })
                );
              }

              setSelectedBatchId(batch.batch_id);
            }}
            className={`text-xs font-semibold cursor-pointer max-w-32 text-center p-2 px-3 flex-grow border border-[#E9B858] " ${
              selectedBatchId === batch.batch_id
                ? "bg-[#E9B858] text-black"
                : batchesCart.find((item) => item.batch_id === batch.batch_id)
                    ?.batch_id
                ? "bg-[#E9B858]"
                : isInWaitingList ? "bg-gray-400" : "bg-transparent"
            } transition-all duration-300 card-shdow rounded-lg`}
          >
            {formateDate(batch.start_date)}
          </li>
        );
      })}
    </ul>
  );
}
