"use client";

import React from "react";
import { InfoLayout } from "./InfoLayout";
import { IoOpenOutline } from "react-icons/io5";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { getAuthToken } from "@/app/utils/getAuthToken";
import { ISuccess } from "@/types";
import HandleSuspence from "../HandleSuspence";
import Button from "../Button";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useDispatch } from "react-redux";

type TTranningInfo = {
  employee_id: number;
  employee_type: string;

  it_completed_date: null | string;
  it_generated_date: null | string;

  se_generated_date: null | string;
  se_completed_date: null | string;

  tr_generated_date: null | string;
  tr_completed_date: null | string;

  created_at: null | string;
  it_form_is_accepted: boolean;
  se_form_is_accepted: boolean;
  tr_form_is_accepted: boolean;
};

export default function TranningList() {
  const dispatch = useDispatch();
  const { data, error, isFetching } = useQuery<ISuccess<TTranningInfo[]>>({
    queryKey: ["get-tranning-info"],
    queryFn: async () =>
      (
        await axios.get(`${BASE_API}/tranning/employee`, {
          headers: { ...getAuthToken() },
        })
      ).data,
  });

  return (
    <InfoLayout>
      <div className="relative pb-6 space-y-5">
        <h2 className="text-2xl font-semibold">Tranning Requirements</h2>

        <HandleSuspence
          isLoading={isFetching}
          error={error}
          dataLength={data?.data.length}
        >
          <ul className="space-y-5">
            {data?.data[0]?.it_generated_date ? (
              <li className="space-y-1 relative border-b-2 pb-3">
                <h3 className="text-sm font-semibold space-x-1">
                  <span>Induction Training</span>
                </h3>
                {data?.data[0]?.it_form_is_accepted ? (
                  <span className="text-green-600 text-sm font-semibold">
                    Completed
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
                            dialogId: "induction-tranning-form",
                            type: "OPEN",
                            extraValue: {
                              employee_id: data.data[0].employee_id,
                              btn_type: "Accepte",
                              employee_type: data.data[0].employee_type,
                            },
                          })
                        );
                      }}
                      className="absolute top-0 right-0 flex items-center gap-2"
                    >
                      <IoOpenOutline />
                      Open And Accepte
                    </Button>
                  </>
                )}
              </li>
            ) : null}

            {data?.data[0]?.se_generated_date ? (
              <li className="space-y-1 relative border-b-2 pb-3">
                <h3 className="text-sm font-semibold space-x-1">
                  <span>Skill Enhancement</span>
                </h3>
                {data?.data[0]?.se_form_is_accepted ? (
                  <span className="text-green-600 text-sm font-semibold">
                    Completed
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
                            dialogId: "skill-enhancement-form",
                            type: "OPEN",
                            extraValue: {
                              employee_id: data.data[0].employee_id,
                              btn_type: "Accepte",
                              employee_type: data.data[0].employee_type,
                            },
                          })
                        );
                      }}
                      className="absolute top-0 right-0 flex items-center gap-2"
                    >
                      <IoOpenOutline />
                      Open And Accepte
                    </Button>
                  </>
                )}
              </li>
            ) : null}

            {data?.data[0]?.tr_generated_date ? (
              <li className="space-y-1 relative border-b-2 pb-3">
                <h3 className="text-sm font-semibold space-x-1">
                  <span>Training Requirement</span>
                </h3>
                {data?.data[0]?.tr_form_is_accepted ? (
                  <span className="text-green-600 text-sm font-semibold">
                    Completed
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
                            dialogId: "training-requirement-form",
                            type: "OPEN",
                            extraValue: {
                              employee_id: data.data[0].employee_id,
                              btn_type: "Accepte",
                              employee_type: data.data[0].employee_type,
                            },
                          })
                        );
                      }}
                      className="absolute top-0 right-0 flex items-center gap-2"
                    >
                      <IoOpenOutline />
                      Open And Accepte
                    </Button>
                  </>
                )}
              </li>
            ) : null}
          </ul>
        </HandleSuspence>
      </div>
    </InfoLayout>
  );
}
