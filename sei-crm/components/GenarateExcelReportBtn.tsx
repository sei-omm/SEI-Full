import React from "react";
// import DownloadFormUrl from "./DownloadFormUrl";
// import { BASE_API } from "@/app/constant";
import Button from "./Button";
import { LuFileSpreadsheet } from "react-icons/lu";
import Link from "next/link";
import { BASE_API } from "@/app/constant";

interface IProps {
  apiPath: string;
  hidden?: boolean;
  text?: string;
}

export default function GenarateExcelReportBtn({
  apiPath,
  hidden,
  text,
}: IProps) {
  return (
    <Link className={hidden ? "hidden" : "inline-block"} href={`${BASE_API}${apiPath}`} target="__blank">
      <Button type="button" className="!bg-[#34A853] flex-center gap-4">
        <LuFileSpreadsheet size={20} />
        {text || "Generate Excel Sheet"}
      </Button>
    </Link>
  );
}

// export default function GenarateExcelReportBtn({ apiPath, hidden, text }: IProps) {
//   return (
//     <DownloadFormUrl
//       className={hidden ? "hidden" : "block"}
//       urlToDownload={BASE_API + apiPath}
//     >
//       <Button type="button" className="!bg-[#34A853] flex-center gap-4">
//         <LuFileSpreadsheet size={20} />
//         {text || "Generate Excel Sheet"}
//       </Button>
//     </DownloadFormUrl>
//   );
// }
