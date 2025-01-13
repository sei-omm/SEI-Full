import React, { useRef, useState } from "react";
import DialogBody from "./DialogBody";
import Button from "../Button";
import { MdAdd } from "react-icons/md";
import Input from "../Input";
import { AiOutlineDelete } from "react-icons/ai";
import DropDown from "../DropDown";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import HandleSuspence from "../HandleSuspence";
import { IDepartment, ISuccess } from "@/types";

type TLocalDesignation = {
  id: number;
  department_id: number;
  designation: string;
};

export default function DesignationDialog() {
  const [localDegnInfo, setLocalDegnInfo] = useState<TLocalDesignation[]>([
    {
      id: 0,
      department_id: 1,
      designation: "",
    },
  ]);
  const dispatch = useDispatch();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    data: departments,
    isFetching,
    error,
  } = useQuery<ISuccess<IDepartment[]>>({
    queryKey: "get-department",
    queryFn: async () => (await axios.get(`${BASE_API}/hr/department`)).data,
    refetchOnMount: true,
  });

  function deleteDesignationFild(index: number) {
    const newArray = [...localDegnInfo];
    newArray.splice(index, 1);
    setLocalDegnInfo(newArray);
  }

  const addNewRow = () => {
    const prevId = localDegnInfo[localDegnInfo.length - 1]?.id || 0;
    setLocalDegnInfo((preState) => [
      ...preState,
      { id: prevId + 1, department_id: 1, designation: "" },
    ]);
  };

  const { mutate, isLoading } = useDoMutation();
  function handleFormSubmit(formData: FormData) {
    let trackNum = 1;
    let mainIndex = 0;
    const dataToStore: any[] = [];
    formData.forEach((value, key) => {
      if (trackNum > 2) {
        //here 2 is the number of input inside li
        trackNum = 1;
        mainIndex++;
      }

      if (!dataToStore[mainIndex]) {
        dataToStore.push({
          id: mainIndex,
          [key]: value,
        });
      } else {
        const tempData = dataToStore[mainIndex];
        dataToStore[mainIndex] = { ...tempData, [key]: value };
      }

      trackNum++;
    });

    setLocalDegnInfo(dataToStore);

    mutate({
      apiPath: "/hr/designation",
      method: "post",
      formData: dataToStore.map((item) => ({
        department_id: item.department_id,
        deg_name: item.designation,
      })),
      onSuccess() {
        dispatch(setDialog({ type: "CLOSE", dialogId: "" }));
      },
    });
  }

  return (
    <DialogBody className="min-w-[35rem] space-y-5">
      <div className="flex items-center pt-5">
        <Button
          onClick={addNewRow}
          className="flex items-center gap-4 !bg-transparent !border !border-gray-600 !shadow-none !text-gray-700"
        >
          <MdAdd size={15} />
          Add New Row
        </Button>
      </div>

      <form ref={formRef} action={handleFormSubmit} className="space-y-5">
        <ul>
          {localDegnInfo.map((item, index) => (
            <li key={item.id} className={`flex items-center gap-5 *:flex-grow`}>
              <HandleSuspence
                isLoading={isFetching}
                error={error}
                dataLength={departments?.data.length}
              >
                <DropDown
                  name={`department_id`}
                  label=""
                  options={
                    departments?.data.map((department) => ({
                      text: department.name,
                      value: department.id,
                    })) || []
                  }
                  defaultValue={item.department_id}
                />
              </HandleSuspence>
              <Input
                name={`designation`}
                placeholder="Add Designation"
                defaultValue={item.designation}
              />
              <AiOutlineDelete
                onClick={() => deleteDesignationFild(index)}
                className="cursor-pointer active:scale-90"
              />
            </li>
          ))}
        </ul>

        <Button
          loading={isLoading}
          disabled={isLoading}
          type="submit"
          className="w-full"
        >
          Save Designation Info
        </Button>
      </form>
    </DialogBody>
  );
}
