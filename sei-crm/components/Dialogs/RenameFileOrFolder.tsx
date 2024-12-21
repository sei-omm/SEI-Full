import React from "react";
import DialogBody from "./DialogBody";
import Input from "../Input";
import Button from "../Button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { queryClient } from "@/redux/MyProvider";
import { setDialog } from "@/redux/slices/dialogs.slice";

type TExtraValue = {
  type?: "File" | "Folder";
  folder_file_id?: number;
  oldFileOrFolderName?: string
};

export default function RenameFileOrFolder() {
  const { extraValue: ex } = useSelector((state: RootState) => state.dialogs);
  const dispatch = useDispatch();
  const { mutate, isLoading } = useDoMutation();

  const extraValue = ex as TExtraValue;

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const reqBody: any = {};

    if (extraValue.type === "Folder") {
      reqBody.folder_name = formData.get("file_of_folder_name");
    } else {
      reqBody.file_name = formData.get("file_of_folder_name");
    }

    mutate({
      apiPath: extraValue.type === "Folder" ? "/storage/folder" : "/storage/file",
      method: "patch",
      headers: {
        "Content-Type": "application/json",
      },
      formData: reqBody,
      id: extraValue.folder_file_id,
      onSuccess() {
        queryClient.refetchQueries(["fetch-files-and-folders"]);
        dispatch(
          setDialog({ type: "CLOSE", dialogId: "rename-file-or-folder" })
        );
      },
    });
  }

  return (
    <DialogBody>
      <form onSubmit={handleFormSubmit} className="space-y-3">
        <Input
          key={extraValue?.oldFileOrFolderName}
          name="file_of_folder_name"
          placeholder={`Enter ${extraValue?.type} Name`}
          label={`Rename ${extraValue?.type} Name`}
          defaultValue={extraValue?.oldFileOrFolderName}
        />
        <Button loading={isLoading} disabled={isLoading}>
          Rename {extraValue?.type}
        </Button>
      </form>
    </DialogBody>
  );
}
