"use client";

import { BASE_API } from "@/app/constant";
import { getDate } from "@/app/utils/getDate";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Button from "@/components/Button";
import DateInput from "@/components/DateInput";
import DropDown from "@/components/DropDown";
import HandleDataSuspense from "@/components/HandleDataSuspense";
import HandleSuspence from "@/components/HandleSuspence";
import Input from "@/components/Input";
import {
  ISuccess,
  TConsumable,
  TConsumableCategory,
  TVendorIdName,
} from "@/types";
import axios from "axios";
import { useQueries, UseQueryOptions } from "react-query";

interface IProps {
  params: {
    id?: "add" | number;
  };
}

async function getCategory() {
  return (await axios.get(`${BASE_API}/inventory/category`)).data;
}

async function getSingleConsumable(id: number) {
  return (await axios.get(`${BASE_API}/inventory/consumable/${id}`)).data;
}

async function getVendorIdName() {
  return (await axios.get(`${BASE_API}/inventory/vendor/id-name`)).data;
}

export default function ManageConsumableForm({ params }: IProps) {
  const isNewItem = params.id === "add";

  const [category, vendorIdName, consumable] = useQueries<
    [
      UseQueryOptions<ISuccess<TConsumableCategory[]>>,
      UseQueryOptions<ISuccess<TVendorIdName[]>>,
      UseQueryOptions<ISuccess<TConsumable>>
    ]
  >([
    { queryKey: "get-category", queryFn: getCategory },
    { queryKey: "get-vendor-id-names", queryFn: getVendorIdName },
    {
      queryKey: "get-single-consumable",
      queryFn: async () => getSingleConsumable(params.id as number),
      enabled: !isNewItem,
    },
  ]);

  const { isLoading, mutate } = useDoMutation();

  const handleFormSubmit = (formData: FormData) => {
    if (isNewItem) {
      mutate({
        apiPath: "/inventory/consumable",
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        formData,
      });
      return;
    }

    mutate({
      apiPath: "/inventory/consumable",
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
      <HandleSuspence
        isLoading={consumable.isFetching}
        dataLength={1}
        error={consumable.error}
      >
        <form action={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Input
              required
              name="item_name"
              label="Item Name"
              placeholder="Type Item Name"
              defaultValue={consumable.data?.data.item_name}
            />
            <HandleDataSuspense
              isLoading={category.isFetching}
              data={category.data?.data}
              error={category.error}
            >
              {(category) => (
                <DropDown
                  name="category_id"
                  label="Category"
                  options={category.map((item) => ({
                    text: item.category_name,
                    value: item.category_id,
                  }))}
                  defaultValue={consumable.data?.data.category_id}
                />
              )}
            </HandleDataSuspense>
            <Input
              required
              name="quantity"
              type="number"
              label="Remaining Quantity"
              placeholder="Type Remains Quantity"
              defaultValue={consumable.data?.data.quantity}
            />
            <Input
              required
              type="number"
              name="min_quantity"
              label="Minimum Quantity"
              placeholder="Type Minimum Quantity"
              defaultValue={consumable.data?.data.min_quantity}
            />
            <DateInput
              name="last_purchase_date"
              label="Last Purchased Date"
              date={getDate(
                new Date(consumable.data?.data.last_purchase_date || "")
              )}
            />
            <HandleDataSuspense
              isLoading={vendorIdName.isFetching}
              data={vendorIdName.data?.data}
              error={vendorIdName.error}
            >
              {(vendorIdNameInfo) => (
                <DropDown
                  name="vendor_id"
                  label="Supplier"
                  options={vendorIdNameInfo.map((item) => ({
                    text: item.vendor_name,
                    value: item.vendor_id,
                  }))}
                  defaultValue={consumable.data?.data.vendor_id}
                />
              )}
            </HandleDataSuspense>
            <Input
              required
              type="number"
              name="cost_per_unit"
              label="Cost Per Unit"
              placeholder="Type Cost Per Unit"
              defaultValue={consumable.data?.data.cost_per_unit}
            />
            <Input
              required
              type="number"
              name="total_volume"
              label="Total Volume"
              placeholder="Type Total Volume"
              defaultValue={consumable.data?.data.total_volume}
            />
            <Input
              required
              name="remark"
              label="Remark"
              placeholder="Type Remark"
              defaultValue={consumable.data?.data.remark}
            />
          </div>
          <Button loading={isLoading} disabled={isLoading}>
            Save Info
          </Button>
        </form>
      </HandleSuspence>
    </div>
  );
}
