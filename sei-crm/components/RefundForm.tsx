"use client";

import React, { useState } from "react";
import Input from "./Input";
import DropDown from "./DropDown";
import { ISuccess, TEnrollCourses } from "@/types";
import TextArea from "./TextArea";
import axios from "axios";
import { useQuery } from "react-query";
import { useSearchParams } from "next/navigation";
import { BASE_API } from "@/app/constant";
import HandleSuspence from "./HandleSuspence";

interface IProps {
  student_course_info: TEnrollCourses[] | undefined;
  selected_batch_id: number | undefined;
}
export default function RefundForm({
  student_course_info,
  selected_batch_id,
}: IProps) {
  const [batchId, setBatchId] = useState(
    selected_batch_id ?? student_course_info?.[0].batch_id
  );
  const searchParams = useSearchParams();

  const { data, isFetching, error } = useQuery<ISuccess<{ amount: number }>>({
    queryKey: ["paid-amount", batchId],
    queryFn: async () =>
      (
        await axios.get(
          `${BASE_API}/payment/get-paid-amount?student_id=${searchParams.get(
            "student-id"
          )}&batch_id=${batchId}`
        )
      ).data,
  });

  return (
    <div className="flex items-center gap-4 *:flex-grow *:basis-60 flex-wrap">
      <input value={batchId} type="hidden" name="batch_id" />
      <DropDown
        label="Choose Course *"
        name="course_id"
        options={
          student_course_info?.map((item) => ({
            text: item.course_name,
            value: item.course_id,
          })) || []
        }
        onChange={(oItem) => {
          const currentBatchId = student_course_info?.find(
            (item) => item.course_id === oItem.value
          )?.batch_id;
          setBatchId(currentBatchId);
        }}
        defaultValue={
          student_course_info?.find(
            (item) => item.batch_id === selected_batch_id
          )?.course_id
        }
      />
      <HandleSuspence isLoading={isFetching} error={error} dataLength={1}>
        <Input
          required
          moneyInput
          label={`Refund Amount (Amount Paid ₹${data?.data.amount}) *`}
          type="number"
          name="refund_amount"
          placeholder="Refund Amount"
          defaultValue={data?.data.amount}
          min={data?.data.amount && data.data.amount > 0 ? data.data.amount : 1}
          max={data?.data.amount || 0}
        />
      </HandleSuspence>
      <TextArea
        required
        label="Reason *"
        name="refund_reason"
        placeholder="Type Here.."
      />
      <TextArea
        required
        label="Bank Details *"
        name="bank_details"
        placeholder="Type Here.."
      />
      <Input
        required
        label="Executive Name *"
        type="text"
        name="executive_name"
        placeholder="Name Of Executive"
      />
      <Input
        label="Refund Id"
        type="text"
        name="refund_id"
        placeholder="Refund Id"
      />
    </div>
  );
}
