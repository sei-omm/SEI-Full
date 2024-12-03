import React from "react";
import CoursesListView from "../CoursesListView";
import { CourseType } from "@/app/type";
 
interface IProps {
  courses : CourseType[]
}

export default function MyCourses({courses} : IProps) {
  return (
    <>
      <CoursesListView courses={courses} withoutEnrollBtn = {true} withoutBatchDates = {true}/>
    </>
  );
}
