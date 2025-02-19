import React, { useCallback, useState } from "react";
import Input from "../Input";
import { AiOutlineDelete } from "react-icons/ai";
import { BASE_API } from "@/app/constant";
import axios from "axios";
import { useQuery } from "react-query";
import { Books, ISuccess } from "@/types";
import _ from "lodash";
import DropDown from "../DropDown";

async function searchBook(book_name: string) {
  return (
    await axios.get(`${BASE_API}/library/physical/books?book_name=${book_name}`)
  ).data;
}

interface Course {
  course_id: number;
  course_name: string;
}

interface IProps {
  onDeleteBtnClick?: () => void;
  input: number;
  required: boolean;
  onBookAndCourseSelect: (book_id: number, course_id: number) => void;
  courses: Course[];
}

export default function AssignBookListItem({
  onDeleteBtnClick,
  input,
  required,
  onBookAndCourseSelect,
  courses,
}: IProps) {
  const [bookSuggestions, setBookSuggestions] = useState<Books[]>([]);
  const [bookNameQuery, setBookNameQuery] = useState<string | null>(null);

  const [currentCourse, setCurrentCourse] = useState(null);
  const [currentBookId, setCurrentBookId] = useState(-1);

  // Debounced function for student search
  const debouncedSearchBooks = useCallback(
    _.debounce((searchTerm) => {
      setBookNameQuery(searchTerm);
    }, 500), // 500ms delay
    []
  );

  const { isFetching: isBookSearching } = useQuery<ISuccess<Books[]>>({
    queryKey: [`get-lib-book-info ${input}`, bookNameQuery],
    queryFn: () => searchBook(bookNameQuery || ""),
    enabled: bookNameQuery !== null,
    onSuccess(data) {
      setBookSuggestions(data.data);
    },
  });

  return (
    <div className="flex items-end gap-3 w-full">
      <div className="flex-grow">
        <Input
          required={required}
          label="Search Book"
          placeholder="Type Book Name"
          onChange={(e) => debouncedSearchBooks(e.currentTarget.value)}
          suggestionOptions={
            bookSuggestions.map((eachItem) => ({
              text: `${eachItem.book_name} - ${eachItem.edition}`,
              value: eachItem.phy_lib_book_id,
            })) || []
          }
          suggestionLoading={isBookSearching}
          onSuggestionItemClick={(option) => {
            setCurrentBookId(option.value);
            setBookSuggestions([]);
            onBookAndCourseSelect(option.value, currentCourse || courses[0]?.course_id);
          }}
          onClickOutSide={() => {
            setBookSuggestions([]);
          }}
        />
      </div>

      <div className="flex-grow">
        <DropDown
          onChange={(item) => {
            setCurrentCourse(item.value);
            onBookAndCourseSelect(currentBookId, item.value);
          }}
          label="Choose Course"
          options={courses.map((course) => ({
            text: course.course_name,
            value: course.course_id,
          }))}
          defaultValue={courses[0]?.course_id}
        />
      </div>

      <AiOutlineDelete
        onClick={onDeleteBtnClick}
        className="mb-4 cursor-pointer active:scale-90"
      />
    </div>
  );
}
