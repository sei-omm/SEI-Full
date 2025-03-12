import ManageNoticeBoardForm from "@/components/Pages/ManageNoticeBoardForm";
import React from "react";

interface IProps {
  params: {
    ["notice-id"]: number | "add";
  };
}

export default function page({ params }: IProps) {
  return <ManageNoticeBoardForm notice_id={params["notice-id"]} />;
}
