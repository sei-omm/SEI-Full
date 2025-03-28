"use client";

import Button from "@/components/Button";
import DateInput from "@/components/DateInput";
import HandleSuspence from "@/components/HandleSuspence";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { stickyFirstCol } from "../utils/stickyFirstCol";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API, TIME_PERIOD } from "../constant";
import { ISuccess, TFacultyInfo, TVirtualTable } from "@/types";
import BackBtn from "@/components/BackBtn";
import CellTimeTable from "@/components/Course/CellTimeTable";
import { useDoMutation } from "../utils/useDoMutation";
import { AiOutlineDelete } from "react-icons/ai";
import Campus from "@/components/Campus";
import { usePurifySearchParams } from "@/hooks/usePurifySearchParams";

const fetchTimeTableInfo = async (searchParams: URLSearchParams) => {
  return (
    await axios.get(
      `${BASE_API}/course/time-table/v2?${searchParams.toString()}`
    )
  ).data;
};

type TTimeTable = {
  course_id: number;
  course_name: string;
  course_code: string;
  sub_fac: {
    subject_name: string;
    faculty: TFacultyInfo[];
  }[];
};

type TTable = {
  heads: string[];
  body: string[][];
};

export default function TimeTable() {
  const searchParams = usePurifySearchParams();
  const route = useRouter();

  const filterFormRef = useRef<HTMLFormElement>(null);

  const virtual_table = useRef<TVirtualTable | null>(null);

  const [duplicateCell, setDuplicateCell] = useState<Record<
    string,
    boolean
  > | null>(null);

  const [tableDatas, setTableData] = useState<TTable>({
    heads: ["Course Name", ...TIME_PERIOD],
    body: [],
  });

  const handleTimeTableGeneratorBtn = (formData: FormData) => {
    route.push(
      `/time-table?institute=${formData.get("institute")}&date=${formData.get(
        "date"
      )}`
    );
  };

  const { data, error, isFetching } = useQuery<
    ISuccess<{
      time_table_info: TTimeTable[];
      virtual_table: null | string;
      draft_id: number;
    }>
  >({
    queryKey: ["time-table-2", searchParams.toString()],
    queryFn: () => fetchTimeTableInfo(searchParams),
    enabled: searchParams.size > 1,
    onSuccess(data) {
      const parsedVirtualTable = JSON.parse(
        data.data.virtual_table || "{}"
      ) as TVirtualTable;

      if (data.data.draft_id !== -1) {
        //if draft avilable than add draft as virtual table data
        virtual_table.current = parsedVirtualTable;
      }

      setTableData((prev) => ({
        ...prev,
        body: data.data.time_table_info.map((item, rowIndex) => [
          item.course_name,
          ...[1, 2, 3, 4, 5, 6, 7, 8].map((_, colIndex) => {
            if (data.data.draft_id === -1) {
              //if no draft avilable than add the generated data to vertual table
              virtual_table.current = {
                ...virtual_table.current,
                [`${rowIndex}:${colIndex}`]: {
                  fac: item.sub_fac[colIndex]?.faculty[0] || null,
                  subject: item.sub_fac[colIndex]?.subject_name || "Off Period",
                  course_name: item.course_name,
                },
              };
            }

            return item.sub_fac[colIndex]?.subject_name || "Off Period";
          }),
        ]),
      }));
    },
  });

  const { isLoading: isSavingDraft, mutate: saveToDraft } = useDoMutation();

  const handleSaveDraft = () => {
    saveToDraft({
      apiPath: "/course/time-table/draft",
      method: "post",
      formData: {
        date: searchParams.get("date"),
        virtual_table: JSON.stringify(virtual_table.current),
        institute: searchParams.get("institute"),
      },
    });
  };

  const { isLoading: isRemovingDraft, mutate: removeDraft } = useDoMutation();

  const handleDeleteDraft = () => {
    if (!confirm("Are you sure you want to remove and regenerate ?")) return;
    removeDraft({
      apiPath: "/course/time-table/draft",
      method: "delete",
      id: data?.data.draft_id,
      onSuccess() {
        window.location.reload();
      },
    });
  };

  const { isLoading: isSavingToDb, mutate: saveToDb } = useDoMutation();

  const handleSaveToDb = () => {
    if (!confirm("Once Saved You can't edit it latter. Are you sure?")) return;

    const userInput = prompt(`Type "Yes" If You Want To Save It In Database`);
    if (userInput !== "Yes") return;

    saveToDb({
      apiPath: "/course/time-table",
      method: "post",
      formData: {
        date: searchParams.get("date"),
        institute: searchParams.get("institute"),
        time_table_data: JSON.stringify(virtual_table.current),
        total_rows: data?.data.time_table_info.length,
        faculty_ids: Object.entries(virtual_table.current || {})
          .filter(
            (item) => item[1].fac !== null && item[1].fac?.faculty_id !== -1
          )
          .map((item) => item[1].fac?.faculty_id),
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
          {/* <DropDown
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
          /> */}
          <Campus />
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
        dataLength={data?.data?.time_table_info.length}
        noDataMsg="Not Able To Generate Any Time Table"
      >
        <section className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black card-shdow rounded-xl">
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
                        <CellTimeTable
                          key={`CELL${columnIndex}${rowIndex}`}
                          col={columnIndex - 1}
                          row={rowIndex}
                          value={value}
                          facultyInfo={
                            data?.data.time_table_info[rowIndex]?.sub_fac?.[
                              columnIndex - 1
                            ]?.faculty || []
                          }
                          subjectInfo={
                            data?.data.time_table_info[rowIndex].sub_fac.map(
                              (item) => item.subject_name
                            ) || []
                          }
                          time_table_data={data?.data.time_table_info}
                          setDuplicateCell={setDuplicateCell}
                          duplicateCell={duplicateCell}
                          virtual_table={virtual_table.current}
                          from_draft={data?.data.draft_id !== -1}
                        />
                      ) : (
                        <>
                          <span>{value}</span>
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </HandleSuspence>

      <div className="w-full flex items-center justify-between pb-10">
        <BackBtn btnText="Back To Dashboard" customRoute="/dashboard" />
        {searchParams.size === 1 ? null : (
          <div className="flex items-center gap-3">
            {data?.data.draft_id !== -1 && (
              <Button
                loading={isRemovingDraft}
                disabled={isSavingDraft || isRemovingDraft || isSavingToDb}
                className="bg-red-500 flex items-center gap-2"
                onClick={handleDeleteDraft}
              >
                <AiOutlineDelete />
                Remove Draft & Regenerate
              </Button>
            )}
            <Button
              disabled={isSavingDraft || isRemovingDraft || isSavingToDb}
              loading={isSavingDraft}
              onClick={handleSaveDraft}
            >
              Save As Draft
            </Button>
            <Button
              onClick={handleSaveToDb}
              loading={isRemovingDraft}
              disabled={isSavingDraft || isSavingToDb || isRemovingDraft}
            >
              Save To Database
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
