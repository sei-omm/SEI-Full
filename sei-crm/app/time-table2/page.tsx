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
import { ISuccess, TTimeTableData, TVTableData } from "@/types";
import HandleSuspence from "@/components/HandleSuspence";
import TimeTableCell from "@/components/TimeTableCell";
import BackBtn from "@/components/BackBtn";
import { useDoMutation } from "../utils/useDoMutation";
import { AiOutlineDelete } from "react-icons/ai";

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

  const [duplicateCell, setDuplicateCell] = useState<any>({});

  const [vTable, setVTable] = useState<Map<string, TVTableData> | undefined>(
    undefined
  );

  const {
    data: sResponse,
    isFetching,
    error,
  } = useQuery<ISuccess<TServerResponse>>({
    queryKey: ["generate-time-table", searchParams.toString()],
    queryFn: () => generateTimeTable(searchParams),
    onSuccess(data) {
      if (data.data.type === "generated") {
        const finalResult = data.data.result as TTimeTableData[];
        const map = new Map<string, TVTableData>();

        setTableData((preState) => ({
          ...preState,
          body: finalResult.map((item, rowIndex) => [
            item.course_name,
            ...[1, 2, 3, 4, 5, 6, 7, 8].map((_, colIndex) => {
              const cSubject = item.subjects[colIndex];
              const fFaculty = item.faculty.filter(
                (item) => item.for_subject_name === cSubject
              )[0];
              map.set(`${rowIndex}:${colIndex}`, {
                course_code: item.course_code,
                course_name: item.course_name,
                course_id: item.course_id,

                faculties: item.faculty,
                subjects: item.subjects,
                selected_faculty_id: fFaculty?.faculty_id || -1,
                selected_subject: cSubject,
              });
              return cSubject || "Off Period";
            }),
          ]),
        }));

        setVTable(map);

        setServerData(finalResult);
      } else {
        const finalResult = data.data.result as DraftResponse;
        const map = new Map<string, TVTableData>(
          Object.entries(JSON.parse(finalResult.info))
        );
        const parseServerResult: TTimeTableData[] = [];

        let currentCourseId = -1;

        map.forEach((value) => {
          if (currentCourseId !== value.course_id) {
            currentCourseId = value.course_id;
            parseServerResult.push({
              course_code: value.course_code,
              course_id: value.course_id,
              course_name: value.course_name,
              faculty: value.faculties,
              subjects: value.subjects,
            });
          }
        });

        setTableData((prev) => ({
          ...prev,
          body: parseServerResult.map((item, rowIndex) => [
            item.course_name,
            ...[1, 2, 3, 4, 5, 6, 7, 8].map((_, colIndex) => {
              return (
                map.get(`${rowIndex}:${colIndex}`)?.selected_subject ||
                item.subjects[colIndex] ||
                "Off Period"
              );
            }),
          ]),
        }));

        setVTable(map);
        setServerData(parseServerResult);
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
      console.log(key, " : ", value);
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
        objToStore.faculty[currentFacultyIndex].faculty_name =
          valueString === "Choose Faculty" ? "" : valueString;
        currentFacultyIndex++;
      }

      if (key === "faculty_id") {
        if (valueString !== "" && valueString !== "Choose Faculty") {
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

  const handleDraftButton = () => {
    // return console.log(vTable);
    saveToDraft({
      apiPath: "/course/time-table/draft",
      method: "post",
      formData: {
        date: searchParams.get("date"),
        info: JSON.stringify(Object.fromEntries(vTable || new Map())),
        institute: searchParams.get("institute"),
      },
    });
  };

  const { isLoading: isRemovingFromDraft, mutate: removeDraft } =
    useDoMutation();
  const filterFormRef = useRef<HTMLFormElement>(null);
  const handleRemoveFromDraft = () => {
    if (!confirm("Are you sure you want to remove and regenerate ?")) return;
    removeDraft({
      apiPath: "/course/time-table/draft",
      method: "delete",
      id: (sResponse?.data.result as any).draft_id,
      onSuccess() {
        route.refresh();
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
          ref={filterFormRef}
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
                      )} ${columnIndex === 0 ? "max-w-96" : ""}`}
                      key={`${rowIndex}${columnIndex}`}
                    >
                      {columnIndex !== 0 ? (
                        <TimeTableCell
                          disabled={isSavingDraft}
                          serverData={serverData}
                          value={value}
                          rowIndex={rowIndex}
                          colIndex={columnIndex}
                          duplicateCell={duplicateCell}
                          setDuplicateCell={setDuplicateCell}
                          setVTable={setVTable}
                          vTable={vTable}
                        />
                      ) : (
                        <>
                          <input
                            hidden
                            name="course_name"
                            value={serverData?.[rowIndex].course_name}
                          />
                          <span>{value}</span>
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
            {sResponse?.data.type === "draft" && (
              <Button
                className="bg-red-500 flex items-center gap-2"
                disabled={isLoading || isSavingDraft || isRemovingFromDraft}
                loading={isRemovingFromDraft}
                onClick={handleRemoveFromDraft}
              >
                <AiOutlineDelete />
                Remove Draft & Regenerate
              </Button>
            )}
            <Button
              disabled={isLoading || isSavingDraft || isRemovingFromDraft}
              loading={isSavingDraft}
              onClick={handleDraftButton}
            >
              Save As Draft
            </Button>
            <Button
              loading={isLoading}
              disabled={isLoading || isSavingDraft || isRemovingFromDraft}
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
