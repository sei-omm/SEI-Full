import { CourseType, IResponse, TCourseCategory } from "../type";
import TabMenu from "./TabMenu";
import CoursesListView from "./CoursesListView";
import { BASE_API } from "../constant";
import { capitalizeFirstChar } from "../utils/capitalizeFirstChar";
import PackageCourseListView from "./Course/PackageCourseListView";

interface IProps {
  centerName?: string;
  category: TCourseCategory;
}

export default async function CoursesPage({ centerName, category }: IProps) {
  const searchParams = new URLSearchParams();
  if (centerName) {
    searchParams.set("institute", capitalizeFirstChar(centerName));
  }

  if (category && category !== "all") {
    searchParams.set("category", category);
  }

  let courses: CourseType[] = [];

  if (category !== "packaged-courses") {
    const response = await fetch(
      `${BASE_API}/course/with-batches/student?${searchParams.toString()}`,
      {
        cache: "no-store",
      }
    );
    const result = (await response.json()) as IResponse<CourseType[]>;
    courses = result.data;
  }

  return (
    <section key={searchParams.toString()} className="relative">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h2 className="text-5xl font-semibold">
            Our <span className="text-[#e9b858]">Courses</span>
          </h2>
          <h3 className="max-w-[40rem] sm:max-w-full">
            See our valuable courses which will help you to grow
          </h3>
        </div>

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
      {/* <CourseSearchBox /> */}

      <div className="pt-9 flex items-center">
        <TabMenu
          textSize={16}
          tabs={[
            {
              isSelected: category === "all" || !category ? true : false,
              slug: `/our-courses/${centerName}?category=all`,
              text: "All",
            },
            {
              isSelected: category === "competency-courses" ? true : false,
              slug: `/our-courses/${centerName}?category=competency-courses`,
              text: "Competency Courses",
            },
            {
              isSelected: category === "simulator-courses" ? true : false,
              slug: `/our-courses/${centerName}?category=simulator-courses`,
              text: "Simulator Courses",
            },
            {
              isSelected:
                category === "advanced-modular-courses" ? true : false,
              slug: `/our-courses/${centerName}?category=advanced-modular-courses`,
              text: "Advanced Modular Courses",
            },
            {
              isSelected: category === "basic-modular-courses" ? true : false,
              slug: `/our-courses/${centerName}?category=basic-modular-courses`,
              text: "Basic Modular Courses",
            },
            {
              isSelected: category === "refresher-courses" ? true : false,
              slug: `/our-courses/${centerName}?category=refresher-courses`,
              text: "Refresher Courses",
            },
            {
              isSelected: category === "packaged-courses" ? true : false,
              slug: `/our-courses/${centerName}?category=packaged-courses`,
              text: "Packaged Courses",
            },
          ]}
        />
      </div>

      {/* Courses List */}
      {category === "packaged-courses" ? (
        <PackageCourseListView centerName={centerName} />
      ) : (
        <CoursesListView courses={courses} />
      )}
    </section>
  );
}
