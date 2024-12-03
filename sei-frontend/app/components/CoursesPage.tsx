import { CourseType, IResponse } from "../type";
import TabMenu from "./TabMenu";
import CoursesListView from "./CoursesListView";
import { BASE_API } from "../constant";
import { capitalizeFirstChar } from "../utils/capitalizeFirstChar";
import CourseSearchBox from "./CourseSearchBox";

interface IProps {
  centerName?: string;
}

export default async function CoursesPage({ centerName }: IProps) {
  const response = await fetch(
    `${BASE_API}/course/with-batches?center=${capitalizeFirstChar(
      centerName || ""
    )}`,
    {
      next: {
        revalidate: 3600,
      },
    }
  );
  const courses = (await response.json()) as IResponse<CourseType[]>;

  return (
    <section className="pt-5 relative">
      <div className="flex items-center flex-wrap gap-y-7">
        {/* Categorys */}
        <div className="flex-grow">
          <TabMenu
            textSize={18}
            tabs={[
              {
                isSelected: centerName === "kolkata" ? true : false,
                slug: "/our-courses/kolkata",
                text: "Kolkata",
              },
              {
                isSelected: centerName === "faridabad" ? true : false,
                slug: "/our-courses/faridabad",
                text: "Faridabad",
              },
            ]}
          />
        </div>

        {/* Search Box */}
        <CourseSearchBox />
      </div>

      {/* Courses List */}
      <CoursesListView courses={courses.data} />
    </section>
  );
}
