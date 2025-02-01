import React, { useState } from "react";
import DialogBody from "./DialogBody";
import Button from "../Button";
import { IoIosAdd } from "react-icons/io";
import Input from "../Input";
import { AiOutlineDelete } from "react-icons/ai";
import { queryClient } from "@/redux/MyProvider";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import DateInput from "../DateInput";

export default function AssignAssetDialog() {
  const [inputs, setInputs] = useState<number[]>([1]);
  const dispatch = useDispatch();

  const { isLoading, mutate } = useDoMutation();

  const pathname = usePathname();
  const pathNames = pathname.split("/");

  function handleFormSubmit(formData: FormData) {
    const datasToStore: any[] = [];
    let trackIndex = 0;

    let obj: any = {};

    formData.forEach((value, key) => {
      if (trackIndex >= 4) {
        trackIndex = 0;
        if (key === "return_date" && value === "") {
        } else {
          obj[key] = value;
        }
        datasToStore.push(obj);
        obj = {};
        return;
      }

      obj[key] = value;
      trackIndex++;
    });

    mutate({
      apiPath: "/employee/assets",
      method: "post",
      formData: datasToStore,
      onSuccess() {
        queryClient.invalidateQueries("get-employee-info");
        setInputs([]);
        dispatch(setDialog({ type: "CLOSE", dialogId: "" }));
      },
    });
  }

  function handleDeleteItem(index: number) {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  }

  return (
    <DialogBody className="min-w-[65rem] max-h-[90vh] overflow-y-auto">
      <Button
        type="button"
        onClick={() => {
          const preStates = [...inputs];
          preStates.push(
            preStates.length === 0 ? 1 : preStates[preStates.length - 1] + 1
          );
          setInputs(preStates);
        }}
        className="flex-center gap-3"
      >
        <IoIosAdd size={18} className="text-white" />
      </Button>
      <form action={handleFormSubmit} className="space-y-5">
        <ul className="space-y-5">
          {inputs.map((item, index) => (
            <li key={item} className="flex items-center gap-4">
              <div className="flex items-center *:flex-grow gap-5 flex-grow">
                <input
                  name="employee_id"
                  hidden
                  value={pathNames[pathNames.length - 1]}
                />
                <Input
                  required
                  name="assets_name"
                  label="Assets Name *"
                  placeholder="Type Here.."
                />
                <Input
                  required
                  name="issued_by"
                  label="Issued By *"
                  placeholder="Type Here.."
                />
                <DateInput required name="issue_date" label="Issued Date *" />
                <DateInput name="return_date" label="Return Date" />
              </div>

              <div className="pt-6">
                <AiOutlineDelete
                  onClick={() => {
                    if (!confirm("Are you sure you want to delete")) return;
                    handleDeleteItem(index);
                  }}
                  className="cursor-pointer active:scale-90"
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-end">
          <Button loading={isLoading} disabled={isLoading} type="submit">
            Save Info
          </Button>
        </div>
      </form>
    </DialogBody>
  );
}
