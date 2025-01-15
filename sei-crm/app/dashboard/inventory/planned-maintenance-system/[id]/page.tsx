"use client";

import { BASE_API } from "@/app/constant";
import { getDate } from "@/app/utils/getDate";
import { useDoMutation } from "@/app/utils/useDoMutation";
import BackBtn from "@/components/BackBtn";
import Button from "@/components/Button";
import DateInput from "@/components/DateInput";
import DropDown from "@/components/DropDown";
import HandleDataSuspense from "@/components/HandleDataSuspense";
import TextArea from "@/components/TextArea";
import { ISuccess, TPlannedMaintenanceSystem } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useQueries, UseQueryResult } from "react-query";

interface IProps {
  params: {
    id: "add" | number;
  };
}

export default function PlannedMaintenanceSystemForm({ params }: IProps) {
  const isNewItem = params.id === "add";

  const formRef = useRef<HTMLFormElement>(null);
  const route = useRouter();

  const [itemsForDropDown, singlePlannedMaintenanceSystem] = useQueries<
    [
      UseQueryResult<ISuccess<{ item_id: number; item_name: string }[]>>,
      UseQueryResult<ISuccess<TPlannedMaintenanceSystem>>
    ]
  >([
    {
      queryKey: ["get-items-for-drop-down"],
      queryFn: async () =>
        (await axios.get(BASE_API + "/inventory/item/drop-down")).data,
    },
    {
      queryKey: ["get-signle-planned-maintenance-system"],
      queryFn: async () =>
        (
          await axios.get(
            BASE_API + "/inventory/planned-maintenance-system/" + params.id
          )
        ).data,
      refetchOnMount: true,
    },
  ]);

  const { mutate, isLoading } = useDoMutation();

  function handleSubmit(formData: FormData) {
    mutate({
      apiPath: "/inventory/planned-maintenance-system",
      method: isNewItem ? "post" : "put",
      formData,
      id: isNewItem ? undefined : parseInt(params.id.toString()),
      onSuccess() {
        route.back();
      },
    });
  }

  return (
    <div>
      <form ref={formRef} action={handleSubmit}>
        <div className="grid grid-cols-2 py-5 gap-6">
          <HandleDataSuspense
            isLoading={itemsForDropDown.isLoading}
            error={itemsForDropDown.error}
            data={itemsForDropDown.data?.data}
          >
            {(items) => (
              <DropDown
                name="item_id"
                label="Choose Item"
                options={items.map((item) => ({
                  text: item.item_name,
                  value: item.item_id,
                }))}
                defaultValue={
                  singlePlannedMaintenanceSystem?.data?.data?.item_id
                }
              />
            )}
          </HandleDataSuspense>
          <DropDown
            name="frequency"
            label="Frequency"
            options={[
              { text: "Daily", value: "Daily" },
              { text: "Weekly", value: "Weekly" },
              { text: "Monthly", value: "Monthly" },
              { text: "Half Yearly", value: "Half Yearly" },
              { text: "Yearly", value: "Yearly" },
            ]}
            defaultValue={singlePlannedMaintenanceSystem?.data?.data?.frequency}
          />
          <DateInput
            required
            name="last_done"
            label="Last Done"
            date={getDate(
              new Date(
                singlePlannedMaintenanceSystem?.data?.data.last_done || ""
              )
            )}
          />
          <DateInput
            required
            name="next_due"
            label="Next Due"
            date={getDate(
              new Date(
                singlePlannedMaintenanceSystem?.data?.data.next_due || ""
              )
            )}
          />
          <TextArea
            required
            name="description"
            label="Checks / Maintenance Required"
            placeholder="Type here..."
            rows={8}
            value={singlePlannedMaintenanceSystem?.data?.data?.description}
          />
          <TextArea
            rows={8}
            name="remark"
            label="Remarks"
            placeholder="Type here..."
            value={singlePlannedMaintenanceSystem?.data?.data?.remark}
          />
        </div>
      </form>
      <div className="flex items-center gap-5">
        <BackBtn />
        <Button
          onClick={() => {
            formRef.current?.requestSubmit();
          }}
          loading={isLoading}
          disabled={isLoading}
          type="submit"
        >
          Save Information
        </Button>
      </div>
    </div>
  );
}
