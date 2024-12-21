"use client";

import { HiOutlineDotsVertical } from "react-icons/hi";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import FileFolderMoreOption from "./FileFolderMoreOption";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { ISuccess, TFile, TFileFolderOptionAction } from "@/types";

import {
  FaRegFileImage,
  FaFilePdf,
  FaFileCsv,
  FaFileWord,
  FaFileExcel,
  FaFileVideo,
  FaFileAudio,
  FaFileArchive,
  FaFileAlt,
  FaRegFile,
} from "react-icons/fa";
import { queryClient } from "@/redux/MyProvider";
import { axiosQuery } from "@/utils/axiosQuery";
import { BASE_API } from "@/app/constant";
import { toast } from "react-toastify";

interface IProps {
  fileInfo: TFile;
}

const fileImageIcons: any = {
  "image/jpeg": {
    icon: <FaRegFileImage />,
    image: "",
  },
  "image/png": {
    icon: <FaRegFileImage />,
    image: "",
  },
  "image/gif": {
    icon: <FaRegFileImage />,
    image: "",
  },
  "image/bmp": {
    icon: <FaRegFileImage />,
    image: "",
  },
  "image/svg+xml": {
    icon: <FaRegFileImage />,
    image: "",
  },
  "image/webp": {
    icon: <FaRegFileImage />,
    image: "",
  },
  "image/vnd.microsoft.icon": {
    icon: <FaRegFileImage />,
    image: "",
  },
  "application/pdf": {
    icon: <FaFilePdf className="text-red-600" />,
    image: "",
  },
  "text/csv": {
    icon: <FaFileCsv />,
    image: "",
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    icon: <FaFileWord className="text-[#188FEB]" />,
    image: "",
  },
  "application/vnd.ms-excel": {
    icon: <FaFileExcel className="text-[#1C6C40]" />,
    image: "",
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    icon: <FaFileExcel className="text-[#1C6C40]" />,
    image: "",
  },
  "video/mp4": {
    icon: <FaFileVideo />,
    image: "",
  },
  "video/webm": {
    icon: <FaFileVideo />,
    image: "",
  },
  "audio/mpeg": {
    icon: <FaFileAudio />,
    image: "",
  },
  "audio/wav": {
    icon: <FaFileAudio />,
    image: "",
  },
  "audio/ogg": {
    icon: <FaFileAudio />,
    image: "",
  },
  "application/zip": {
    icon: <FaFileArchive />,
    image: "",
  },
  "application/x-7z-compressed": {
    icon: <FaFileArchive />,
    image: "",
  },
  "application/x-tar": {
    icon: <FaFileArchive />,
    image: "",
  },
  "application/vnd.rar": {
    icon: <FaFileArchive />,
    image: "",
  },
  "text/plain": {
    icon: <FaFileAlt />,
    image: "",
  },
  "application/json": {
    icon: <FaRegFile />,
    image: "",
  },
  "application/xml": {
    icon: <FaRegFile />,
    image: "",
  },
  "application/octet-stream": {
    icon: <FaRegFile />,
    image: "",
  },
  "application/javascript": {
    icon: <FaRegFile />,
    image: "",
  },
  "application/msword": {
    icon: <FaFileWord />,
    image: "",
  },
  "application/vnd.ms-powerpoint": {
    icon: <FaRegFile />,
    image: "",
  },
  "application/vnd.oasis.opendocument.text": {
    icon: <FaRegFile />,
    image: "",
  },
  "application/vnd.oasis.opendocument.spreadsheet": {
    icon: <FaRegFile />,
    image: "",
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    icon: <FaRegFile />,
    image: "",
  },
  "application/x-sh": {
    icon: <FaRegFile />,
    image: "",
  },
  "application/x-bzip2": {
    icon: <FaFileArchive />,
    image: "",
  },
  "audio/midi": {
    icon: <FaFileAudio />,
    image: "",
  },
  "text/html": {
    icon: <FaRegFile />,
    image: "",
  },
  "application/rtf": {
    icon: <FaRegFile />,
    image: "",
  },
  "application/vnd.mozilla.xul+xml": {
    icon: <FaRegFile />,
    image: "",
  },
  "application/x-font-woff": {
    icon: <FaRegFile />,
    image: "",
  },
  "font/woff2": {
    icon: <FaRegFile />,
    image: "",
  },
  "font/otf": {
    icon: <FaRegFile />,
    image: "",
  },
  "font/ttf": {
    icon: <FaRegFile />,
    image: "",
  },
  "font/woff": {
    icon: <FaRegFile />,
    image: "",
  },
  "text/markdown": {
    icon: <FaRegFile />,
    image: "",
  },
  "application/x-apple-diskimage": {
    icon: <FaFileArchive />,
    image: "",
  },
  "application/x-csh": {
    icon: <FaRegFile />,
    image: "",
  },
};

export default function FileItem({ fileInfo }: IProps) {
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const modalRef = useRef<HTMLLIElement>(null);

  const dispatch = useDispatch();

  const handleMoreOptionOpen = () => {
    setIsOptionOpen(true);
  };

  const checkClickOutside = (event: MouseEvent) => {
    if (isOptionOpen && !modalRef.current?.contains(event.target as Node)) {
      setIsOptionOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", checkClickOutside);

    return () => document.removeEventListener("click", checkClickOutside);
  }, [isOptionOpen]);

  const handleOptionClick = async (action: TFileFolderOptionAction) => {
    if (action === "open") {
      window.open(fileInfo.file_url);
      return;
    }

    if (action === "rename") {
      dispatch(
        setDialog({
          type: "OPEN",
          dialogId: "rename-file-or-folder",
          extraValue: {
            type: "File",
            folder_file_id: fileInfo.file_id,
            oldFileOrFolderName: fileInfo.file_name,
          },
        })
      );
    }

    if (action === "delete") {
      dispatch(setDialog({ type: "OPEN", dialogId: "progress-dialog" }));

      const { response, error } = await axiosQuery<ISuccess, ISuccess>({
        url: `${BASE_API}/storage/file/${fileInfo.file_id}`,
        method: "delete",
      });

      dispatch(setDialog({ type: "CLOSE", dialogId: "progress-dialog" }));
      if (error) {
        return toast.error(error.message);
      }

      queryClient.refetchQueries(["fetch-files-and-folders"]);

      toast.success(response?.message);
      return;
    }
  };

  return (
    <li
      ref={modalRef}
      className="bg-[#F0F4F9] p-3 space-y-2 rounded-lg relative"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* <AiOutlineFileText /> */}
          {fileImageIcons[fileInfo.file_type] ? (
            fileImageIcons[fileInfo.file_type].icon
          ) : (
            <FaRegFile />
          )}
          <span className="text-sm line-clamp-1 w-full overflow-hidden break-all whitespace-normal">
            {fileInfo.file_name}
          </span>
        </div>
        <HiOutlineDotsVertical
          onClick={handleMoreOptionOpen}
          className="cursor-pointer"
        />
      </div>

      <div className="w-full h-fit overflow-hidden rounded-xl">
        {fileInfo.file_type.includes("image") ? (
          <Image
            className="size-full object-cover"
            src={fileInfo.file_url}
            alt="File Image"
            height={1200}
            width={1200}
          />
        ) : null}
      </div>

      {isOptionOpen ? (
        <FileFolderMoreOption
          handleOptionClick={handleOptionClick}
          className="!top-8"
        />
      ) : null}
    </li>
  );
}
