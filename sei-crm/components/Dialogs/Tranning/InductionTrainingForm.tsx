import React, { useState } from "react";
import Input from "../../Input";
import DialogBody from "../DialogBody";
import DateInput from "@/components/DateInput";
import Button from "@/components/Button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { ISuccess } from "@/types";
import HandleSuspence from "@/components/HandleSuspence";
import { queryClient } from "@/redux/MyProvider";

type TrainingRecord = {
  date: string; // Assuming the date remains a string (can convert to Date if needed)
  employee_sign: string;
  heading: string;
  qsc_sign?: string;
  tranner_sign?: string;
};

export default function InductionTrainingForm() {
  const { extraValue } = useSelector((state: RootState) => state.dialogs);
  const [serilizeData, setSerilizeData] = useState<TrainingRecord[]>([]);

  const dispatch = useDispatch();

  const staffOrFaculty =
    extraValue?.employee_type === "Faculty" ? "Faculty" : "Staff";

  const path = extraValue?.from_where === "Account" ? "/account" : "/tranning";

  const tableDatas = {
    head: [
      "Details of training",
      `Signature Of ${staffOrFaculty} Member`,
      "Signature Of Person Imparting Training",
      "Date",
    ],
    body: [
      [
        "1) Familiarisation with Quality System",
        "signOfFaculty",
        "signOfTrannerQsc",
        "date",
      ],
      [
        "2) Briefing regarding duties and responsibilities",
        "signOfFaculty",
        "signOfTrannerQsc",
        "date",
      ],
      [
        staffOrFaculty === "Faculty"
          ? "3) Familiarisation with delivery of lectures"
          : "3) Familiarisation with Code of Conduct",
        "signOfFaculty",
        "signOfTrannerCoOrdinator",
        "date",
      ],
    ],
  };

  const { error, isFetching, data } = useQuery<
    ISuccess<{ form_data: string | null; record_id: number }>
  >({
    queryKey: "get-tranning-form-data",
    queryFn: async () =>
      (
        await axios.get(
          // `${BASE_API}${path}/one-form?employee_id=${extraValue?.employee_id}&tranning_name=Induction Training`
          `${BASE_API}${path}/one-form?record_id=${extraValue?.record_id}`
        )
      ).data,
    enabled: extraValue?.btn_type !== "Generate",
    onSuccess(data) {
      if (data.data.form_data !== null) {
        const response = JSON.parse(data.data.form_data) as TrainingRecord[];
        setSerilizeData(response);
      }
    },
    refetchOnMount: true,
  });

  const { isLoading, mutate } = useDoMutation();
  function handleFormSubmit(formData: FormData) {
    if (!confirm("Are you sure you want to send the form ?")) return;

    const formDataArray: any[] = [];
    let trackIndex = 0;

    let obj: any = {};

    formData.forEach((value, key) => {
      if (trackIndex >= 3) {
        trackIndex = 0;
        obj[key] = value;
        formDataArray.push(obj);
        obj = {};
        return;
      }

      obj[key] = value;
      trackIndex++;
    });

    if (extraValue?.btn_type === "Generate") {
      mutate({
        apiPath: "/tranning",
        method: "post",
        formData: {
          tranning_name: "Induction Training",
          employee_id: extraValue?.employee_id,
          form_data: JSON.stringify(formDataArray),
          action_type: "Generate",
          employee_visibility: true,
        },
        onSuccess() {
          dispatch(setDialog({ dialogId: "", type: "CLOSE" }));
          queryClient.invalidateQueries(["get-tranning-history"]);
        },
      });
      return;
    }

    mutate({
      apiPath: `${path}/complete`,
      method: "put",
      formData: {
        form_data: JSON.stringify(formDataArray),
      },
      id: data?.data.record_id,
      onSuccess() {
        dispatch(setDialog({ dialogId: "", type: "CLOSE" }));
        queryClient.invalidateQueries("get-tranning-info");
        queryClient.invalidateQueries("get-tranning-history");
      },
    });
  }

  return (
    <DialogBody className="min-w-[70rem]">
      <h2 className="font-semibold">INDUCTION TRAINING FORM</h2>
      {
        <HandleSuspence isLoading={isFetching} error={error} dataLength={1}>
          <form action={handleFormSubmit} className="space-y-5 w-full">
            <table className="w-full table-auto">
              <thead className="uppercase w-full border-b border-gray-100">
                <tr>
                  {tableDatas.head.map((item) => (
                    <th
                      className="text-left text-[14px] font-semibold pb-2 px-5 py-4 border-2"
                      key={item}
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableDatas.body.map((itemArray, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-100 group/bodyitem"
                  >
                    {itemArray.map((value, columnIndex) => (
                      <td
                        className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52 border-2"
                        key={value}
                      >
                        {
                          <span className="line-clamp-1 inline-flex gap-x-3 w-full">
                            {columnIndex === 1 ? (
                              <Input
                                name="employee_sign"
                                viewOnly={extraValue?.btn_type === "Generate"}
                                viewOnlyText={`Sign Of ${staffOrFaculty} Member`}
                                label="Sign Here"
                                wrapperCss="w-full"
                                defaultValue={
                                  serilizeData[rowIndex]?.employee_sign
                                }
                              />
                            ) : value === "signOfTrannerQsc" ? (
                              <Input
                                viewOnly={extraValue?.btn_type !== "Generate"}
                                name={`qsc_sign`}
                                label="MR/QSC"
                                wrapperCss="w-full"
                                defaultValue={serilizeData[rowIndex]?.qsc_sign}
                              />
                            ) : value === "signOfTrannerCoOrdinator" ? (
                              <Input
                                viewOnly={extraValue?.btn_type !== "Generate"}
                                name={`tranner_sign`}
                                label="Course Co-Ordinator"
                                wrapperCss="w-full"
                                defaultValue={
                                  serilizeData[rowIndex]?.tranner_sign
                                }
                              />
                            ) : columnIndex === 3 ? (
                              <DateInput
                                viewOnly={extraValue?.btn_type !== "Generate"}
                                name="date"
                                label="Choose Date"
                                date={serilizeData[rowIndex]?.date}
                              />
                            ) : (
                              value
                            )}

                            {columnIndex === 0 ? (
                              <input
                                hidden
                                name="heading"
                                defaultValue={value}
                              />
                            ) : null}
                          </span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-end">
              <Button loading={isLoading} disabled={isLoading}>
                {extraValue?.btn_type !== "Generate" ? "Accept" : "Send"}
              </Button>
            </div>
          </form>
        </HandleSuspence>
      }
    </DialogBody>
  );
}
