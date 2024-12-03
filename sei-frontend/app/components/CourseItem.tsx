import { CourseType } from "../type";
import { CgTimelapse } from "react-icons/cg";
import { IoMdTime } from "react-icons/io";

import { IoDocumentTextOutline } from "react-icons/io5";
import { formateDate } from "../utils/formateDate";
import CourseBatchDateList from "./CourseBatchDateList";
import PayDueAmountBtn from "./MyAccount/PayDueAmountBtn";
import TagsBtn from "./TagsBtn";

interface IProps {
  className?: string;
  course: CourseType;
  withoutEnrollBtn?: boolean;
  withoutBatchDates?: boolean;
}

export default function CourseItem({
  course,
  className,
  withoutEnrollBtn,
  withoutBatchDates,
}: IProps) {
  return (
    // <li
    //   className={`shadow-xl border border-gray-200 rounded-3xl p-7 basis-64 max-w-64 flex-grow flex flex-col justify-between gap-3 card-shdow ${className}`}
    // >
    //   <div>
    //     <div className="flex items-center justify-between py-2">
    //       <div className="flex-center gap-x-1 text-[#bd9037]">
    //         <CgTimelapse size={14} />
    //         <span className="text-[0.82rem]">
    //           {course.remain_seats} Seats Remain
    //         </span>
    //       </div>
    //       <div className="flex-center gap-x-1 text-[#bd9037]">
    //         <MdOutlineDateRange size={14} />
    //         <span className="text-[0.82rem]">
    //           {formateDate(course.created_at)}
    //         </span>
    //       </div>
    //     </div>

    //     <h2 className="font-semibold text-gray-700 text-xl line-clamp-2">
    //       {course.course_name}
    //     </h2>

    //     <div className="mt-2 space-y-2">
    //       <h2 className="font-medium">Required Documents : </h2>
    //       <ul className="flex flex-wrap gap-2">
    //         {course.require_documents?.split(",").map((item) => (
    //           <li key={item} className="flex items-center gap-1">
    //             <IoDocumentTextOutline size={12} />
    //             <span className="text-[13px]">{item}</span>
    //           </li>
    //         ))}
    //       </ul>
    //     </div>
    //   </div>
    //   {withoutBatchDates ? null : course.batches?.length === 0 ? null : (
    //     <div className="space-y-2">
    //       <span className="text-sm text-gray-500">
    //         Click on the Date to book your Course
    //       </span>

    //       <CourseBatchDateList course={course} />
    //     </div>
    //   )}

    //   <div className="w-full flex items-end justify-between pt-4">
    //     <span className="text-[#b18c44] font-semibold flex-center gap-2">
    //       <IoMdTime />
    //       <span className="text-sm">Duration {course.course_duration}</span>
    //     </span>
    //   </div>
    // </li>

    <li
      className={`shadow-xl border relative border-gray-200 rounded-3xl p-7 basis-64 max-w-64 flex-grow flex flex-col justify-between gap-3 card-shdow ${className}`}
    >
      <span className="hidden">{withoutEnrollBtn}</span>
      <div className="flex items-start gap-5 flex-wrap *:flex-grow">
        <div className="space-y-2 min-w-[20rem] max-w-[28rem]">
          <div className="flex items-center gap-x-1 text-[#bd9037]">
            <CgTimelapse size={14} />
            <span className="text-[0.82rem]">
              {course.remain_seats} Seats Remain
            </span>
          </div>

          <h2 className="font-semibold text-gray-700 text-xl line-clamp-2 max-w-[80%] sm:max-w-full">
            {course.course_name}
          </h2>

          <div className="mt-2 space-y-2">
            <h2 className="font-medium">Required Documents : </h2>
            <ul className="flex flex-wrap gap-2">
              {course.require_documents?.split(",").map((item) => (
                <li key={item} className="flex items-center gap-1">
                  <IoDocumentTextOutline size={12} />
                  <span className="text-[13px]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          {course.due_amount > 0 ? (
            <PayDueAmountBtn
              due_amount={course.due_amount}
              batch_id={course.enrolled_batch_id}
            />
          ) : null}

          <div className="w-full flex items-end justify-between pt-1">
            <span className="text-[#b18c44] font-semibold flex-center gap-2">
              <IoMdTime />
              <span className="text-sm">Duration {course.course_duration}</span>
            </span>
          </div>
        </div>

        {course.enrollment_status ? (
          <div className="max-w-fit absolute right-7">
            {course.enrollment_status === "Approve" ? (
              <TagsBtn className="text-[14px]" type="SUCCESS">Approved</TagsBtn>
            ) : course.enrollment_status === "Pending" ? (
              <TagsBtn className="text-[14px]" type="PENDING">Waiting List</TagsBtn>
            ) : (
              <TagsBtn className="text-[14px]" type="FAILED">Canceled</TagsBtn>
            )}
          </div>
        ) : null}

        {!course.enrolled_batch_date ? null : (
          <div className="h-full">
            <span className="text-sm text-gray-500 block">
              Enrolled Batch Date
            </span>
            <div className="flex items-center mt-4">
              <div className="text-xs font-semibold max-w-32 text-center p-2 px-3 flex-grow border border-[#E9B858] rounded-full bg-[#E9B858]">
                {formateDate(course.enrolled_batch_date)}
              </div>
            </div>
          </div>
        )}

        {withoutBatchDates ? null : course.batches?.length === 0 ? null : (
          <div className="h-full">
            <span className="text-sm text-gray-500 block">
              Click on the Date to book your Course
            </span>
            <div className="flex items-center mt-4">
              <CourseBatchDateList course={course} />
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
