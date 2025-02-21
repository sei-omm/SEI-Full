import React, { useCallback, useState } from "react";
import DialogBody from "./DialogBody";
import Input from "../Input";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { ISuccess, TBookIssueTo } from "@/types";
import _ from "lodash";
import Button from "../Button";
import { IoAdd } from "react-icons/io5";
import AssignBookListItem from "../Library/AssignBookLIstItem";
import DateInput from "../DateInput";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import DropDown from "../DropDown";
import { queryClient } from "@/redux/MyProvider";

async function searchStudent(
  issue_to_name: string,
  issue_to: TBookIssueTo,
  institute: string
) {
  return (
    await axios.get(
      issue_to === "Student"
        ? `${BASE_API}/student/search?student_name=${issue_to_name}&institute=${institute}`
        : `${BASE_API}/employee/search?q=${issue_to_name}&institute=${institute}`
    )
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
  id: number; //employee id
}

type TCourseBookInfo = {
  book_id: number; course_id: number 
}

export default function IssueBookToStudent() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [assignTo, setAssignTo] = useState<TBookIssueTo>("Student");

  const [studentNameQuery, setStudentNameQuery] = useState<string | null>(null);

  const [issueToSuggestion, setIssueToSuggestion] = useState<SearchStudent[]>(
    []
  );
  const [campus, setCampus] = useState(
    searchParams.get("institute") || "Kolkata"
  );

  const [selectedIssueToInfo, setSelectedIssueToInfo] =
    useState<SearchStudent | null>(null);

  const [assignBookAndCourse, setAssignBookAndCourse] = useState<TCourseBookInfo[]>([]);

  const [issueDate, setIssueDate] = useState("");

  const [inputs, setInputs] = useState<number[]>([]);

  const { isFetching } = useQuery<ISuccess<SearchStudent[]>>({
    queryKey: ["get-students-with-course-or-faculty", studentNameQuery],
    queryFn: () => searchStudent(studentNameQuery || "", assignTo, campus),
    enabled: studentNameQuery !== null,
    onSuccess(data) {
      setIssueToSuggestion(data.data);
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
    const ids: any = {};
    if (assignTo === "Student") {
      ids.student_id = selectedIssueToInfo?.student_id;
    } else {
      ids.employee_id = selectedIssueToInfo?.id;
    }

    const noBookIndex = assignBookAndCourse.findIndex(item => item.book_id <= 0);
    
    let finalCourseAndBookInfo : TCourseBookInfo[] = [];
    if(noBookIndex !== -1) {
      const preState = [...assignBookAndCourse];
      preState.splice(noBookIndex, 1);
      finalCourseAndBookInfo = preState;
    } else {
      finalCourseAndBookInfo = assignBookAndCourse;
    }

    mutate({
      apiPath: "/library/physical/issue-book",
      method: "post",
      formData: {
        ...ids,
        issue_date: issueDate,
        institute: campus,
        info: finalCourseAndBookInfo.map((item) => ({
          course_id: item?.course_id,
          phy_lib_book_id: item.book_id,
        })),
      },
      onSuccess() {
        dispatch(setDialog({ type: "CLOSE", dialogId: "" }));
        queryClient.invalidateQueries(["get-issue-book-report"]);
      },
    });
  };

  return (
    <DialogBody className="min-w-[45rem] max-h-[90vh] overflow-y-auto">
      <h2 className="font-semibold text-lg">Issue Book to Student</h2>

      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            setAssignTo("Student");
            setIssueToSuggestion([]);
          }}
          className="text-sm space-x-2 *:cursor-pointer"
        >
          <input
            checked={assignTo === "Student"}
            type="radio"
            id="to_student"
          />
          <label htmlFor="to_student" className="font-medium">
            To Student
          </label>
        </button>
        <button
          onClick={() => {
            setAssignTo("Faculty");
            setIssueToSuggestion([]);
            setAssignBookAndCourse([]);
          }}
          className="text-sm space-x-2 *:cursor-pointer"
        >
          <input
            checked={assignTo === "Faculty"}
            type="radio"
            id="to_faculty"
          />
          <label htmlFor="to_faculty" className="font-medium">
            To Faculty
          </label>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <DropDown
          onChange={(option) => {
            setIssueToSuggestion([]);
            setCampus(option.value);
          }}
          name="institute"
          label="Campus *"
          options={[
            { text: "Kolkata", value: "Kolkata" },
            { text: "Faridabad", value: "Faridabad" },
          ]}
          defaultValue={campus}
        />
        <Input
          label={`Search ${assignTo} *`}
          name="student_id"
          placeholder={`Type ${assignTo} Name`}
          onChange={(e) => debouncedSearchStudent(e.currentTarget.value)}
          suggestionOptions={
            issueToSuggestion?.map((ePeople) => ({
              text: ePeople.name,
              value: assignTo === "Student" ? ePeople.student_id : ePeople.id,
            })) || []
          }
          suggestionLoading={isFetching}
          onSuggestionItemClick={(option) => {
            setSelectedIssueToInfo(
              issueToSuggestion.filter((item) =>
                assignTo === "Student"
                  ? item.student_id
                  : item.id === option.value
              )[0]
            );
            setIssueToSuggestion([]);
          }}
        />
        <DateInput
          onChange={(value) => setIssueDate(value)}
          label="Issue Date *"
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

        {inputs.map((input, index) => (
          <AssignBookListItem
            required
            key={input}
            input={input}
            onDeleteBtnClick={() => {
              setInputs((preState) =>
                preState.filter((eachInput) => eachInput !== input)
              )

              const preState = [...assignBookAndCourse];
              preState.splice(index, 1);
              setAssignBookAndCourse(preState);
            }
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
            courses={selectedIssueToInfo?.enrolled_courses || []}
            assignTo={assignTo}
          />
        ))}
      </>

      <Button loading={isLoading} disabled={isLoading} onClick={submitForm}>
        Save Info
      </Button>
    </DialogBody>
  );
}
