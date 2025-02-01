"use client";

import { useDoMutation } from "@/app/utils/useDoMutation";
import Button from "@/components/Button";
import ChooseFileInput from "@/components/ChooseFileInput";
import React, { useState } from "react";
import * as XLSX from "xlsx";

interface Holiday {
  holiday_name: string;
  holiday_date: string | null;
  holiday_year: number | null;
}

const HolidayManagement = () => {
  const [excelData, setExcelData] = useState<any[]>([]);

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
    if (!confirm("Are you sure you want to upload")) return;

    mutate({
      apiPath: "/holiday/add",
      method: "post",
      formData: excelData,
    });
  };

  // const tableDatas = {
  //   heads: ["Holiday Name", "Holiday Date"],
  //   body: [
  //     ["Somnath Gupta", "12 Jun, 2024"],
  //     ["Arindam Gupta", "12 Jun, 2024"],
  //   ],
  // };

  return (
    <div className="w-full space-y-5">
      <div className="flex items-end gap-5 w-full">
        <div className="flex-grow">
          <ChooseFileInput
            id="excel_file"
            onFilePicked={(file) => handleFileUpload(file)}
            label="Choose Holiday Management Excel File"
            fileName="Choose Holiday Management Excel File"
            disableUpload
          />
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

      {/* <div>
        <h3>Excel Data</h3>
        <pre>{JSON.stringify(excelData, null, 2)}</pre>
      </div> */}
      {/* <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black card-shdow rounded-xl">
        <table className="min-w-max w-full table-auto">
          <thead className="uppercase w-full border-b border-gray-100">
            <tr>
              {tableDatas.heads.map((item) => (
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
            {tableDatas.body.map((itemArray, index) => (
              <tr key={index} className="hover:bg-gray-100 group/bodyitem">
                {itemArray.map((value, childItemIndex) => (
                  <td
                    className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                    key={value}
                  >
                    <span className="line-clamp-1 inline-flex gap-x-3">
                      {value}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
    </div>
  );
};

export default HolidayManagement;
