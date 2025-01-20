"use client";

import React, { useState } from "react";
import Input from "../Input";
import Button from "../Button";
import MultiSelectDropDown from "../MultiSelectDropDown";

import { IoIosAdd } from "react-icons/io";
import { AiOutlineDelete } from "react-icons/ai";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { queryClient } from "@/redux/MyProvider";

export default function MultiVendorForm() {
  const [inputs, setInputs] = useState<number[]>([]);

  const { isLoading, mutate } = useDoMutation();

  function handleFormSubmit(formData: FormData) {
    const datasToStore: any[] = [];
    let trackIndex = 0;

    let obj: any = {};

    formData.forEach((value, key) => {
      if (trackIndex >= 4) {
        trackIndex = 0;
        obj[key] = value;
        datasToStore.push(obj);
        obj = {};
        return;
      }

      obj[key] = value;
      trackIndex++;
    });

    mutate({
      apiPath: "/inventory/vendor/multi",
      method: "post",
      formData: datasToStore,
      onSuccess() {
        queryClient.invalidateQueries("get-vendor-info");
        setInputs([]);
      },
    });
  }

  function handleDeleteItem(index: number) {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  }
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-end">
        <Button
          type="button"
          onClick={() => {
            const preStates = [...inputs];
            preStates.push(
              preStates.length === 0 ? 1 : preStates[preStates.length - 1] + 1
            );
            setInputs(preStates);
          }}
          className="flex-center gap-3"
        >
          <IoIosAdd size={18} />
          Add New Vendor
        </Button>
      </div>
      <form action={handleFormSubmit} className="space-y-5">
        {inputs.length !== 0 ? (
          <div className="w-full overflow-x-auto space-y-5 pb-20">
            {inputs.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-5 *:min-w-60 relative"
              >
                <div className="!min-w-6 pt-5">
                  <AiOutlineDelete
                    onClick={() => handleDeleteItem(index)}
                    className="cursor-pointer"
                  />
                </div>
                <Input
                  required
                  inputLayoutWrapperCss="py-1"
                  name="vendor_name"
                  label="Supplier Name *"
                  placeholder="Name of Supplier"
                />
                <Input
                  required
                  name="service_type"
                  label="Supplier Type *"
                  placeholder="Type of Service"
                />
                <Input
                  required
                  name="address"
                  label="Supplier Address *"
                  placeholder="Enter Supplier Address"
                />
                <Input
                  required
                  name="contact_details"
                  label="Supplier Contact *"
                  placeholder="Enter Supplier Contact Info"
                />
                <MultiSelectDropDown
                  key={"Multiple Institute"}
                  label="Campus *"
                  name="institute"
                  options={[
                    { text: "Kolkata", value: "Kolkata" },
                    { text: "Faridabad", value: "Faridabad" },
                  ]}
                  defaultValue={["Kolkata"]}
                />
              </div>
            ))}
          </div>
        ) : null}

        {inputs.length !== 0 ? (
          <div className="w-full flex items-center justify-end">
            <Button loading={isLoading} disabled={isLoading}>
              Save Info
            </Button>
          </div>
        ) : null}
      </form>
    </div>
  );
}
