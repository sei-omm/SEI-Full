"use client";

import React from "react";
import DownloadFormUrl from "./DownloadFormUrl";
import { BASE_API } from "@/app/constant";
import Button from "./Button";
import { LuFileSpreadsheet } from "react-icons/lu";

interface IProps {
  apiPath: string;
  hidden?: boolean;
}

export default function GenarateExcelReportBtn({ apiPath, hidden }: IProps) {
  return (
    <DownloadFormUrl
      className={hidden ? "hidden" : "block"}
      urlToDownload={BASE_API + apiPath}
    >
      <Button type="button" className="!bg-[#34A853] flex-center gap-4">
        <LuFileSpreadsheet size={20} />
        Generate Excel Sheet
      </Button>
    </DownloadFormUrl>
  );
}
