"use client";

import { BASE_API } from "@/app/constant";
import Button from "@/components/Button";
import DropDown from "@/components/DropDown";
import HandleSuspence from "@/components/HandleSuspence";
import FileItem from "@/components/HR/FileItem";
import FolderItem from "@/components/HR/FolderItem";
import Input from "@/components/Input";
import Pagination from "@/components/Pagination";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { IStorageResponse, ISuccess } from "@/types";
import axios from "axios";
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import React from "react";
import { BsCloudUpload } from "react-icons/bs";
import { FiFolderPlus } from "react-icons/fi";
import { IoMdArrowBack } from "react-icons/io";
import { RiSearchLine } from "react-icons/ri";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";

async function fetchData(searchParams: ReadonlyURLSearchParams) {
  return (
    await axios.get(
      `${BASE_API}/storage?folder_id=${
        searchParams.get("folder_id") ?? 0
      }&institute=${searchParams.get("institute") || "Kolkata"}`
    )
  ).data;
}

async function searchFile(searchParams: ReadonlyURLSearchParams) {
  return (
    await axios.get(
      `${BASE_API}/storage/search?q=${searchParams.get("search")}&institute=${
        searchParams.get("institute") || "Kolkata"
      }`
    )
  ).data;
}

export default function ComplianceRecord() {
  const searchParams = useSearchParams();
  const route = useRouter();

  const { data, isFetching, error } = useQuery<ISuccess<IStorageResponse>>({
    queryKey: ["fetch-files-and-folders", searchParams.toString()],
    queryFn: async () =>
      searchParams.has("search")
        ? searchFile(searchParams)
        : fetchData(searchParams),
  });

  // const {
  //   data: searchData,
  //   isFetching: isSearching,
  //   error: searchingError,
  // } = useQuery<ISuccess<TFile[]>>({
  //   queryKey: ["search-file", searchParams.get("search")],
  //   queryFn: async () =>
  //     (
  //       await axios.get(
  //         `${BASE_API}/storage/search?q=${searchParams.get("search")}`
  //       )
  //     ).data,
  //   enabled: !searchParams.has("folder_id"),
  // });

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
        extraValue: {
          folderId: searchParams.get("folder_id"),
        },
      })
    );
  };

  const handleSearch = (formData: FormData) => {
    route.push(
      `/dashboard/hr-module/compliance-record?search=${formData.get(
        "search_input"
      )}&institute=${searchParams.get("institute") || "Kolkata"}`
    );
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          onClick={() => {
            route.back();
          }}
          className="flex items-center gap-2"
        >
          <IoMdArrowBack />
        </Button>
        <form
          action={handleSearch}
          className="flex items-center gap-3 relative"
        >
          <Input
            key={searchParams.get("search")}
            required
            title="Type Something For Search"
            name="search_input"
            placeholder="Search.."
            className="!min-w-80"
            defaultValue={searchParams.get("search")}
          />
          <button type="submit">
            <RiSearchLine className="mt-2 cursor-pointer" size={20} />
          </button>
        </form>
        {!searchParams.has("folder_id") && !searchParams.has("search") && (
          <DropDown
            changeSearchParamsOnChange
            label="Choose Campus"
            name="institute"
            options={[
              { text: "Kolkata", value: "Kolkata" },
              { text: "Faridabad", value: "Faridabad" },
            ]}
            defaultValue={searchParams.get("institute") || "Kolkata"}
          />
        )}
        {searchParams.has("folder_id") && (
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
        )}
      </div>

      {/* Folders */}
      {data?.data.folders.length !== 0 && (
        <div className="space-y-5">
          <h2 className="font-semibold text-sm text-gray-500">Folders</h2>
          <HandleSuspence
            isLoading={isFetching}
            dataLength={data?.data.folders.length}
            error={error}
            noDataMsg="No Folder Avilable"
          >
            <ul className="w-full grid grid-cols-4 gap-5">
              {data?.data.folders.map((item) => (
                <FolderItem key={item.folder_id} folder={item} />
              ))}
            </ul>
          </HandleSuspence>
        </div>
      )}

      {/* Files */}
      {data?.data.files.length !== 0 && (
        <div className="space-y-5">
          <h2 className="font-semibold text-sm text-gray-500">Files</h2>
          <HandleSuspence
            isLoading={isFetching}
            dataLength={data?.data.files.length}
            error={error}
            noDataMsg="No File Avilable"
          >
            <ul className="w-full grid grid-cols-4 gap-5">
              {data?.data.files.map((file) => (
                <FileItem key={file.file_id} fileInfo={file} />
              ))}
            </ul>
          </HandleSuspence>
        </div>
      )}

      {searchParams.has("search") && (
        <Pagination dataLength={data?.data.files.length} />
      )}
    </div>
  );
}
