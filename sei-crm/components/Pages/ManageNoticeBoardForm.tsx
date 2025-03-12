"use client";

import { useRef } from "react";
import Editor from "../Editor";
import Input from "../Input";
import Button from "../Button";
import { useDoMutation } from "@/app/utils/useDoMutation";
import DropDown from "../DropDown";
import BackBtn from "../BackBtn";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { ISuccess, TNoticeBoard } from "@/types";
import HandleSuspence from "../HandleSuspence";
import { useRouter } from "next/navigation";

interface IProps {
  notice_id: number | "add";
}

const getSingleNotice = async (notice_id?: number) => {
  if (!notice_id) return null;

  return (await axios.get(`${BASE_API}/website/notice/${notice_id}`)).data;
};

export default function ManageNoticeBoardForm({ notice_id }: IProps) {
  const isNew = notice_id === "add";

  const textEditorContent = useRef("");
  const headingInputRef = useRef<HTMLInputElement>(null);
  const visibilityRef = useRef(true);
  const route = useRouter();

  const { error, isFetching, data } = useQuery<ISuccess<TNoticeBoard>>({
    queryKey: ["get-single-notice"],
    queryFn: () => getSingleNotice(isNew ? undefined : notice_id),
    enabled: !isNew,
    onSuccess(data) {
      if(headingInputRef.current) {
        headingInputRef.current.value = data.data.heading
      }

      if(visibilityRef.current) {
        visibilityRef.current = data.data.visible
      }
    },
    refetchOnMount : true
  });

  const { isLoading, mutate } = useDoMutation();
  
  const handleFormSubmitBtn = () => {
    mutate({
      apiPath: "/website/notice",
      method: isNew ? "post" : "put",
      formData: {
        heading: headingInputRef.current?.value,
        description: textEditorContent.current,
        visible: visibilityRef.current,
      },
      onSuccess () {
        route.back();
      },
      id: isNew ? undefined : notice_id,
    });
  };

  return (
    <HandleSuspence
      key={notice_id}
      isLoading={isFetching}
      error={error}
      dataLength={1}
      noDataMsg="No Notice Avilable"
    >
      <div className="space-y-3">
        <Input
          referal={headingInputRef}
          label="Notice Heading"
          placeholder="Notice Heading"
          defaultValue={data?.data.heading}
        />
        <Editor
          textEditorContentRef={textEditorContent}
          defaultValue={data?.data.description}
          storageFolderName="notice-bord"
          label="Notice Description"
        />

        <DropDown
          onChange={(option) => (visibilityRef.current = option.value)}
          label="Visibility"
          options={[
            {
              text: "Public",
              value: true,
            },
            {
              text: "Private",
              value: false,
            },
          ]}
          defaultValue={data?.data.visible}
        />

        <div className="flex items-center gap-6">
          <BackBtn />
          <Button
            disabled={isLoading}
            loading={isLoading}
            onClick={handleFormSubmitBtn}
          >
            {isNew ? "Add New Notice" : "Update Notice"}
          </Button>
        </div>
      </div>
    </HandleSuspence>
  );
}
