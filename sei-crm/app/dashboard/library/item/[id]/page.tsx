"use client";

import { BASE_API } from "@/app/constant";
import { getFileName } from "@/app/utils/getFileName";
import { useDoMutation } from "@/app/utils/useDoMutation";
import BackBtn from "@/components/BackBtn";
import Button from "@/components/Button";
import ChooseFileInput from "@/components/ChooseFileInput";
import DropDown from "@/components/DropDown";
import DropDownTag from "@/components/DropDownTag";
import Input from "@/components/Input";
import {
  ISuccess,
  TCourseDropDown,
  TLibrary,
  TLibraryVisibility,
} from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useQueries, UseQueryResult } from "react-query";
import { toast } from "react-toastify";

interface IProps {
  params: {
    id: number | "add";
  };
}

interface IDropDownTags extends TCourseDropDown {
  subject_id: number;
  subject_name: string;
}

export default function ManageLibraryForm({ params }: IProps) {
  const isNewItem = params.id === "add";
  const route = useRouter();

  const [selectedFileType, setSelectedFileType] = useState("pdf");
  const [visibility, setVisibility] =
    useState<TLibraryVisibility>("subject-specific");
  const { mutate, isLoading: isMutating } = useDoMutation();

  const response = useQueries<
    [
      UseQueryResult<ISuccess<IDropDownTags[]>>,
      UseQueryResult<ISuccess<TLibrary | null>>
    ]
  >([
    {
      queryKey: ["get-course-or-subejcts", visibility],
      queryFn: async () =>
        (
          await axios.get(
            visibility === "course-specific"
              ? BASE_API + "/course/drop-down"
              : BASE_API + "/subject"
          )
        ).data,
    },
    {
      queryKey: "get-single-library-item",
      queryFn: async () =>
        (await axios.get(BASE_API + "/library/" + params.id)).data,
      enabled: !isNewItem,
      refetchOnMount: true,
      cacheTime: 0,
    },
  ]);

  const uploadFileInfo = useRef<{
    status: "done" | "uploading";
    file_link?: string;
  }>({
    status: "done",
    file_link: response[1].data?.data?.library_resource_link,
  });

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (uploadFileInfo.current.status === "uploading") {
      return toast.warning("Please wait until file uploaded");
    }

    const formData = new FormData(event.currentTarget);
    if (uploadFileInfo.current.file_link !== undefined) {
      formData.set("library_resource_link", uploadFileInfo.current.file_link);
    } else if (response[1].data && response[1].data.data) {
      formData.set(
        "library_resource_link",
        response[1].data.data.library_resource_link
      );
    }

    if (isNewItem) {
      mutate({
        apiPath: "/library",
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        formData: formData,
        onSuccess() {
          route.back();
        },
      });
    } else {
      mutate({
        apiPath: "/library",
        method: "put",
        headers: {
          "Content-Type": "application/json",
        },
        formData: formData,
        id: parseInt(`${params.id}`),
        onSuccess() {
          route.back();
        },
      });
    }
  }

  useEffect(() => {
    setSelectedFileType(response[1].data?.data?.library_file_type || "pdf");
    setVisibility(response[1].data?.data?.visibility || "subject-specific");
  }, [response[1].isFetching]);

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="p-8 card-shdow rounded-2xl space-y-6">
      <form
        key={Math.random()}
        ref={formRef}
        className="space-y-6"
        onSubmit={handleFormSubmit}
      >
        <div className="flex flex-wrap *:flex-grow *:basis-96 gap-6">
          <Input
            key={"library_file_name"}
            required
            name="library_file_name"
            label="Enter File Name *"
            placeholder="Sample File Form SEI"
            defaultValue={response[1].data?.data?.library_file_name}
          />
          <DropDown
            onChange={(item) => {
              uploadFileInfo.current = { status: "done", file_link: undefined };
              setSelectedFileType(item.value);
            }}
            key={"library_file_type"}
            label="File Type *"
            name="library_file_type"
            options={[
              { text: "PDF File", value: "pdf" },
              { text: "Doc File", value: "doc" },
              { text: "Audio File", value: "audio" },
              { text: "Image File", value: "image" },
              { text: "Link", value: "link" },
            ]}
            defaultValue={selectedFileType}
          />
          <DropDown
            key={"is_active"}
            label="Is Active *"
            name="is_active"
            options={[
              { text: "Active", value: "true" },
              { text: "De-Active", value: "false" },
            ]}
            defaultValue={response[1].data?.data?.is_active ? "true" : "false"}
          />
          {selectedFileType === "link" ? (
            <Input
              key={"library_resource_link_input"}
              required
              label="Enter Your Link *"
              name="library_resource_link"
              placeholder="https://yourfile.com/view"
              defaultValue={response[1].data?.data?.library_resource_link}
            />
          ) : (
            <ChooseFileInput
              name="library_resource_link"
              id="library_resource_link"
              accept={
                selectedFileType === "image"
                  ? "image/*"
                  : selectedFileType === "audio"
                  ? "audio/*"
                  : selectedFileType === "doc"
                  ? "application/msword"
                  : selectedFileType === "pdf"
                  ? "application/pdf"
                  : ""
              }
              disableUpload={false}
              label="Upload Your File *"
              fileName={
                response[1].data?.data?.library_resource_link
                  ? getFileName(response[1].data?.data?.library_resource_link)
                  : "Choose Your File"
              }
              uploadFolderName="library-files"
              onProcessing={() => {
                uploadFileInfo.current = { status: "uploading" };
              }}
              onUploaded={(blob) => {
                uploadFileInfo.current = {
                  status: "done",
                  file_link: blob.url,
                };
              }}
              onError={() => (uploadFileInfo.current = { status: "done" })}
              viewLink={response[1].data?.data?.library_resource_link}
            />
          )}
          <DropDown
            name="allow_download"
            label="Allow Download *"
            options={[
              { text: "No", value: "false" },
              { text: "Yes", value: "true" },
            ]}
            defaultValue={
              response[1].data?.data?.allow_download ? "true" : "false"
            }
          />
          <DropDown
            name="visibility"
            onChange={(item) => setVisibility(item.value)}
            label="Visibility *"
            options={[
              { text: "Subject Specific", value: "subject-specific" },
              { text: "Course Specific", value: "course-specific" },
            ]}
            defaultValue={response[1].data?.data?.visibility}
          />
          <DropDown
            name="institute"
            label="Campus *"
            options={[
              { text: "Kolkata", value: "Kolkata" },
              { text: "Faridabad", value: "Faridabad" },
            ]}
            defaultValue={response[1].data?.data?.institute}
          />
        </div>
        {visibility === "course-specific" ? (
          <DropDownTag
            key={"course_ids"}
            name="course_ids"
            label="Choose Courses"
            options={
              response[0].data?.data.map((item) => ({
                text: item.course_name,
                value: item.course_id,
              })) || []
            }
            defaultValues={response[1].data?.data?.course_ids.map(
              (item) => item
            )}
          />
        ) : (
          <DropDownTag
            key={"subject_ids"}
            name="subject_ids"
            label="Choose Subjects"
            options={
              response[0].data?.data.map((item) => ({
                text: item.subject_name,
                value: item.subject_id,
              })) || []
            }
            defaultValues={response[1].data?.data?.subject_ids.map(
              (item) => item
            )}
          />
        )}
      </form>
      <div className="flex items-center gap-4">
        <BackBtn />
        <Button
          onClick={() => formRef.current?.requestSubmit()}
          disabled={isMutating}
          loading={isMutating}
        >
          Save Item To Library
        </Button>
      </div>
    </div>
  );
}
