import React, { useCallback, useState } from "react";
import DialogBody from "./DialogBody";
import Input from "../Input";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { ISuccess } from "@/types";
import _ from "lodash";
import Button from "../Button";
import { IoAdd } from "react-icons/io5";
import AssignBookListItem from "../Library/AssignBookLIstItem";
import DateInput from "../DateInput";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";

async function searchStudent(student_name: string) {
  return (
    await axios.get(`${BASE_API}/student/search?student_name=${student_name}`)
  ).data;
}

interface Course {
  course_id: number;
  course_name: string;
}

interface SearchStudent {
  profile_image: string | null; // Assuming profile_image can be a string or null
  student_id: number;
  name: string;
  indos_number: string; // Assuming indos_number is a string, even if it's empty
  enrolled_courses: Course[];
}

export default function IssueBookToStudent() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [studentNameQuery, setStudentNameQuery] = useState<string | null>(null);

  const [studentSuggestions, setStudentSuggestion] = useState<SearchStudent[]>(
    []
  );
  const [selectedStudentInfo, setSelectedStudentInfo] =
    useState<SearchStudent | null>(null);

  const [assignBookAndCourse, setAssignBookAndCourse] = useState<
    { book_id: number; course_id: number }[]
  >([]);
  const [issueDate, setIssueDate] = useState("");

  const [inputs, setInputs] = useState<number[]>([]);

  const { isFetching } = useQuery<ISuccess<SearchStudent[]>>({
    queryKey: ["get-students-with-course", studentNameQuery],
    queryFn: () => searchStudent(studentNameQuery || ""),
    enabled: studentNameQuery !== null,
    onSuccess(data) {
      setStudentSuggestion(data.data);
    },
  });

  // Debounced function for student search
  const debouncedSearchStudent = useCallback(
    _.debounce((searchTerm) => {
      setStudentNameQuery(searchTerm);
    }, 500), // 500ms delay
    []
  );

  const { isLoading, mutate } = useDoMutation();
  const submitForm = () => {
    mutate({
      apiPath: "/library/physical/issue-book",
      method: "post",
      formData: {
        student_id: selectedStudentInfo?.student_id,
        issue_date: issueDate,
        institute: searchParams.get("institute") || "Kolkata",
        info: assignBookAndCourse.map((item) => ({
          course_id: item.course_id,
          phy_lib_book_id: item.book_id,
        })),
      },
      onSuccess() {
        dispatch(setDialog({ type: "CLOSE", dialogId: "" }));
      },
    });
  };

  return (
    <DialogBody className="min-w-[45rem] max-h-[90vh] overflow-y-auto">
      <h2 className="font-semibold text-lg">Issue Book to Student</h2>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Search Student"
          name="student_id"
          placeholder="Type Student Name"
          onChange={(e) => debouncedSearchStudent(e.currentTarget.value)}
          suggestionOptions={
            studentSuggestions.map((eStudent) => ({
              text: eStudent.name,
              value: eStudent.student_id,
            })) || []
          }
          suggestionLoading={isFetching}
          onSuggestionItemClick={(option) => {
            setSelectedStudentInfo(
              studentSuggestions.filter(
                (item) => item.student_id === option.value
              )[0]
            );
            setStudentSuggestion([]);
          }}
        />
        <DateInput
          onChange={(value) => setIssueDate(value)}
          label="Issue Date"
          name="issue_date"
        />
      </div>

      <>
        <div className="flex items-center justify-end">
          <Button
            onClick={() => {
              setInputs((preState) => [
                ...preState,
                (preState[preState.length - 1] || 0) + 1,
              ]);
            }}
            className="flex items-center gap-3"
            color="#fff"
          >
            <IoAdd size={18} />
            Assign Book
          </Button>
        </div>

        {inputs.map((input) => (
          <AssignBookListItem
            required
            key={input}
            input={input}
            onDeleteBtnClick={() =>
              setInputs((preState) =>
                preState.filter((eachInput) => eachInput !== input)
              )
            }
            onBookAndCourseSelect={(book_id, course_id) => {
              const existIndex = assignBookAndCourse.findIndex(
                (item) => item.book_id === book_id
              );
              const preState = [...assignBookAndCourse];
              if (existIndex === -1) {
                preState.push({ book_id, course_id });
              } else {
                preState[existIndex].course_id = course_id;
              }

              setAssignBookAndCourse(preState);
            }}
            courses={selectedStudentInfo?.enrolled_courses || []}
          />
        ))}
      </>

      <Button loading={isLoading} disabled={isLoading} onClick={submitForm}>
        Save Info
      </Button>
    </DialogBody>
  );
}
