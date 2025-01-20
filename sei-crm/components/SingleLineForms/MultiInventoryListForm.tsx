import React, { useState } from "react";
import Button from "../Button";
import { IoIosAdd } from "react-icons/io";
import { AiOutlineDelete } from "react-icons/ai";
import Input from "../Input";
import DropDown from "../DropDown";
import {
  BASE_API,
  inventoryCatList,
  inventorySubCatList,
} from "@/app/constant";
import DateInput from "../DateInput";
import HandleDataSuspense from "../HandleDataSuspense";
import { useQueries, UseQueryResult } from "react-query";
import { ISuccess, TVendorIdName } from "@/types";
import axios from "axios";

async function getVendorIdName() {
  return (await axios.get(`${BASE_API}/inventory/vendor/id-name`)).data;
}

// async function getItemStockInfo(id: number) {
//   return (await axios.get(`${BASE_API}/inventory/item-stock/${id}`)).data;
// }

export default function MultiInventoryListForm() {
  const [inputs, setInputs] = useState<number[]>([]);
  function handleFormAction() {}

  function handleDeleteItem(index: number) {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  }

  const [suppliers] = useQueries<
    [
      UseQueryResult<ISuccess<TVendorIdName[]>>
      // UseQueryResult<ISuccess<TInventoryStock>>
    ]
  >([
    {
      queryKey: "get-vendor-id-names",
      queryFn: getVendorIdName,
    },
    //   {
    //     queryKey: ["get-item-stock-info", extraValue.stock_id],
    //     queryFn: () => getItemStockInfo(extraValue.stock_id),
    //     enabled: !isNewItem,
    //   },
  ]);

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
          Add New Record
        </Button>
      </div>

      <form action={handleFormAction} className="w-full space-y-5">
        {inputs.length === 0 ? null : (
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
                  name="item_name"
                  label="Name of Item"
                  placeholder="Type Item Name"
                />

                <DropDown
                  name="category"
                  label="Category"
                  options={inventoryCatList.map((item) => ({
                    text: item.category_name,
                    value: item.category_id,
                  }))}
                />
                <DropDown
                  name="sub_category"
                  label="Sub-Category"
                  options={inventorySubCatList.map((item) => ({
                    text: item.sub_category_name,
                    value: item.sub_category_id,
                  }))}
                />
                <Input
                  name="description"
                  label="Description"
                  placeholder="Type Description"
                />
                <Input
                  name="where_to_use"
                  label="Where To Be Used"
                  placeholder="Enter Where The Item Going To Use"
                />
                <Input
                  name="used_by"
                  label="Used By"
                  placeholder="Enter Where It Used"
                />
                <Input
                  name="opening_stock"
                  label="Opening Stock"
                  placeholder="Enter Where It Used"
                  type="number"
                />
                <Input
                  required
                  type="number"
                  name="minimum_quantity"
                  label="Minimum Quantity to maintain"
                  placeholder="0"
                />
                <Input
                  required
                  type="number"
                  name="item_consumed"
                  label="Item Consumed"
                  placeholder="0"
                />
                <Input
                  required
                  type="number"
                  name="closing_stock"
                  label="Closing Stock"
                  placeholder="0"
                />
                <Input name="status" label="Status" placeholder="Type Here.." />
                <DateInput
                  name="last_purchsed_date"
                  label="Last Purchased Date"
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
                      options={supplier.map((item) => ({
                        text: item.vendor_name,
                        value: item.vendor_id,
                      }))}
                    />
                  )}
                </HandleDataSuspense>

                <Input
                  required
                  name="remark"
                  label="Remark"
                  placeholder="Type Here.."
                />
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
