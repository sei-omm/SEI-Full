"use client";

import { BASE_API } from "@/app/constant";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Button from "@/components/Button";
import DropDownTag from "@/components/DropDownTag";
import HandleSuspence from "@/components/HandleSuspence";
import Input from "@/components/Input";
import { ISuccess, TVendor } from "@/types";
import axios from "axios";
import { useQuery } from "react-query";

interface IProps {
  params: {
    id?: "add" | number;
  };
}

async function getSingleVendor(id: number) {
  return (await axios.get(`${BASE_API}/inventory/vendor/${id}`)).data;
}

export default function VendorForm({ params }: IProps) {
  const isNewItem = params.id === "add";

  const { mutate, isLoading } = useDoMutation();

  const { data, error, isFetching } = useQuery<ISuccess<TVendor>>({
    queryKey: "get-single-vendor",
    queryFn: () => getSingleVendor(params.id as number),
    enabled: !isNewItem,
  });

  const handleFormSubmit = (formData: FormData) => {
    if (isNewItem) {
      mutate({
        apiPath: "/inventory/vendor",
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        formData,
      });
      return;
    }

    mutate({
      apiPath: "/inventory/vendor",
      method: "put",
      headers: {
        "Content-Type": "application/json",
      },
      formData,
      id: params.id as number,
    });
  };

  return (
    <div>
      <HandleSuspence isLoading={isFetching} dataLength={1} error={error}>
        <form action={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Input
              name="vendor_name"
              label="Supplier Name"
              placeholder="Name of Supplier"
              defaultValue={data?.data.vendor_name}
            />
            <Input
              name="service_type"
              label="Supplier Type"
              placeholder="Type of Service"
              defaultValue={data?.data.service_type}
            />
            <Input
              name="address"
              label="Supplier Address"
              placeholder="Enter Supplier Address"
              defaultValue={data?.data.address}
            />
            <Input
              name="contact_details"
              label="Supplier Contact"
              placeholder="Enter Supplier Contact Info"
              defaultValue={data?.data.contact_details}
            />
          </div>
          <DropDownTag
            name="institutes"
            label="Institutes"
            options={[
              { text: "Kolkata", value: "Kolkata" },
              { text: "Faridabad", value: "Faridabad" },
            ]}
            defaultValues={data?.data.institute.split(",") || []}
          />

          <Button
            disabled={isLoading}
            loading={isLoading}
            className={`${isLoading ? "opacity-30" : ""}`}
          >
            Save Info
          </Button>
        </form>
      </HandleSuspence>
    </div>
  );
}