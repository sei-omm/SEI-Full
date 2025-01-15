"use client";

import DialogBody from "./DialogBody";
import Input from "../Input";
import Button from "../Button";
import { useDoMutation } from "@/app/hooks/useDoMutation";
import { FormEvent } from "react";
import { getAuthToken } from "@/app/utils/getAuthToken";
import { useDispatch } from "react-redux";
import { setDialog } from "@/app/redux/slice/dialog.slice";
import { useRouter } from "next/navigation";

export default function EditIndosNumberDialog() {
  const { mutate, isLoading } = useDoMutation();
  const dispatch = useDispatch();

  const router = useRouter();

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !confirm(
        "Are you sure you want to save? Once saved, you won't be able to make changes later ?"
      )
    ) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    mutate({
      apiPath: "/student/save-indos-number",
      formData,
      method: "patch",
      headers: {
        "Content-Type": "application/json",
        ...getAuthToken(),
      },

      onSuccess: () => {
        dispatch(setDialog({ type: "CLOSE", dialogKey: "" }));
        router.push("/account?code=" + Math.floor(Math.random() * 100));
      },
    });
  };

  return (
    <DialogBody className="space-y-3">
      <form className="space-y-3 *:w-full" onSubmit={handleFormSubmit}>
        <div></div>
        <Input
          pattern="[0-9]{2}[A-Z]{2}[0-9]{4}"
          title="InDos Number should be in the format: 11EL1234 (2 digits, 2 uppercase letters, 4 digits)"
          name="indos_number"
          required
          type="text"
          placeholder="inDOS Number"
          label="Indos Number"
          maxLength={30}
        />
        <Button
          spinnerSize="20px"
          disabled={isLoading}
          isLoading={isLoading}
          varient="new-default"
          className="!py-2 active:scale-95"
        >
          Save
        </Button>
        <span className="inline-block text-red-500 text-center text-sm">
          Once saved, you won&apos;t be able to make changes later
        </span>
      </form>
    </DialogBody>
  );
}
