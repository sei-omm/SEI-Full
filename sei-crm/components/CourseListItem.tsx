import { MdOutlineDateRange, MdOutlineDeleteOutline } from "react-icons/md";
import { CgTimelapse } from "react-icons/cg";
import { IoMdTime } from "react-icons/io";

import { IoDocumentTextOutline } from "react-icons/io5";
import { ICourse } from "@/types";
import { CiEdit } from "react-icons/ci";
import Link from "next/link";
import { formatDateAndTime } from "@/app/utils/formateDateAndTime";
import { beautifyDate } from "@/app/utils/beautifyDate";
import TagsBtn from "./TagsBtn";
import DeleteCourseBtn from "./Course/DeleteCourseBtn";

interface IProps {
  className?: string;
  course: ICourse;
}

export default function CourseListItem({ course, className }: IProps) {
  return (
    <li className={`card-shdow border-gray-400 rounded-xl p-5 ${className}`}>
      {/* <div className="h-40 w-full aspect-video relative overflow-hidden rounded-xl">
        <Image
          className="object-cover size-full"
          src={course.thumbnails}
          alt="Course Image"
          height={1200}
          width={1200}
        />
        <div className="size-full absolute inset-0 fade-to-top-yellow-color"></div>
      </div> */}

      <div className="flex items-center justify-between py-2">
        <div className="flex-center gap-x-1">
          <CgTimelapse size={14} />
          <span className="text-[0.82rem]">
            {course.remain_seats} Seats Remain
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-center gap-x-1">
            <MdOutlineDateRange size={14} />
            <span className="text-[0.82rem]">
              {formatDateAndTime(course.course_update_time)}
            </span>
          </div>
          {course.course_visibility === "Public" ? (
            <TagsBtn type="SUCCESS">Public</TagsBtn>
          ) : course.course_visibility === "Private" ? (
            <TagsBtn type="FAILED">Private</TagsBtn>
          ) : (
            <TagsBtn type="PENDING">{course.course_visibility}</TagsBtn>
          )}
        </div>
      </div>

      <span>
        <span className="float-left font-semibold mt-[2.1px] mr-1">{course.course_showing_order} : </span>
        <span className="font-semibold text-gray-700 text-xl">
          {course.course_name}
        </span>
      </span>
      {/* <details className="flex flex-wrap gap-x-3 mt-2">
        <summary className="text-sm text-gray-600">Document Required</summary>
        <p className="text-sm text-gray-600">
          10th Certificate & Mark sheet 12th Certificate & Mark sheet Passport
          CDC sea time pages Indos Profile & BSID
        </p>
      </details> */}

      {/* <h3 className="text-sm">
        <span className="font-semibold">Document Required : </span>
        <span>
          10th Certificate & Mark sheet 12th Certificate & Mark sheet Passport
          CDC sea time pages Indos Profile & BSID
        </span>
      </h3> */}

      <div className="mt-2 space-y-2">
        <h2 className="font-medium">Required Documents : </h2>
        <ul className="flex flex-wrap gap-2">
          {course.require_documents?.split(",").map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              <IoDocumentTextOutline size={12} />
              <span className="text-[13px]">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {course.batches ? (
        <div className="mt-3 flex items-start gap-4 flex-wrap">
          {course.batches.map((batch) => (
            <TagsBtn
              key={batch.batch_id}
              noIcon={true}
              icon={<MdOutlineDateRange />}
              className="bg-[#00000009] border border-black"
              type="ANY"
            >
              {beautifyDate(batch.start_date)}
            </TagsBtn>
          ))}
        </div>
      ) : null}

      {/* <h3 className="text-gray-400">{course.description}</h3> */}

      {/* <div className="flex items-center justify-between">
      <Button>Enroll Now</Button>
      <span className="font-semibold text-blue-700">
        {course.price}
      </span>
    </div> */}

      <div className="w-full flex items-center justify-between pt-4">
        <span className="text-[#b18c44] font-semibold flex-center gap-2">
          {/* {course.center_name} */}
          <IoMdTime />
          <span className="text-sm">Duration {course.course_duration}</span>
        </span>

        <div className="*:cursor-pointer flex items-center gap-4">
          <Link href={"manage-course/" + course.course_id}>
            <CiEdit size={20} className="active:scale-90" />
          </Link>
          <DeleteCourseBtn id={course.course_id}>
            <MdOutlineDeleteOutline size={20} className="active:scale-90" />
          </DeleteCourseBtn>
        </div>
      </div>
    </li>
  );
}
