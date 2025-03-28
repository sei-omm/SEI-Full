"use client";

import { BASE_API } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Button from "@/components/Button";
import Campus from "@/components/Campus";
import ChooseFileInput from "@/components/ChooseFileInput";
import { usePurifyCampus } from "@/hooks/usePurifyCampus";
import { ISuccess } from "@/types";
import axios from "axios";
import Link from "next/link";
import React, { useState } from "react";
import { useQuery } from "react-query";
import * as XLSX from "xlsx";

interface Holiday {
  holiday_name: string;
  holiday_date: string | null;
  holiday_year: number | null;
}

type HolidayRes = {
  holiday_id: number;
  holiday_name: string;
  holiday_date: string;
  holiday_year: string;
  institute: string;
};

type THolidayList = {
  faridabad: HolidayRes[];
  kolkata: HolidayRes[];
};

type TTable = {
  heads: string[];
  body: string[][];
};

const HolidayManagement = () => {
  const [excelData, setExcelData] = useState<any[]>([]);
  // const [institute, setInstitute] = useState("Kolkata");
  const { campus, setCampus } = usePurifyCampus(undefined);

  const [tableDatasKolkata, setTableDatasKolkata] = useState<TTable>({
    heads: ["Holiday Name", "Holiday Date"],
    body: [],
  });

  const [tableDatasFaridabad, setTableDatasFaridabad] = useState<TTable>({
    heads: ["Holiday Name", "Holiday Date"],
    body: [],
  });

  const handleFileUpload = (file: File): void => {
    if (!file) return;

    const reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onload = (e) => {
      const data = e.target?.result as string;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false });

      const formattedData: Holiday[] = jsonData.map((row) => {
        let holidayDate: string | null = null;

        if (row["Holiday Date"]) {
          const excelDate = row["Holiday Date"];
          if (!isNaN(excelDate)) {
            // Convert Excel serial date to JavaScript Date
            const jsDate = XLSX.SSF.parse_date_code(excelDate);
            holidayDate = `${String(jsDate.d).padStart(2, "0")}-${String(
              jsDate.m
            ).padStart(2, "0")}-${jsDate.y}`;
          } else {
            // If already in string format, use it directly
            holidayDate = new Date(excelDate)
              .toLocaleDateString("en-GB")
              .replace(/\//g, "-");
          }
        }

        return {
          holiday_name: row["Holiday Name"],
          holiday_date: holidayDate,
          holiday_year: row["Holiday Year"]
            ? Number(row["Holiday Year"])
            : null,
        };
      });

      setExcelData(formattedData);
    };
  };

  const { isLoading, mutate } = useDoMutation();
  const handleUploadBtn = () => {
    if (excelData.length === 0)
      return alert("Please Choose You Holiday List File");

    if (!confirm("Are you sure you want to upload")) return;

    mutate({
      apiPath: "/holiday/add",
      method: "post",
      formData: {
        campus,
        holiday_list: excelData,
      },
    });
  };

  useQuery<ISuccess<THolidayList>>({
    queryKey: "get-holiday-list",
    queryFn: async () => (await axios.get(`${BASE_API}/holiday`)).data,
    onSuccess(data) {
      setTableDatasKolkata((preState) => ({
        ...preState,
        body: data.data.kolkata.map((item) => [
          item.holiday_name,
          item.holiday_date,
        ]),
      }));
      setTableDatasFaridabad((preState) => ({
        ...preState,
        body: data.data.faridabad.map((item) => [
          item.holiday_name,
          item.holiday_date,
        ]),
      }));
    },
  });
  return (
    <div className="w-full space-y-10">
      <div>
        <div className="flex items-end gap-5 w-full">
          <div className="flex-grow flex items-center gap-4 *:flex-grow">
            <div>
              <ChooseFileInput
                accept=".xls, .xlsx"
                id="excel_file"
                onFilePicked={(file) => handleFileUpload(file)}
                label="Choose Holiday Management Excel File"
                fileName="Choose Holiday Management Excel File"
                onFileDelete={() => {
                  setExcelData([]);
                }}
                disableUpload
              />
            </div>
            <div className="mt-2">
              {/* <DropDown
                onChange={(option) => {
                  setInstitute(option.value);
                }}
                name="institute"
                label="Choose Campus"
                options={[
                  { text: "Kolkata", value: "Kolkata" },
                  { text: "Faridabad", value: "Faridabad" },
                ]}
              /> */}
              <Campus
                onChange={(option) => {
                  setCampus(option.value);
                }}
              />
            </div>
          </div>
          <div className="flex-grow-0 pb-1">
            <Button
              disabled={isLoading}
              loading={isLoading}
              onClick={handleUploadBtn}
            >
              Upload
            </Button>
          </div>
        </div>
        <Link
          className="text-sm text-blue-500 font-medium cursor-pointer"
          href="/HolidayManagement.xlsx"
          target="__blank"
        >
          Download Excel Format
        </Link>
      </div>
      <div className="flex items-start gap-5 *:flex-grow">
        <div className="space-y-5">
          <h2 className="font-semibold text-gray-500">Kolkata Holiday List</h2>
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black card-shdow rounded-xl">
            <table className="min-w-max w-full table-auto">
              <thead className="uppercase w-full border-b border-gray-100">
                <tr>
                  {tableDatasKolkata.heads.map((item) => (
                    <th
                      className="text-left text-[14px] font-semibold pb-2 px-5 py-4"
                      key={item}
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableDatasKolkata.body.map((itemArray, index) => (
                  <tr key={index} className="hover:bg-gray-100 group/bodyitem">
                    {itemArray.map((value, colIndex) => (
                      <td
                        className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                        key={value}
                      >
                        <span className="line-clamp-1 inline-flex gap-x-3">
                          {colIndex === 1 ? beautifyDate(value) : value}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          <h2 className="font-semibold text-gray-500">
            Faridabad Holiday List
          </h2>
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black card-shdow rounded-xl">
            <table className="min-w-max w-full table-auto">
              <thead className="uppercase w-full border-b border-gray-100">
                <tr>
                  {tableDatasFaridabad.heads.map((item) => (
                    <th
                      className="text-left text-[14px] font-semibold pb-2 px-5 py-4"
                      key={item}
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableDatasFaridabad.body.map((itemArray, index) => (
                  <tr key={index} className="hover:bg-gray-100 group/bodyitem">
                    {itemArray.map((value, colIndex) => (
                      <td
                        className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                        key={value}
                      >
                        <span className="line-clamp-1 inline-flex gap-x-3">
                          {colIndex === 1 ? beautifyDate(value) : value}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolidayManagement;
