"use client";

import React from "react";
import { InfoLayout } from "./InfoLayout";
import { IoOpenOutline } from "react-icons/io5";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { EmployeeType, ISuccess } from "@/types";
import HandleSuspence from "../HandleSuspence";
import Button from "../Button";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useDispatch } from "react-redux";
import { beautifyDate } from "@/app/utils/beautifyDate";

type TTranningInfo = {
  employee_id: number;
  employee_type: EmployeeType;
  record_id: number;
  tranning_name: string;
  created_at: string;
  completed_at: string | null;
};

export default function TranningList() {
  const dispatch = useDispatch();
  const { data, error, isFetching } = useQuery<ISuccess<TTranningInfo[]>>({
    queryKey: ["get-tranning-info"],
    queryFn: async () =>
      (await axios.get(`${BASE_API}/tranning/employee`)).data,
    refetchOnMount: true,
  });

  return (
    <InfoLayout>
      <div className="relative pb-6 space-y-5">
        <h2 className="text-2xl font-semibold">Training Requirements</h2>

        <HandleSuspence
          isLoading={isFetching}
          error={error}
          dataLength={data?.data.length}
        >
          <ul className="space-y-5">
            {data?.data.map((info) => (
              <li
                key={info.record_id}
                className="space-y-1 relative border-b-2 pb-3"
              >
                <h3 className="text-sm font-semibold space-x-1">
                  <span>{info.tranning_name}</span>

                  <span className="underline text-gray-600">
                    Generated At : {beautifyDate(info.created_at)}
                  </span>
                </h3>
                {info.completed_at ? (
                  <span className="text-green-600 text-sm font-semibold">
                    Completed At : {beautifyDate(info.completed_at)}
                  </span>
                ) : (
                  <>
                    <span className="text-yellow-600 text-sm font-semibold">
                      Waiting For Your Acceptance
                    </span>
                    <Button
                      onClick={() => {
                        dispatch(
                          setDialog({
                            dialogId: info.tranning_name,
                            type: "OPEN",
                            extraValue: {
                              employee_id: info.employee_id,
                              btn_type: "Accepte",
                              employee_type: info.employee_type,
                            },
                          })
                        );
                      }}
                      className="absolute top-0 right-0 flex items-center gap-2"
                    >
                      <IoOpenOutline />
                      Open And Accept
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </HandleSuspence>
      </div>
    </InfoLayout>
  );
}
