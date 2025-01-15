"use client";

import {
  BASE_API,
  inventoryCatList,
  inventorySubCatList,
} from "@/app/constant";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Button from "@/components/Button";
import DropDown from "@/components/DropDown";
import HandleSuspence from "@/components/HandleSuspence";
import Input from "@/components/Input";
import ProductStockInfo from "@/components/Inventory/ProductStockInfo";
import { ISuccess, TInventoryItem } from "@/types";
import axios from "axios";
import React from "react";
import { useQuery } from "react-query";

interface IProps {
  params: {
    id: "add" | number;
  };
}

export default function InventoryListForm({ params }: IProps) {
  const isNewItem = params.id === "add";

  const { isLoading: isMutating, mutate } = useDoMutation();
  const {
    data: inventoryItem,
    isFetching,
    error,
  } = useQuery<ISuccess<TInventoryItem>>({
    queryKey: "get-inventory-item-info",
    queryFn: async () =>
      (await axios.get(BASE_API + "/inventory/item/" + params.id)).data,
    enabled: !isNewItem,
    refetchOnMount: true,
  });

  function handleFormSubmit(formData: FormData) {
    mutate({
      apiPath: "/inventory/item",
      method: isNewItem ? "post" : "put",
      headers: {
        "Content-Type": "application/json",
      },
      formData,
      id: isNewItem ? undefined : parseInt(params.id as string),
    });
  }

  return (
    <div>
      <HandleSuspence isLoading={isFetching} error={error} dataLength={1}>
        <div className="space-y-6">
          <form action={handleFormSubmit} className="space-y-6">
            <div className="bg-white items-start p-10 border card-shdow rounded-3xl space-y-6">
              <h2 className="text-2xl font-semibold uppercase">
                Item information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <Input
                  required
                  name="item_name"
                  label="Name of Item"
                  placeholder="Type Item Name"
                  defaultValue={inventoryItem?.data.item_name}
                />
                <DropDown
                  name="category"
                  label="Category"
                  options={inventoryCatList.map((item) => ({
                    text: item.category_name,
                    value: item.category_id,
                  }))}
                  defaultValue={inventoryItem?.data.category}
                />
                <DropDown
                  name="sub_category"
                  label="Sub-Category"
                  options={inventorySubCatList.map((item) => ({
                    text: item.sub_category_name,
                    value: item.sub_category_id,
                  }))}
                  defaultValue={inventoryItem?.data.sub_category}
                />
                <Input
                  name="where_to_use"
                  label="Where To Be Used"
                  placeholder="Enter Where The Item Going To Use"
                  defaultValue={inventoryItem?.data.where_to_use}
                />
                <Input
                  name="used_by"
                  label="Used By"
                  placeholder="Enter Where It Used"
                  defaultValue={inventoryItem?.data.used_by}
                />
                <Input
                  name="description"
                  label="Description"
                  placeholder="Type Description"
                  defaultValue={inventoryItem?.data.description}
                />
                <Input
                  required
                  type="number"
                  name="minimum_quantity"
                  label="Minimum Quantity to maintain"
                  placeholder="0"
                  defaultValue={inventoryItem?.data.minimum_quantity}
                />
                <DropDown
                  name="institute"
                  label="Campus"
                  options={[
                    { text: "Kolkata", value: "Kolkata" },
                    { text: "Faridabad", value: "Faridabad" },
                  ]}
                  defaultValue={inventoryItem?.data.institute || "Kolkata"}
                />
              </div>

              <Button
                loading={isMutating}
                disabled={isMutating}
                className={`${isMutating ? "opacity-40" : ""}`}
              >
                Save Item Info
              </Button>
            </div>
          </form>
          {isNewItem ? null : (
            <ProductStockInfo item_id={inventoryItem?.data.item_id as number} />
          )}
        </div>
      </HandleSuspence>
    </div>
  );
}
