import React, { useState } from "react";
import DialogBody from "../DialogBody";
import TextArea from "@/components/TextArea";
import DateInput from "@/components/DateInput";
import Button from "@/components/Button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { ISuccess } from "@/types";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import HandleSuspence from "@/components/HandleSuspence";
import { queryClient } from "@/redux/MyProvider";

type TrainingRecord = {
  topic_of_seminal_workshop: string;
  place: string;
  attended_date: string; // You can use Date if you plan to work with Date objects
  employee_attended_program: string;
};

export default function SkillEnhancementForm() {
  const { extraValue } = useSelector((state: RootState) => state.dialogs);
  const staffOrFaculty =
    extraValue?.employee_type === "Faculty" ? "Faculty" : "Staff";

  const [serilizeData, setSerilizeData] = useState<TrainingRecord | null>(null);

  const dispatch = useDispatch();

  const { isLoading, mutate } = useDoMutation();
  function handleFormSubmit(formData: FormData) {
    if (!confirm("Are you sure you want to send the form ?")) return;

    const formObj: any = {};
    formData.forEach((value, key) => {
      formObj[key] = value;
    });

    mutate({
      apiPath: "/tranning",
      method: "post",
      formData: {
        employee_id: extraValue?.employee_id,
        se_form_data: JSON.stringify(formObj),
        action_type:
          extraValue?.btn_type === "Generate" ? "Generate" : "Accept",
      },
      onSuccess() {
        dispatch(setDialog({ dialogId: "", type: "CLOSE" }));
        if (extraValue?.btn_type === "Generate") {
          // queryClient.invalidateQueries(["tranning-list"]);
        } else {
          queryClient.invalidateQueries(["get-tranning-info"]);
        }
      },
    });
  }

  const { error, isFetching } = useQuery<
    ISuccess<{ se_form_data: string | null }>
  >({
    queryKey: "get-tranning-form-data",
    queryFn: async () =>
      (
        await axios.get(
          `${BASE_API}/tranning/one-tranning-form?employee_id=${extraValue?.employee_id}&col_name=se_form_data`
        )
      ).data,
    enabled: extraValue?.btn_type !== "Generate",
    onSuccess(data) {
      if (data.data.se_form_data !== null) {
        const response = JSON.parse(data.data.se_form_data) as TrainingRecord;
        setSerilizeData(response);
      }
    },
    refetchOnMount: true,
  });

  return (
    <DialogBody className="min-w-[45rem]">
      <h2 className="font-semibold">SKILL ENHANCEMENT TRAINING FORM</h2>

      <HandleSuspence isLoading={isFetching} error={error} dataLength={1}>
        <form action={handleFormSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <TextArea
              name="topic_of_seminal_workshop"
              label="Topic of Seminar/Workshop:"
              placeholder="Type here.."
              defaultValue={serilizeData?.topic_of_seminal_workshop}
            />
            <TextArea
              defaultValue={serilizeData?.place}
              name="place"
              label="Place:"
              placeholder="Type here.."
            />
          </div>
          <DateInput
            name="attended_date"
            label="Date attended:"
            date={serilizeData?.attended_date}
          />

          <TextArea
            name="employee_attended_program"
            label={`Name of ${staffOrFaculty} attended the program: `}
            role="5"
            placeholder="Type here.."
            defaultValue={serilizeData?.employee_attended_program}
          />
          <div className="flex items-center justify-end">
            <Button loading={isLoading} disabled={isLoading}>
              {extraValue?.btn_type !== "Generate" ? "Accept" : "Send"}
            </Button>
          </div>
        </form>
      </HandleSuspence>
    </DialogBody>
  );
}
