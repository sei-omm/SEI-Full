"use client";

import { BASE_API } from "@/app/constant";
import { downloadFromUrl } from "@/app/utils/downloadFromUrl";
import { useRouter } from "next/navigation";
import { FiDownload } from "react-icons/fi";
import { IoIosArrowRoundUp } from "react-icons/io";

interface IProps {
  fileNameOrLink: string;
  allowDownload: boolean;
  libraryItemId: number;
}

function isUrl(text: string) {
  if (text.includes("http://") || text.includes("https://")) {
    return true;
  }

  return false;
}

export default function ViewLibraryBtn({
  fileNameOrLink,
  allowDownload,
  libraryItemId,
}: IProps) {
  const route = useRouter();
  const handleBtnClick = async () => {
    if (isUrl(fileNameOrLink)) return window.open(fileNameOrLink);

    route.push("/view-file/" + fileNameOrLink);
  };

  return (
    <div className="flex items-center gap-4 absolute bottom-3">
      <FiDownload
        onClick={() => {
          downloadFromUrl(BASE_API + "/library/download-file/" + libraryItemId);
        }}
        className={`cursor-pointer active:scale-90 ${
          allowDownload ? "" : "invisible"
        }`}
      />
      <button
        onClick={handleBtnClick}
        className="font-semibold flex items-center gap-2 border active:scale-90 px-5 py-1 rounded-3xl bg-[#E9B858]"
      >
        <span className="font-inter text-xs">View</span>
        <IoIosArrowRoundUp size={20} className="rotate-90" />
      </button>
    </div>
  );
}
