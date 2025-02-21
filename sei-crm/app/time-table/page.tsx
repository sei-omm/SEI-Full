"use client";

import Button from "@/components/Button";
import DateInput from "@/components/DateInput";
import DropDown from "@/components/DropDown";
import React, { useRef, useState } from "react";
import { stickyFirstCol } from "../utils/stickyFirstCol";
import { useQuery } from "react-query";
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import axios from "axios";
import { BASE_API, TIME_PERIOD } from "../constant";
import { ISuccess, TTimeTableData } from "@/types";
import HandleSuspence from "@/components/HandleSuspence";
import TimeTableCell from "@/components/TimeTableCell";
import BackBtn from "@/components/BackBtn";
import { useDoMutation } from "../utils/useDoMutation";

type TTable = {
  heads: string[];
  body: string[][];
};

type DraftResponse = {
  draft_id: number;
  info: string;
  date: string;
};

type TServerResponse = {
  type: "generated" | "draft";
  result: TTimeTableData[] | DraftResponse;
};

// const times = [
//   "09:30 am - 10:30 am",
//   "10:30 am - 11:30 am",
//   "11:45 am - 12:45 pm",
//   "01:15 pm - 02:15 pm",
//   "02:15 pm - 03:15 pm",
//   "03:30 pm - 04:30 pm",
//   "04:30 pm - 05:30 pm",
//   "05:30 pm - 06:30 pm",
// ];

async function generateTimeTable(searchParams: ReadonlyURLSearchParams) {
  return (
    await axios.get(`${BASE_API}/course/time-table?${searchParams.toString()}`)
  ).data;
}

export default function TimeTable() {
  const searchParams = useSearchParams();
  const route = useRouter();
  const [tableDatas, setTableData] = useState<TTable>({
    heads: ["Course Name", ...TIME_PERIOD],
    body: [],
  });

  const [serverData, setServerData] = useState<TTimeTableData[] | undefined>(
    undefined
  );

  const {
    // data: serverData,
    isFetching,
    error,
  } = useQuery<ISuccess<TServerResponse>>({
    queryKey: ["generate-time-table", searchParams.toString()],
    queryFn: () => generateTimeTable(searchParams),
    onSuccess(data) {
      if (data.data.type === "generated") {
        const finalResult = data.data.result as TTimeTableData[];

        setTableData((preState) => ({
          ...preState,
          body: finalResult.map((item) => [
            item.course_name,
            // ...item.subjects.map((subject) => subject),
            ...[1, 2, 3, 4, 5, 6, 7, 8].map(
              (_, index) => item.subjects[index] || "Choose Subject"
            ),
          ]),
        }));
        setServerData(finalResult);
      } else {
        const finalResult = data.data.result as DraftResponse;
        const parseData = JSON.parse(finalResult.info) as {
          facultiDraf: any;
          subjectDraf: any;
          tableInfoDraf: TTimeTableData[];
        };

        selectedSubjects.current = parseData.subjectDraf;
        selectedFaculties.current = parseData.facultiDraf;

        setTableData((preState) => ({
          ...preState,
          body: parseData.tableInfoDraf.map((item, rowIndex) => [
            item.course_name,
            ...[1, 2, 3, 4, 5, 6, 7, 8].map(
              (_, colIndex) =>
                parseData.subjectDraf[`${rowIndex}${colIndex + 1}`] ||
                item.subjects[colIndex] ||
                "Choose Subject"
            ),
          ]),
        }));

        setServerData(parseData.tableInfoDraf);
      }
    },
    refetchOnMount: true,
    enabled: searchParams.size !== 0,
  });

  const formRef = useRef<HTMLFormElement>(null);

  const handleTimeTableGeneratorBtn = (formData: FormData) => {
    route.push(
      `/time-table?institute=${formData.get("institute")}&date=${formData.get(
        "date"
      )}`
    );
  };

  const { isLoading, mutate } = useDoMutation();
  const { isLoading: isSavingDraft, mutate: saveToDraft } = useDoMutation();

  const handleFullForm = (formData: FormData) => {
    // const datasToStore: any[] = [];
    // let currentCourseId = -1;

    // let trackIndex = 0;
    // let obj: any = {};
    // let getTimeIndex = 0;

    // formData.forEach((value, key) => {
    // if (key === "course_id") {
    //   currentCourseId = parseInt(value.toString());
    //   // getTimeIndex = 0;
    //   return;
    // }

    //   if (trackIndex >= 1) {
    //     trackIndex = 0;
    //     obj["date"] = searchParams.get("date");
    //     obj["institute"] = searchParams.get("institute");
    //     obj["course_id"] = currentCourseId;
    //     obj[key] = value === "Not Selected" ? null : value;
    //     // obj["time"] = times[getTimeIndex];
    //     datasToStore.push(obj);
    //     obj = {};
    //     return;
    //   }

    //   obj["institute"] = searchParams.get("institute");
    //   obj["date"] = searchParams.get("date");
    //   obj["course_id"] = currentCourseId;
    //   obj[key] = value;

    //   trackIndex++;
    //   // getTimeIndex++;
    // });
    // mutate({
    //   apiPath: "/course/time-table",
    //   method: "post",
    //   formData: datasToStore,
    // });

    if (!confirm("Once Saved You can't edit it latter. Are you sure?")) return;

    const userInput = prompt(`Type "Yes" If You Want To Save It In Database`);
    if (userInput !== "Yes") return;

    type TCobj = {
      course_name: string;
      subjects: string[];
      faculty: {
        profile_image: string;
        faculty_name: string;
      }[];
    };

    const dataIWant: TCobj[] = [];

    let objToStore: TCobj = {
      course_name: "",
      subjects: [],
      faculty: [],
    };

    let currentFacultyIndex = 0;
    let loopIndex = 0;

    const faculty_ids: number[] = [];

    formData.forEach((value, key) => {
      const valueString = value.toString();
      if (key === "course_name") {
        if (loopIndex !== 0) {
          dataIWant.push(objToStore);
          objToStore = {
            course_name: "",
            subjects: [],
            faculty: [],
          };
          currentFacultyIndex = 0;
        }
        objToStore.course_name = valueString;
        return;
      }

      if (key === "subject_name") {
        objToStore.subjects.push(valueString);
      }

      if (key === "faculty_profile_image") {
        objToStore.faculty.push({
          faculty_name: "",
          profile_image: valueString,
        });
      }

      if (key === "employee_name") {
        objToStore.faculty[currentFacultyIndex].faculty_name = valueString;
        currentFacultyIndex++;
      }

      if (key === "faculty_id") {
        if (valueString !== "") {
          faculty_ids.push(parseInt(valueString));
        }
      }
      loopIndex++;
    });

    dataIWant.push(objToStore);
    objToStore = {
      course_name: "",
      subjects: [],
      faculty: [],
    };

    mutate({
      apiPath: "/course/time-table",
      method: "post",
      formData: {
        date: searchParams.get("date"),
        institute: searchParams.get("institute"),
        faculty_ids: faculty_ids,
        time_table_data: JSON.stringify(dataIWant),
      },
    });
  };

  const selectedSubjects = useRef<any>({});
  const selectedFaculties = useRef<any>({});

  const handleDraftButton = () => {
    saveToDraft({
      apiPath: "/course/time-table/draft",
      method: "post",
      formData: {
        date: searchParams.get("date"),
        info: JSON.stringify({
          tableInfoDraf: serverData,
          subjectDraf: selectedSubjects.current,
          facultiDraf: selectedFaculties.current,
        }),
        institute: searchParams.get("institute"),
      },
    });
  };

  return (
    <section className="h-screen w-full p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-2xl">Time Table</h2>
          <p className="text-sm text-gray-600">SEI Educational Trust</p>
        </div>
        <form
          action={handleTimeTableGeneratorBtn}
          className="flex items-end gap-3"
        >
          <DropDown
            name="institute"
            label="Choose Campus *"
            options={[
              {
                text: "Kolkata",
                value: "Kolkata",
              },
              {
                text: "Faridabad",
                value: "Faridabad",
              },
            ]}
            defaultValue={searchParams.get("institute") || "Kolkata"}
          />
          <DateInput
            required
            name="date"
            label="Choose Date *"
            date={searchParams.get("date")}
          />
          <Button className="mb-[0.45rem]">Generate</Button>
        </form>
      </div>

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={serverData?.length}
        noDataMsg="Not Able To Generate Any Time Table"
      >
        <form
          ref={formRef}
          action={handleFullForm}
          className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black card-shdow rounded-xl"
        >
          <table className="min-w-max w-full table-auto">
            <thead className="uppercase w-full border-b border-gray-100">
              <tr>
                {tableDatas.heads.map((item, index) => (
                  <th
                    className={`text-left text-[14px] font-semibold pb-2 px-5 py-4 ${stickyFirstCol(
                      index
                    )}`}
                    key={item}
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableDatas.body.map((itemArray, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-100 group/bodyitem">
                  {itemArray.map((value, columnIndex) => (
                    <td
                      className={`text-left text-[14px] py-3 px-5 space-x-3 relative ${stickyFirstCol(
                        columnIndex
                      )}`}
                      key={`${rowIndex}${columnIndex}`}
                    >
                      {columnIndex !== 0 ? (
                        <TimeTableCell
                          disabled={isSavingDraft}
                          serverData={serverData}
                          value={value}
                          rowIndex={rowIndex}
                          colIndex={columnIndex}
                          selectedSubjects={selectedSubjects.current}
                          selectedFaculties={selectedFaculties.current}
                        />
                      ) : (
                        <>
                          <input
                            hidden
                            name="course_name"
                            value={serverData?.[rowIndex].course_name}
                          />
                          {value}
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </form>
      </HandleSuspence>

      <div className="w-full flex items-center justify-between pb-10">
        <BackBtn btnText="Back To Dashboard" customRoute="/dashboard" />
        {searchParams.size === 0 ? null : (
          <div className="flex items-center gap-3">
            <Button
              disabled={isSavingDraft}
              loading={isSavingDraft}
              onClick={handleDraftButton}
            >
              Save As Draft
            </Button>
            <Button
              loading={isLoading}
              disabled={isLoading || isSavingDraft}
              onClick={() => {
                formRef.current?.requestSubmit();
              }}
            >
              Save To Database
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
