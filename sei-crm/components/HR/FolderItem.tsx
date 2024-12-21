"use client";

import { HiOutlineDotsVertical } from "react-icons/hi";
import { MdOutlineFolder } from "react-icons/md";
import FileFolderMoreOption from "./FileFolderMoreOption";
import { useEffect, useRef, useState } from "react";
import { ISuccess, TFileFolderOptionAction, TFolder } from "@/types";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { queryClient } from "@/redux/MyProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BASE_API } from "@/app/constant";
import { axiosQuery } from "@/utils/axiosQuery";
import { toast } from "react-toastify";

interface IProps {
  folder: TFolder;
}

export default function FolderItem({ folder }: IProps) {
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const modalRef = useRef<HTMLLIElement>(null);
  const dispatch = useDispatch();
  const router = useRouter();

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
      router.push(`?folder_id=${folder.folder_id}`);
      return;
    }

    if (action === "rename") {
      dispatch(
        setDialog({
          type: "OPEN",
          dialogId: "rename-file-or-folder",
          extraValue: {
            type: "Folder",
            folder_file_id: folder.folder_id,
            oldFileOrFolderName: folder.folder_name,
          },
        })
      );
      return;
    }

    if (action === "delete") {
      if (!confirm("Are you sure you want to delete ?")) return;

      dispatch(setDialog({ type: "OPEN", dialogId: "progress-dialog" }));

      const { response, error } = await axiosQuery<ISuccess, ISuccess>({
        url: `${BASE_API}/storage/folder/${folder.folder_id}`,
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
      className="relative flex items-center justify-between border border-gray-400 gap-2 p-3 bg-slate-200 rounded-lg shadow-lg cursor-default"
    >
      <Link
        href={`?folder_id=${folder.folder_id}`}
        className="flex items-center gap-4 w-full"
      >
        <MdOutlineFolder />
        <span className="text-sm line-clamp-1">{folder.folder_name}</span>
      </Link>
      <HiOutlineDotsVertical
        onClick={handleMoreOptionOpen}
        className="cursor-pointer"
      />
      {isOptionOpen ? (
        <FileFolderMoreOption handleOptionClick={handleOptionClick} />
      ) : null}
    </li>
  );
}
