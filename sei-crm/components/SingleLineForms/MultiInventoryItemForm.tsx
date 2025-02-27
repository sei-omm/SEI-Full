import React, { useState } from "react";
import Button from "../Button";
import { IoIosAdd } from "react-icons/io";
import { CiEdit } from "react-icons/ci";
import { useRouter } from "next/navigation";
import Input from "../Input";
import DropDown from "../DropDown";
import { inventoryCatList, inventorySubCatList } from "@/app/constant";
import { AiOutlineDelete } from "react-icons/ai";
import { queryClient } from "@/redux/MyProvider";
import { useDoMutation } from "@/app/utils/useDoMutation";
import HandleDataSuspense from "../HandleDataSuspense";
import { ISuccess, TVendorIdName } from "@/types";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import Link from "next/link";

interface IProps {
  selectedCheckboxItemId: number | undefined;
  suppliersIsFetching: boolean;
  supplierError: any;
  suppliers?: ISuccess<TVendorIdName[]>;
}

export default function MultiInventoryItemForm({
  selectedCheckboxItemId,
  suppliersIsFetching,
  supplierError,
  suppliers,
}: IProps) {
  const route = useRouter();

  const [inputs, setInputs] = useState<number[]>([]);

  const { isLoading, mutate } = useDoMutation();
  const dispatch = useDispatch();

  function handleSubmit(formData: FormData) {
    const datasToStore: any[] = [];
    let trackIndex = 0;

    let obj: any = {};

    formData.forEach((value, key) => {
      if (trackIndex >= 8) {
        trackIndex = 0;
        if (key === "completed_date" && value === "") {
          obj[key] = null;
        } else {
          obj[key] = value;
        }
        datasToStore.push(obj);
        obj = {};
        return;
      }

      if (key === "completed_date" && value === "") {
        obj[key] = null;
      } else {
        obj[key] = value;
      }
      trackIndex++;
    });

    mutate({
      apiPath: "/inventory/item/multi",
      method: "post",
      formData: datasToStore,
      onSuccess() {
        queryClient.invalidateQueries("inventory-item-list");
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
      <div className="flex items-center justify-between">
        <div className="flex items-end gap-6">
          <Button
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
            Add New Item
          </Button>

          <Button
            onClick={() => {
              route.push(
                `/dashboard/inventory/inventory-list/${selectedCheckboxItemId}`
              );
            }}
            disabled={!selectedCheckboxItemId}
            className={`flex-center gap-3 ${
              selectedCheckboxItemId
                ? "opacity-100 active:scale-95"
                : "active:!scale-100 opacity-50"
            }`}
          >
            <CiEdit size={18} />
            Edit Record
          </Button>

          <Button
            onClick={() => {
              dispatch(
                setDialog({ dialogId: "add-inventory-stock", type: "OPEN" })
              );
            }}
            className="flex-center gap-3"
          >
            <IoIosAdd size={18} />
            Add Stock
          </Button>
        </div>
        <Link href={"/dashboard/report/inventory"}>
          <Button>Open Report</Button>
        </Link>
      </div>

      {inputs.length === 0 ? null : (
        <form action={handleSubmit} className="space-y-5 min-h-screen">
          {inputs.length === 0 ? null : (
            <div className="w-full overflow-x-auto space-y-5 py-10">
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
                    label="Name of Item *"
                    placeholder="Type Item Name"
                  />
                  <DropDown
                    name="category"
                    label="Category *"
                    options={inventoryCatList.map((item) => ({
                      text: item.category_name,
                      value: item.category_id,
                    }))}
                  />
                  <DropDown
                    name="sub_category"
                    label="Sub-Category *"
                    options={inventorySubCatList.map((item) => ({
                      text: item.sub_category_name,
                      value: item.sub_category_id,
                    }))}
                  />
                  <HandleDataSuspense
                    error={supplierError}
                    isLoading={suppliersIsFetching}
                    data={suppliers?.data}
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
                    name="description"
                    label="Description"
                    placeholder="Type Description"
                  />
                  <Input
                    required
                    type="number"
                    name="minimum_quantity"
                    label="Minimum Quantity to maintain *"
                    placeholder="0"
                  />
                  <DropDown
                    name="institute"
                    label="Campus *"
                    options={[
                      { text: "Kolkata", value: "Kolkata" },
                      { text: "Faridabad", value: "Faridabad" },
                    ]}
                  />
                </div>
              ))}
            </div>
          )}

          {inputs.length !== 0 ? (
            <div className="w-full flex items-center justify-end">
              <Button loading={isLoading} disabled={isLoading}>
                Save Info
              </Button>
            </div>
          ) : null}
        </form>
      )}
    </div>
  );
}
