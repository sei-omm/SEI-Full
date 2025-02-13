"use client";

import {
  BASE_API,
  inventoryCatList,
  inventorySubCatList,
} from "@/app/constant";
import { useDoMutation } from "@/app/utils/useDoMutation";
import BackBtn from "@/components/BackBtn";
import Button from "@/components/Button";
import DropDown from "@/components/DropDown";
import HandleDataSuspense from "@/components/HandleDataSuspense";
import HandleSuspence from "@/components/HandleSuspence";
import Input from "@/components/Input";
import { ISuccess, TInventoryItem, TVendorIdName } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import { useQueries, UseQueryResult } from "react-query";

interface IProps {
  params: {
    id: "add" | number;
  };
}

async function getVendorIdName() {
  return (await axios.get(`${BASE_API}/inventory/vendor/id-name`)).data;
}

export default function InventoryListForm({ params }: IProps) {
  const isNewItem = params.id === "add";

  const { isLoading: isMutating, mutate } = useDoMutation();
  const route = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [suppliers, inventoryItem] = useQueries<
    [
      UseQueryResult<ISuccess<TVendorIdName[]>>,
      UseQueryResult<ISuccess<TInventoryItem>>
    ]
  >([
    {
      queryKey: "get-vendor-id-names",
      queryFn: getVendorIdName,
    },
    {
      queryKey: "get-inventory-item-info",
      queryFn: async () =>
        (await axios.get(BASE_API + "/inventory/item/" + params.id)).data,
      refetchOnMount: true,
      enabled: !isNewItem,
    },
  ]);

  function handleFormSubmit(formData: FormData) {
    mutate({
      apiPath: "/inventory/item",
      method: isNewItem ? "post" : "put",
      headers: {
        "Content-Type": "application/json",
      },
      formData,
      id: isNewItem ? undefined : parseInt(params.id as string),
      onSuccess() {
        route.back();
      },
    });
  }

  return (
    <div>
      <HandleSuspence
        isLoading={inventoryItem.isFetching}
        error={inventoryItem.error}
        dataLength={1}
      >
        <div className="space-y-6">
          <div className="bg-white items-start p-10 border card-shdow rounded-3xl space-y-6">
            <form ref={formRef} action={handleFormSubmit} className="space-y-6">
              <h2 className="text-2xl font-semibold uppercase">
                Item information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <Input
                  required
                  name="item_name"
                  label="Name of Item"
                  placeholder="Type Item Name"
                  defaultValue={inventoryItem.data?.data.item_name}
                />
                <DropDown
                  name="category"
                  label="Category"
                  options={inventoryCatList.map((item) => ({
                    text: item.category_name,
                    value: item.category_id,
                  }))}
                  defaultValue={inventoryItem.data?.data.category}
                />
                <HandleDataSuspense
                  error={suppliers.error}
                  isLoading={suppliers.isFetching}
                  data={suppliers?.data?.data}
                >
                  {(supplier) => (
                    <DropDown
                      name="vendor_id"
                      label="Supplier"
                      options={
                        supplier?.map((item) => ({
                          text: item.vendor_name,
                          value: item.vendor_id,
                        })) || []
                      }
                    />
                  )}
                </HandleDataSuspense>
                <DropDown
                  name="sub_category"
                  label="Sub-Category"
                  options={inventorySubCatList.map((item) => ({
                    text: item.sub_category_name,
                    value: item.sub_category_id,
                  }))}
                  defaultValue={inventoryItem.data?.data.sub_category}
                />
                <Input
                  name="where_to_use"
                  label="Where To Be Used"
                  placeholder="Enter Where The Item Going To Use"
                  defaultValue={inventoryItem.data?.data.where_to_use}
                />
                <Input
                  name="used_by"
                  label="Used By"
                  placeholder="Enter Where It Used"
                  defaultValue={inventoryItem.data?.data.used_by}
                />
                <Input
                  name="description"
                  label="Description"
                  placeholder="Type Description"
                  defaultValue={inventoryItem.data?.data.description}
                />
                <Input
                  required
                  type="number"
                  name="minimum_quantity"
                  label="Minimum Quantity to maintain"
                  placeholder="0"
                  defaultValue={inventoryItem.data?.data.minimum_quantity}
                />
                <DropDown
                  name="institute"
                  label="Campus"
                  options={[
                    { text: "Kolkata", value: "Kolkata" },
                    { text: "Faridabad", value: "Faridabad" },
                  ]}
                  defaultValue={inventoryItem.data?.data.institute || "Kolkata"}
                />
              </div>
            </form>

            <div className="flex items-center gap-5">
              <BackBtn />
              <Button
                onClick={() => {
                  formRef.current?.requestSubmit();
                }}
                loading={isMutating}
                disabled={isMutating}
                className={`${isMutating ? "opacity-40" : ""}`}
              >
                Save Item Info
              </Button>
            </div>
          </div>
          {/* {isNewItem ? null : (
            <ProductStockInfo item_id={inventoryItem?.data.item_id as number} />
          )} */}

          {/* <BackBtn /> */}
        </div>
      </HandleSuspence>
    </div>
  );
}
