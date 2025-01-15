"use client";

import {
  BASE_API,
  inventoryCatList,
  inventorySubCatList,
} from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import Button from "@/components/Button";
import DropDown from "@/components/DropDown";
import HandleSuspence from "@/components/HandleSuspence";
import Pagination from "@/components/Pagination";
import MultiInventoryItemForm from "@/components/SingleLineForms/MultiInventoryItemForm";
import { ISuccess, TInventoryWithStockItem } from "@/types";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CiEdit, CiSearch } from "react-icons/ci";
import { useQuery } from "react-query";

type TTable = {
  heads: string[];
  body: (string | null | undefined)[][];
};

export default function InventoryList() {
  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: [
      "Item Name",
      "Category",
      "Sub Category",
      "Opening Stock",
      "Minimum Stock",
      "Consumed Stock",
      "Status",
      "Last Purchased Date",
      "Supplier",
      "Cost per Unit (Current Cost)",
      "Cost per Unit (Previous Cost)",
      "Total Value",
    ],
    body: [],
  });

  const [selectedCheckboxItemId, setSelectedCheckboxItemId] = useState<
    number | undefined
  >(undefined);

  const searchParamas = useSearchParams();

  const handleCheckboxChange = (id: number | undefined) => {
    if (selectedCheckboxItemId === id) {
      setSelectedCheckboxItemId(undefined);
      return;
    }
    setSelectedCheckboxItemId(id);
  };

  const route = useRouter();

  const { data, error, isFetching } = useQuery<
    ISuccess<TInventoryWithStockItem[]>
  >({
    queryKey: ["inventory-item-list", searchParamas.toString()],
    queryFn: async () => {
      const response = await fetch(
        BASE_API + "/inventory/item?" + searchParamas.toString()
      );
      return await response.json();
    },
    onSuccess(data) {
      const body = data.data.map((item) => [
        item.item_name,
        inventoryCatList.find((cat) => cat.category_id === item.category)
          ?.category_name,
        inventorySubCatList.find(
          (subCat) => subCat.sub_category_id === item.sub_category
        )?.sub_category_name,
        item.opening_stock?.toString(),
        item.minimum_quantity.toString(),
        item.item_consumed?.toString(),
        // item.closing_stock.toString(),
        item.current_status,
        beautifyDate(item.current_purchase_date),
        item.current_vendor_name,
        item.cost_per_unit_current?.toString(),
        item.cost_per_unit_previous?.toString(),
        `₹${item.total_value}`,
      ]);

      setTableDatas((prev) => ({ ...prev, body }));
    },
    refetchOnMount: true,
  });

  function handleFilterSumit(formData: FormData) {
    const urlSearchParams = new URLSearchParams();
    formData.forEach((value, key) => {
      if (value.toString() !== "-1") {
        urlSearchParams.set(key, value.toString());
      }
    });

    route.push(
      `/dashboard/inventory/inventory-list?${urlSearchParams.toString()}`,
      {
        scroll: false,
      }
    );
  }

  return (
    <div className="space-y-10">
      <form
        action={handleFilterSumit}
        className="flex gap-6 justify-end items-end"
      >
        <DropDown
          name="institute"
          label="Campus"
          options={[
            { text: "Choose Campus", value: "-1" },
            {
              text: "Kolkata",
              value: "Kolkata",
            },
            { text: "Faridabad", value: "Faridabad" },
          ]}
          defaultValue={searchParamas.get("institute") || "-1"}
        />
        <DropDown
          name="category"
          label="Category"
          options={[
            { text: "Choose Category", value: "-1" },
            ...inventoryCatList.map((cat) => ({
              text: cat.category_name,
              value: cat.category_id,
            })),
          ]}
          defaultValue={searchParamas.get("category") || "-1"}
        />
        <Button className="flex-center gap-3 mb-2">
          <CiSearch />
          Search
        </Button>
      </form>

      {/* <div className="flex items-end gap-6">
        <Link href={"/dashboard/inventory/inventory-list/add"}>
          <Button className="flex-center gap-3">
            <IoIosAdd size={18} />
            Add New Record
          </Button>
        </Link>
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
      </div> */}
      {/* <MultiInventoryListForm /> */}
      <MultiInventoryItemForm selectedCheckboxItemId={selectedCheckboxItemId} />

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={data?.data.length}
      >
        <div className="w-full overflow-hidden card-shdow">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
            <table className="min-w-max w-full table-auto">
              <thead className="uppercase w-full border-b border-gray-100">
                <tr>
                  {tableDatas.heads.map((item) => (
                    <th
                      className="text-left text-[14px] font-semibold pb-2 px-5 py-4"
                      key={item}
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableDatas.body.map((itemArray, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-100 group/bodyitem"
                  >
                    {itemArray.map((value, columnIndex) => (
                      <td
                        className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                        key={value}
                      >
                        {value === "actionBtn" ? (
                          <div className="flex items-center gap-3">
                            <Link
                              className="active:scale-90"
                              href={`/dashboard/inventory/consumable/`}
                            >
                              <CiEdit className="cursor-pointer" size={18} />
                            </Link>
                          </div>
                        ) : columnIndex === 0 ? (
                          <div>
                            <input
                              onChange={() =>
                                handleCheckboxChange(
                                  data?.data[rowIndex].item_id
                                )
                              }
                              type="checkbox"
                              checked={
                                selectedCheckboxItemId ===
                                data?.data[rowIndex]?.item_id
                              }
                              className="mr-2 cursor-pointer"
                            />
                            {value}
                          </div>
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </HandleSuspence>
      <Pagination dataLength={data?.data.length} />
    </div>
  );
}
