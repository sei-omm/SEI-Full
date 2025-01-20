"use client";

import { BASE_API } from "@/app/constant";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Button from "@/components/Button";
import HandleSuspence from "@/components/HandleSuspence";
import Input from "@/components/Input";
import Spinner from "@/components/Spinner";
import { ISuccess, TPayscaleBoth } from "@/types";
import axios from "axios";
import React, { useRef, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { MdAdd } from "react-icons/md";
import { useQuery } from "react-query";

// type TTable = {
//   heads: string[];
//   body: (string | null)[][];
// };

async function getPayscales() {
  return (await axios.get(`${BASE_API}/hr/payscale?item_type=Both`)).data;
}

export default function ManagePayscale() {
  const [labelInput, setLabelInput] = useState<number[]>([]);
  const [yearsInput, setYearsInput] = useState<number[]>([]);

  // const [tableDatas, setTableDatas] = useState<TTable>({
  //   heads: ["Payscale Label", "Payscale Year", "Action"],
  //   body: [],
  // });

  const whichDeleteBtnId = useRef<number>(0);
  const { isLoading: isAdding, mutate: add } = useDoMutation();
  const { isLoading: isDeleting, mutate: deleteData } = useDoMutation();

  const {
    data: payscale,
    error,
    isFetching,
    refetch,
  } = useQuery<ISuccess<TPayscaleBoth>>({
    queryKey: "get-payscale",
    queryFn: getPayscales,
  });

  function handleFormSubmit(
    formData: FormData,
    type: "Year" | "Payscale Label"
  ) {
    const datasToStore: any[] = [];

    formData.forEach((value) => {
      datasToStore.push({ item_type: type, item_value: value });
    });

    add({
      apiPath: "/hr/payscale",
      method: "post",
      formData: datasToStore,
      onSuccess() {
        setLabelInput([]);
        setYearsInput([]);
        refetch();
      },
    });
  }

  function handleAddRow(type: "Year" | "Payscale Label") {
    setYearsInput([]);
    setLabelInput([]);
    const preStates =
      type === "Payscale Label" ? [...labelInput] : [...yearsInput];
    preStates.push(
      preStates.length === 0 ? 1 : preStates[preStates.length - 1] + 1
    );
    if (type === "Payscale Label") return setLabelInput(preStates);
    setYearsInput(preStates);
  }

  function handleDeleteRow(index: number, type: "Year" | "Payscale Label") {
    const newInputs =
      type === "Payscale Label" ? [...labelInput] : [...yearsInput];
    newInputs.splice(index, 1);
    type === "Payscale Label"
      ? setLabelInput(newInputs)
      : setYearsInput(newInputs);
  }

  function handleDeleteDb(item_id: number) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    deleteData({
      apiPath: `/hr/payscale/${item_id}`,
      method: "delete",
      onSuccess() {
        refetch();
      },
    });
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Manage Payscale</h2>
        <Button
          onClick={() => handleAddRow("Payscale Label")}
          className="flex items-center gap-3"
        >
          <MdAdd />
          Add Payscale Label
        </Button>

        <Button
          onClick={() => handleAddRow("Year")}
          className="flex items-center gap-3"
        >
          <MdAdd />
          Add Payscale Years
        </Button>
      </div>

      {labelInput.length === 0 ? null : (
        <form
          onSubmit={(e) => {
            e.preventDefault(); // Prevent default form submission behavior
            const formData = new FormData(e.target as HTMLFormElement);
            handleFormSubmit(formData, "Payscale Label");
          }}
          className="mt-4 space-y-5"
        >
          <ul className="flex items-start gap-5 flex-wrap">
            {labelInput.map((item, index) => (
              <li
                key={item}
                className="flex items-end gap-5 basis-60 flex-grow *:flex-grow"
              >
                <Input
                  name="payscale_label"
                  required
                  label="Payscale Label *"
                  placeholder="Type Here.."
                />
                <AiOutlineDelete
                  onClick={() => handleDeleteRow(index, "Payscale Label")}
                  className="mb-4 cursor-pointer active:scale-90 flex-grow-0"
                />
                {/* <div className="flex items-center gap-4 *:flex-grow flex-grow"> */}

                {/* <Input
                    name="payscale_year"
                    required
                    label="Payscale Year *"
                    placeholder="Type Here.."
                    type="number"
                  /> */}
                {/* </div> */}
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-end">
            <Button loading={isAdding} disabled={isAdding}>
              Save Info
            </Button>
          </div>
        </form>
      )}


      {yearsInput.length === 0 ? null : (
        <form
          onSubmit={(e) => {
            e.preventDefault(); // Prevent default form submission behavior
            const formData = new FormData(e.target as HTMLFormElement);
            handleFormSubmit(formData, "Year");
          }}
          className="mt-4 space-y-5"
        >
          <ul className="flex items-start gap-5 flex-wrap">
            {yearsInput.map((item, index) => (
              <li
                key={item}
                className="flex items-end gap-5 basis-60 flex-grow *:flex-grow"
              >
                <Input
                  name="payscale_year"
                  required
                  label="Payscale Year *"
                  placeholder="Type Here.."
                  type="number"
                />
                <AiOutlineDelete
                  onClick={() => handleDeleteRow(index, "Year")}
                  className="mb-4 cursor-pointer active:scale-90 flex-grow-0"
                />
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-end">
            <Button loading={isAdding} disabled={isAdding}>
              Save Info
            </Button>
          </div>
        </form>
      )}

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={payscale?.data.label.length}
      >
        <div className="space-y-5">
          <h2 className="font-semibold text-xl text-gray-500">
            Payscale Labels
          </h2>
          <ul className="w-full grid grid-cols-4 gap-6">
            {payscale?.data.label.map((info) => (
              <li
                key={info.item_id}
                className="card-shdow p-5 rounded-xl border border-gray-200"
              >
                <h2 className="font-semibold">{info.item_value}</h2>
                <div className="w-full flex items-center justify-end gap-4 *:cursor-pointer">
                  {isDeleting && whichDeleteBtnId.current === info.item_id ? (
                    <Spinner size="18px" />
                  ) : (
                    <AiOutlineDelete
                      onClick={() => {
                        whichDeleteBtnId.current = info.item_id;
                        handleDeleteDb(info.item_id);
                      }}
                      className="active:scale-90"
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </HandleSuspence>

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={payscale?.data.year.length}
      >
        <div className="space-y-5">
          <h2 className="font-semibold text-xl text-gray-500">
            Payscale Years
          </h2>
          <ul className="w-full grid grid-cols-4 gap-6">
            {payscale?.data.year.map((info) => (
              <li
                key={info.item_id}
                className="card-shdow p-5 rounded-xl border border-gray-200"
              >
                <h2 className="font-semibold">{info.item_value}</h2>
                <div className="w-full flex items-center justify-end gap-4 *:cursor-pointer">
                  {isDeleting && whichDeleteBtnId.current === info.item_id ? (
                    <Spinner size="18px" />
                  ) : (
                    <AiOutlineDelete
                      onClick={() => {
                        whichDeleteBtnId.current = info.item_id;
                        handleDeleteDb(info.item_id);
                      }}
                      className="active:scale-90"
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </HandleSuspence>
    </div>
  );
}
