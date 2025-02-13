import React, { useState } from "react";
import DialogBody from "../DialogBody";
import Input from "@/components/Input";
import DateInput from "@/components/DateInput";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import TextArea from "@/components/TextArea";
import Button from "@/components/Button";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { queryClient } from "@/redux/MyProvider";
import { useQuery } from "react-query";
import { ISuccess } from "@/types";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import HandleSuspence from "@/components/HandleSuspence";

type TrainingRecord = {
  courses: string;
  date_of_application: string; // You can use Date if you plan to work with Date objects
  proposed_name: string;
  title_of_course: string;
  subject: string;
  period: string;
  brief_purpose_reason: string;
  recomended_by: string;
  comment_hoi: string;
};

export default function TrainingRequirement() {
  const { extraValue } = useSelector((state: RootState) => state.dialogs);
  const staffOrFaculty =
    extraValue?.employee_type === "Faculty" ? "Faculty" : "Staff";

  const dispatch = useDispatch();
  const [serilizeData, setSerilizeData] = useState<TrainingRecord | null>(null);

  const { error, isFetching, data } = useQuery<
    ISuccess<{ form_data: string | null; record_id: number }>
  >({
    queryKey: "get-tranning-form-data",
    queryFn: async () =>
      (
        await axios.get(
          `${BASE_API}/tranning/one-form?employee_id=${extraValue?.employee_id}&tranning_name=Training Requirement`
        )
      ).data,
    enabled: extraValue?.btn_type !== "Generate",
    onSuccess(data) {
      if (data.data.form_data !== null) {
        const response = JSON.parse(data.data.form_data) as TrainingRecord;
        setSerilizeData(response);
      }
    },
    refetchOnMount: true,
  });

  const { isLoading, mutate } = useDoMutation();
  function handleFormSubmit(formData: FormData) {
    if (!confirm("Are you sure you want to complete the form ?")) return;

    const formObj: any = {};
    formData.forEach((value, key) => {
      formObj[key] = value;
    });

    if (extraValue?.btn_type === "Generate") {
      mutate({
        apiPath: "/tranning",
        method: "post",
        formData: {
          tranning_name: "Training Requirement",
          employee_id: extraValue?.employee_id,
          form_data: JSON.stringify(formObj),
          action_type: "Generate",
          employee_visibility: false,
        },
        onSuccess() {
          dispatch(setDialog({ dialogId: "", type: "CLOSE" }));
          queryClient.invalidateQueries(["get-tranning-history"]);
        },
      });
      return;
    }

    mutate({
      apiPath: "/tranning/complete",
      method: "put",
      formData: {
        form_data: JSON.stringify(formObj),
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
    <DialogBody className="min-w-[45rem] max-h-[90%] overflow-y-auto">
      <h2 className="font-semibold">TRAINING REQUIREMENT FORM</h2>

      <HandleSuspence isLoading={isFetching} error={error} dataLength={1}>
        <form action={handleFormSubmit} className="space-y-3">
          <div className="flex items-center gap-3 *:flex-grow">
            <Input
              name="courses"
              label="Course:"
              defaultValue={serilizeData?.courses}
            />
            <DateInput
              name="date_of_application"
              label="Date of Application :"
              date={serilizeData?.date_of_application}
            />
          </div>
          <TextArea
            name="proposed_name"
            label={`Proposed name(s) of ${staffOrFaculty} to receive training:`}
            defaultValue={serilizeData?.proposed_name}
          />

          <h2 className="font-semibold text-gray-500">Proposed training:</h2>
          <TextArea
            name="title_of_course"
            label="Title of course:"
            defaultValue={serilizeData?.title_of_course}
          />
          <TextArea
            name="subject"
            label="Nature/Type of subject:"
            defaultValue={serilizeData?.subject}
          />
          <TextArea
            name="period"
            label="Period:"
            defaultValue={serilizeData?.period}
          />

          <TextArea
            name="brief_purpose_reason"
            label="Brief purpose/reason required for specific training:"
            defaultValue={serilizeData?.brief_purpose_reason}
          />

          <Input
            name="recomended_by"
            label="Recommended by: "
            defaultValue={serilizeData?.recomended_by}
          />
          <TextArea
            name="comment_hoi"
            label="Comments by Head of the Institute:"
            defaultValue={serilizeData?.comment_hoi}
          />

          <div className="flex items-center justify-end">
            <Button loading={isLoading} disabled={isLoading}>
              {extraValue?.btn_type !== "Generate" ? "Do Complete" : "Generate"}
            </Button>
          </div>
        </form>
      </HandleSuspence>
    </DialogBody>
  );
}
