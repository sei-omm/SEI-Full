"use client";

import DialogBody from "./DialogBody";
import Input from "../Input";
import Button from "../Button";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { queryClient } from "@/redux/MyProvider";

export default function AddFolder() {
  const { isLoading, mutate } = useDoMutation();

  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const reqBody: any = {
      folder_name: formData.get("folder_name"),
      institute : searchParams.get("institute") || "Kolkata"
    };

    if (searchParams.has("folder_id")) {
      reqBody.parent_folder_id = searchParams.get("folder_id");
    }

    mutate({
      apiPath: "/storage/folder",
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      formData: reqBody,
      onSuccess() {
        queryClient.refetchQueries(["fetch-files-and-folders"]);
        dispatch(setDialog({ type: "CLOSE", dialogId: "add-folder" }));
      },
    });
  }

  return (
    <DialogBody>
      <form className="space-y-3" onSubmit={handleFormSubmit}>
        <Input
          name="folder_name"
          placeholder={`Enter Your Folder Name`}
          label={`Type Folder Name`}
        />
        <Button loading={isLoading} disabled={isLoading}>
          Create Folder
        </Button>
      </form>
    </DialogBody>
  );
}
