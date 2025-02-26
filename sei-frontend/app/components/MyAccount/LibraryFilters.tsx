"use client";

import { CourseType, IResponse } from "@/app/type";
import DropDown from "../DropDown";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";

interface IProps {
  courses: CourseType[];
}

type TLibraryVisibility = "all" | "subject-specific" | "course-specific";

interface IDropDownTags {
  subject_id: number;
  subject_name: string;
}

export default function LibraryFilters({ courses }: IProps) {
  const searchParams = useSearchParams();
  const route = useRouter();

  const { data: subjects } = useQuery<IResponse<IDropDownTags[]>>({
    queryKey: ["get-subjects"],
    queryFn: async () => (await axios.get(BASE_API + "/subject")).data,
  });

  function handleFilterSelection(visibility: TLibraryVisibility, value: any) {
    const urlSearchParams = new URLSearchParams(searchParams);
    if (value === -1) return route.push("/account?tab=library");

    urlSearchParams.set("visibility", visibility);
    urlSearchParams.set("item_id", value);
    route.push("/account?" + urlSearchParams.toString());
  }

  return (
    <>
      <DropDown
        key={"course_id"}
        label="Select Course"
        name="course_id"
        options={[
          { text: "All", value: -1 },
          ...courses.map((course) => ({
            text: course.course_name,
            value: course.course_id,
          })),
        ]}
        defaultValue={searchParams.get("visibility") === "course-specific" && searchParams.get("item_id") || -1}
        onChange={(item) =>
          handleFilterSelection("course-specific", item.value)
        }
      />
      <DropDown
        key={"subject_id"}
        label="Select Subject"
        name="subject_id"
        options={[
          { text: "All", value: -1 },
          ...(subjects?.data.map((subject) => ({
            text: subject.subject_name,
            value: subject.subject_id,
          })) || []),
        ]}
        defaultValue={searchParams.get("visibility") === "subject-specific" && searchParams.get("item_id") || -1}
        onChange={(item) =>
          handleFilterSelection("subject-specific", item.value)
        }
      />
    </>
  );
}
