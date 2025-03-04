import { TTimeTableParseData } from "@/types";
import Image from "next/image";
import React from "react";

interface IProps {
  parseData: TTimeTableParseData[];
  value: string;
  rowIndex: number;
  colIndex: number;
}

export default function TimeTableReportCell({
  parseData,
  rowIndex,
  value,
  colIndex,
}: IProps) {
  return (
    <div className="w-full bg-[#D6CEFF] py-3 px-3 rounded-md relative overflow-hidden group/edit flex items-center">
      <div className="size-8 border border-white rounded-full overflow-hidden">
        <Image
          className="size-full object-cover"
          src={parseData[rowIndex]?.faculty[colIndex - 1]?.profile_image || "/placeholder_image.jpg"}
          alt="Faculty Image"
          height={32}
          width={32}
          quality={100}
        />
      </div>
      <div
        className="flex flex-col px-3"
      >
        <h2>{value}</h2>
        <h3>
          {parseData[rowIndex]?.faculty[colIndex - 1]?.faculty_name || ""}
        </h3>
      </div>
    </div>
  );
}
