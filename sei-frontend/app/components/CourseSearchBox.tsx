"use client";

import { useEffect, useState } from "react";
import { RxOpenInNewWindow } from "react-icons/rx";
import { BASE_API } from "../constant";
import { IResponse } from "../type";

type SearchResponse = {
  course_id: number;
  course_name: string;
};

export default function CourseSearchBox() {
  const [searchText, setSearchText] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState(searchText);
  const [searchResult, setSearchResult] = useState<SearchResponse[]>([]);

  async function getSearchResult(keyword: string) {
    const response = await fetch(`${BASE_API}/course/search?q=${keyword}`);
    const result = (await response.json()) as IResponse<SearchResponse[]>;
    setSearchResult(result.data);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchText);
    }, 500); // Adjust debounce delay as needed

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  useEffect(() => {
    if (searchText !== null && debouncedQuery !== null) {
      if (debouncedQuery) {
        getSearchResult(searchText);
      } else {
        setSearchResult([]);
      }
    }
  }, [debouncedQuery]);

  return (
    <div className="flex relative items-center basis-96 border border-gray-400 rounded-md bg-[#e9b9582a] w-full pr-3 py-2 px-4">
      <input
        onChange={(e) => setSearchText(e.target.value)}
        className="outline-none w-full bg-transparent"
        placeholder="Search course.."
      />

      {/* <IoIosSearch className="cursor-pointer" /> */}

      <ul
        className={`w-full ${
          searchResult.length === 0 ? "hidden" : "block"
        } absolute rounded-md z-20 overflow-hidden top-12 left-0 right-0 shadow-lg border *:p-3 bg-[#f8f2e5]`}
      >
        {searchResult.map((item) => (
          <li
            key={item.course_id}
            className="hover:bg-gray-200 flex items-center gap-3 cursor-pointer"
          >
            <RxOpenInNewWindow />
            <span className="line-clamp-1">{item.course_name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
