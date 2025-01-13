"use client";

import { BASE_API } from "@/app/constant";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Button from "@/components/Button";
import HandleSuspence from "@/components/HandleSuspence";
import Spinner from "@/components/Spinner";
import { queryClient } from "@/redux/MyProvider";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { IDepartment, ISuccess } from "@/types";
import axios from "axios";
import React, { useRef, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { CiEdit } from "react-icons/ci";
import { MdAdd } from "react-icons/md";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";

type TTable = {
  heads: string[];
  body: (string | null)[][];
};

async function fetchDepartment() {
  const { data } = await axios.get(`${BASE_API}/hr/department`);
  return data;
}

export default function DepartmentAndDesignation() {
  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: ["Department Name", "Designations", "Action"],
    body: [],
  });
  const dispatch = useDispatch();
  const { isLoading, mutate } = useDoMutation();
  const currentDeleteBtnIndex = useRef<number>(0);

  const {
    data: departements,
    isFetching,
    error,
  } = useQuery<ISuccess<IDepartment[]>>({
    queryKey: "get-department",
    queryFn: fetchDepartment,
    refetchOnMount: true,
    onSuccess(data) {
      const tempTableInfo = { ...tableDatas };
      tempTableInfo.body = data.data.map((item) => [
        item.name,
        item.designation,
        "actionBtn",
      ]);

      setTableDatas(tempTableInfo);
    },
  });

  return (
    <section className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Departments & Designation</h2>
        <Button
          onClick={() => {
            dispatch(
              setDialog({
                dialogId: "department-designation-dialog",
                type: "OPEN",
              })
            );
          }}
          className="flex items-center gap-3"
        >
          <MdAdd />
          Create Departments And Designation
        </Button>
      </div>

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={departements?.data.length}
      >
        <div className="w-full overflow-hidden card-shdow">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
            <table className="min-w-max w-full table-auto">
              <thead className="uppercase w-full border-b border-gray-100">
                <tr>
                  {tableDatas.heads?.map?.((item) => (
                    <th
                      className="text-left text-[14px] font-semibold pb-2 px-5 py-4"
                      key={item}
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableDatas.body?.map?.((itemArray, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-100 group/bodyitem"
                  >
                    {itemArray.map((value, columnIndex) => (
                      <td
                        className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                        key={value}
                      >
                        {columnIndex === 1 ? (
                          <div className="flex items-center gap-3 flex-wrap">
                            {value
                              ? value.split(",").map((item) => (
                                  <div
                                    key={item}
                                    className="px-2 py-1 bg-lime-200 border rounded-lg border-green-950 text-xs"
                                  >
                                    {item}
                                  </div>
                                ))
                              : "NA"}
                          </div>
                        ) : value === "actionBtn" ? (
                          <div className="flex items-center gap-5">
                            <CiEdit
                              onClick={() => {
                                dispatch(
                                  setDialog({
                                    dialogId: "department-designation-dialog",
                                    type: "OPEN",
                                    extraValue: {
                                      department_id:
                                        departements?.data[rowIndex].id,
                                    },
                                  })
                                );
                              }}
                              className="cursor-pointer active:scale-90"
                              size={18}
                            />

                            {isLoading &&
                            rowIndex === currentDeleteBtnIndex.current ? (
                              <Spinner size="15px" />
                            ) : (
                              <AiOutlineDelete
                                onClick={() => {
                                  currentDeleteBtnIndex.current = rowIndex;
                                  if (
                                    !confirm(
                                      "Are you sure you want to delete ?"
                                    )
                                  )
                                    return;
                                  mutate({
                                    apiPath: "/hr/department",
                                    method: "delete",
                                    id: departements?.data[rowIndex].id,
                                    onSuccess() {
                                      queryClient.invalidateQueries(
                                        "get-department"
                                      );
                                    },
                                  });
                                }}
                                className="cursor-pointer active:scale-90"
                              />
                            )}
                          </div>
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </HandleSuspence>
    </section>
  );
}
