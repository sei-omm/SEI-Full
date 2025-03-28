"use client";

import { useDoMutation } from "@/app/utils/useDoMutation";
import React from "react";
import Button from "../Button";
import Campus from "../Campus";


export default function LeaveRecheckBtns() {
  const { isLoading, mutate } = useDoMutation();
  return <div className="flex items-center justify-between">
  {/* <DropDown
    changeSearchParamsOnChange
    label="Choose Institute"
    name="institute"
    options={[
      {
        text: "Kolkata",
        value: "Kolkata",
      },
      {
        text: "Faridabad",
        value: "Faridabad",
      },
    ]}
    defaultValue={searchParams.institute}
  /> */}
  <Campus changeSearchParamsOnChange/>

  <div className="flex items-center gap-4">
    <Button
      disabled={isLoading}
      loading={isLoading}
      onClick={() => {
        mutate({
          apiPath: "/hr/leave/add-earn-leave",
          method: "post",
        });
      }}
    >
      Recheck Earn Leaves
    </Button>
    <Button
      onClick={() => {
        mutate({
          apiPath: "/hr/leave/add-yearly-leave",
          method: "post",
        });
      }}
    >
      Recheck Leave Yearly
    </Button>
  </div>
</div>;
}
