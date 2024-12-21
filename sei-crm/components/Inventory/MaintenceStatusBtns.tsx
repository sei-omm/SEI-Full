"use client";

import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import TagsBtn from "../TagsBtn";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { useState } from "react";

interface IProps {
  id: number;
  value: string;
}

export default function MaintenceStatusBtns({ value, id }: IProps) {
  const [initialValue, setInitValue] = useState(value);

  const { openDialog, closeDialog } = useLoadingDialog();

  const { mutate } = useDoMutation(
    () => {},
    () => {
      closeDialog();
    }
  );

  const handleCompletedBtn = async () => {
    openDialog();
    mutate({
      apiPath: "/inventory/maintence-record",
      method: "patch",
      headers: {
        "Content-Type": "application/json",
      },
      formData: {
        status: "Completed",
      },
      id,
      onSuccess: () => {
        closeDialog();
        setInitValue("Completed");
      },
    });
  };

  function handlePendingBtn() {
    openDialog();
    mutate({
      apiPath: "/inventory/maintence-record",
      method: "patch",
      headers: {
        "Content-Type": "application/json",
      },
      formData: {
        status: "Pending",
      },
      id,
      onSuccess: () => {
        closeDialog();
        setInitValue("Pending");
      },
    });
  }

  return (
    <div className="flex flex-col gap-y-2 group/items">
      {/* <span className="hidden">{isLoading}</span> */}
      <TagsBtn
        onClick={handleCompletedBtn}
        className={`${
          initialValue === "Completed" ? "flex" : "hidden"
        } group-hover/items:!flex`}
        type="SUCCESS"
      >
        Completed
      </TagsBtn>

      <TagsBtn
        onClick={handlePendingBtn}
        className={`${
          initialValue === "Pending" ? "flex" : "hidden"
        } group-hover/items:flex`}
        type="PENDING"
      >
        Pending
      </TagsBtn>
    </div>
  );
}
