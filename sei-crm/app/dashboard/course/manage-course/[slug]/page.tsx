"use client";

import CourseBatch from "@/components/Course/CourseBatch";
import CourseForm from "@/components/Course/CourseForm";

interface IProps {
  params: {
    slug: "add-course" | number;
  };
}

export default function ManageEachCourse({ params }: IProps) {

  const courseId = params.slug === "add-course" ? null : params.slug;

  return (
    <section className="p-8 space-y-10">
      <div className="p-10 border card-shdow rounded-3xl">
        <h2 className="text-2xl font-semibold pb-6">Course Information</h2>
        <CourseForm slug={params.slug} />
      </div>

      {/* Course Batch */}
      {courseId ? <CourseBatch courseId={courseId} /> : null}
    </section>
  );
}
