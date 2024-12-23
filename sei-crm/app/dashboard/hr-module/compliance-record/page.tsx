"use client";

import { BASE_API } from "@/app/constant";
import Button from "@/components/Button";
import HandleSuspence from "@/components/HandleSuspence";
import FileItem from "@/components/HR/FileItem";
import FolderItem from "@/components/HR/FolderItem";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { IStorageResponse, ISuccess } from "@/types";
import axios from "axios";
import React from "react";
import { BsCloudUpload } from "react-icons/bs";
import { FiFolderPlus } from "react-icons/fi";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";

interface IProps {
  searchParams: {
    folder_id?: number;
  };
}

export default function ComplianceRecord({ searchParams }: IProps) {
  const { data, isFetching, error } = useQuery<ISuccess<IStorageResponse>>({
    queryKey: ["fetch-files-and-folders", searchParams.folder_id],
    queryFn: async () =>
      (
        await axios.get(
          `${BASE_API}/storage?folder_id=${searchParams.folder_id ?? 0}`
        )
      ).data,
  });

  const dispatch = useDispatch();

  const handleNewFolder = () => {
    dispatch(
      setDialog({
        type: "OPEN",
        dialogId: "add-folder",
      })
    );
  };

  const handleMultiFileUpload = () => {
    dispatch(
      setDialog({
        type: "OPEN",
        dialogId: "choose-files-dialog",
        extraValue : {
          folderId : searchParams.folder_id
        }
      })
    );
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3 justify-end">
        <Button
          onClick={handleMultiFileUpload}
          className="flex items-center gap-2 !bg-transparent border !shadow-none !text-black"
        >
          <BsCloudUpload size={18} />
          <span>Upload File</span>
        </Button>

        <Button
          onClick={handleNewFolder}
          className="flex items-center gap-2 !shadow-none"
        >
          <FiFolderPlus size={18} />
          <span>New Folder</span>
        </Button>
      </div>

      {/* Folders */}

      <div className="space-y-5">
        <h2 className="font-semibold text-sm text-gray-500">Folders</h2>
        <HandleSuspence
          isLoading={isFetching}
          dataLength={data?.data.folders.length}
          error={error}
        >
          <ul className="w-full grid grid-cols-4 gap-5">
            {data?.data.folders.map((item) => (
              <FolderItem key={item.folder_id} folder={item} />
            ))}
          </ul>
        </HandleSuspence>
      </div>

      {/* Files */}

      <div className="space-y-5">
        <h2 className="font-semibold text-sm text-gray-500">Files</h2>
        <HandleSuspence
          isLoading={isFetching}
          dataLength={data?.data.files.length}
          error={error}
        >
          <ul className="w-full grid grid-cols-4 gap-5">
            {data?.data.files.map((file) => (
              <FileItem key={file.file_id} fileInfo={file}/>
            ))}
          </ul>
        </HandleSuspence>
      </div>
    </div>
  );
}
