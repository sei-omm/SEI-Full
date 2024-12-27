import React, { useState } from "react";
import DialogBody from "./DialogBody";
import { ICourseWithSubject, ISuccess, OptionsType } from "@/types";
import { queryClient } from "@/redux/MyProvider";
import DropDown from "../DropDown";
import DropDownTag from "../DropDownTag";
import Button from "../Button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import HandleSuspence from "../HandleSuspence";

async function fetchCourses(institute: string) {
  const { data } = await axios.get(
    `${BASE_API}/course/with-subjects?institute=${institute}`
  );
  return data;
}

export default function FacultyAssignCoursesDialog() {
  const [selectedCourseSubjects, setSelectedCourseSubjects] = useState("");

  const { extraValue } = useSelector((state: RootState) => state.dialogs);
  const dispatch = useDispatch();

  const {
    isFetching,
    data: courseWithSubjects,
    error,
  } = useQuery<ISuccess<ICourseWithSubject[]>>({
    queryKey: "fetch-course-with-subjects",
    queryFn: () => fetchCourses(extraValue.institute),
  });

  const handleCourseSelectDropDown = ({ value }: OptionsType) => {
    const foundCourseInfo = courseWithSubjects?.data.find(
      (item) => item.course_id === value
    );
    setSelectedCourseSubjects(foundCourseInfo?.subjects || "No Subjects");
  };

  const { mutate, isLoading } = useDoMutation();

  function handleFormSubmit(formData: FormData) {
    formData.set("faculty_id", extraValue?.faculty_id as string);

    mutate({
      apiPath: "/employee/faculty-assign-course",
      method: "post",
      formData,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: "faculty-assign-course",
        });
        dispatch(
          setDialog({
            dialogId: "faculty-assign-courses-dialog",
            type: "CLOSE",
          })
        );
      },
    });

    // const courseID = Number(formData.get("course_id"));
    // setAssignedCourse((prev) => [
    //   ...prev,
    //   {
    //     course_id: courseID,
    //     course_name: courseWithSubjects.data.find(item => item.course_id === courseID)?.course_name || "",
    //     subjects: formData.get("subject") as string,
    //   },
    // ]);
    // dispatch(setDialog({dialogId : "faculty-assign-courses-dialog", type : "CLOSE"}))
  }

  return (
    <DialogBody>
      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={courseWithSubjects?.data.length}
      >
        <form action={handleFormSubmit} className="space-y-4">
          <DropDown
            name="course_id"
            onChange={handleCourseSelectDropDown}
            wrapperCss="flex-grow basic-46"
            label="Select Course"
            options={
              courseWithSubjects?.data.map((course) => ({
                text: course.course_name,
                value: course.course_id,
              })) || []
            }
          />
          <DropDownTag
            name="subject"
            wrapperCss="flex-grow basic-46"
            label="Choose Faculty Subject"
            options={selectedCourseSubjects
              .split(",")
              .map((item) => ({ text: item, value: item }))}
          />

          <Button loading={isLoading} disabled={isLoading} type="submit">
            Save Info
          </Button>
        </form>
      </HandleSuspence>
    </DialogBody>
  );
}
