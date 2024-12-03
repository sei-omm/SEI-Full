import CourseItem from "./CourseItem";
import { CourseType } from "../type";

interface IProps {
  courses: CourseType[];
  withoutEnrollBtn?: boolean;
  withoutBatchDates?: boolean;
}

export default async function CoursesListView({
  courses,
  withoutEnrollBtn,
  withoutBatchDates,
}: IProps) {
  return courses.length === 0 ? (
    <h2 className="text-gray-400 text-center py-10">No Course Avilable</h2>
  ) : (
    <ul className="grid grid-cols-1 gap-5 py-8 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseItem
          withoutBatchDates={withoutBatchDates}
          withoutEnrollBtn={withoutEnrollBtn}
          key={course.course_id}
          className="!max-w-full sm:!max-w-full"
          course={course}
        />
      ))}
    </ul>
  );
}
