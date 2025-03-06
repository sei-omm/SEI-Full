import React, { useState } from "react";
import DropDown from "./DropDown";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "react-query";
import { ISuccess, TCourseDropDown, TLibraryVisibility } from "@/types";
import { BASE_API } from "@/app/constant";
import axios from "axios";
import Button from "./Button";
import HandleDataSuspense from "./HandleDataSuspense";

interface IDropDownTags extends TCourseDropDown {
  subject_id: number;
  subject_name: string;
}

export default function LibraryFilters() {
  const urlSearchParams = useSearchParams();
  const [institute, setInstitute] = useState(
    urlSearchParams.get("institute") || "Kolkata"
  );
  const route = useRouter();

  const [visibility, setVisibility] = useState<TLibraryVisibility>(
    (urlSearchParams.get("visibility") as TLibraryVisibility) || "-1"
  );

  const {
    data: coursesOrSubjects,
    isFetching,
    error,
  } = useQuery<ISuccess<IDropDownTags[]>>({
    queryKey: [
      "get-course-or-subejcts",
      visibility,
      institute,
      urlSearchParams.toString(),
    ],
    queryFn: async () =>
      (
        await axios.get(
          visibility === "course-specific"
            ? `${BASE_API}/course/drop-down?institute=${institute}`
            : visibility === "subject-specific"
            ? BASE_API + "/subject"
            : ""
        )
      ).data,

    enabled:
      visibility === "course-specific" || visibility === "subject-specific",
  });

  function handleFormSumbit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const urlSearchParams = new URLSearchParams();
    formData.entries().forEach(([key, value]) => {
      if (value !== "-1") {
        urlSearchParams.set(key, value.toString());
      }
    });

    route.push("/dashboard/library/item?" + urlSearchParams.toString());
  }

  return (
    <form
      onSubmit={handleFormSumbit}
      className="flex items-end flex-wrap *:basis-56 gap-3"
    >
      <DropDown
        onChange={(item) => setInstitute(item.value)}
        name="institute"
        label="Campus *"
        options={[
          { text: "Kolkata", value: "Kolkata" },
          { text: "Faridabad", value: "Faridabad" },
        ]}
        defaultValue={urlSearchParams.get("institute") || "Kolkata"}
      />
      <DropDown
        name="visibility"
        onChange={(item) => setVisibility(item.value)}
        label="Visibility *"
        options={[
          { text: "All", value: "-1" },
          { text: "Subject Specific", value: "subject-specific" },
          { text: "Course Specific", value: "course-specific" },
        ]}
        defaultValue={urlSearchParams.get("visibility") || "-1"}
      />
      {visibility === "course-specific" ? (
        <HandleDataSuspense
          isLoading={isFetching}
          error={error}
          data={coursesOrSubjects}
        >
          {(course) => (
            <DropDown
              key={"course_id"}
              label="Choose Course"
              name="course_id"
              options={[
                { text: "All Courses", value: "-1" },
                ...(course.data.map((course) => ({
                  text: course.course_name,
                  value: course.course_id.toString(),
                })) || []),
              ]}
              defaultValue={
                urlSearchParams.get("course_id") || "-1"
              }
            />
          )}
        </HandleDataSuspense>
      ) : visibility === "subject-specific" ? (
        <HandleDataSuspense
          isLoading={isFetching}
          error={error}
          data={coursesOrSubjects}
        >
          {(subject) => (
            <DropDown
              key={"subject_id"}
              label="Choose Subject"
              name="subject_id"
              options={[
                { text: "All Subjects", value: "-1" },
                ...(subject.data.map((course) => ({
                  text: course.subject_name,
                  value: course.subject_id,
                })) || []),
              ]}
              defaultValue={
                urlSearchParams.get("subject_id") || "-1"
              }
            />
          )}
        </HandleDataSuspense>
      ) : null}

      {/* <DropDown
        key={"library_file_type"}
        label="File Type"
        name="library_file_type"
        options={[
          { text: "PDF File", value: "pdf" },
          { text: "Doc File", value: "doc" },
          { text: "Audio File", value: "audio" },
          { text: "Image File", value: "image" },
          { text: "Link", value: "link" },
        ]}
        defaultValue={urlSearchParams.get("library_file_type")}
      /> */}
      {/* <DateInput
        required
        label="Date From"
        name="date_from"
        date={urlSearchParams.get("date_from")}
      />
      <DateInput
        required
        label="Date To"
        name="date_to"
        date={urlSearchParams.get("date_to")}
      /> */}
      <div>
        <Button className="mb-2">Filter</Button>
      </div>
    </form>
  );
}
