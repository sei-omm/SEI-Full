"use client";

import {
  BASE_API,
  inventoryCatList,
  inventorySubCatList,
} from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { stickyFirstCol } from "@/app/utils/stickyFirstCol";
import Button from "@/components/Button";
import DropDown from "@/components/DropDown";
import GenarateExcelReportBtn from "@/components/GenarateExcelReportBtn";
import HandleSuspence from "@/components/HandleSuspence";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import MultiInventoryItemForm from "@/components/SingleLineForms/MultiInventoryItemForm";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { ISuccess, TInventoryWithStockItem, TVendorIdName } from "@/types";
import axios from "axios";
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";
import { BiLayerMinus } from "react-icons/bi";
import { CiSearch } from "react-icons/ci";
import { IoIosAdd } from "react-icons/io";
import { useQueries, UseQueryResult } from "react-query";
import { useDispatch } from "react-redux";

type TTable = {
  heads: string[];
  body: (string | null | undefined)[][];
};

async function getVendorIdName() {
  return (await axios.get(`${BASE_API}/inventory/vendor/id-name`)).data;
}

async function getInventoryTableList(searchParamas: ReadonlyURLSearchParams) {
  const response = await fetch(
    BASE_API + "/inventory/item?" + searchParamas.toString()
  );
  return await response.json();
}

export default function InventoryList() {
  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: [
      "Item Name",
      // "Add Stock",
      "Consume Stock",
      "Category",
      "Sub Category",
      "Minimum Stock",
      "Opening Stock",
      "CLOSING STOCK",
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

  const dispatch = useDispatch();

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

  // const { data, error, isFetching } = useQuery<
  //   ISuccess<TInventoryWithStockItem[]>
  // >({
  //   queryKey: ["inventory-item-list", searchParamas.toString()],
  //   queryFn: async () => {
  //     const response = await fetch(
  //       BASE_API + "/inventory/item?" + searchParamas.toString()
  //     );
  //     return await response.json();
  //   },
  //   onSuccess(data) {
  //     const body = data.data.map((item) => [
  //       item.item_name,
  //       "actionBtnAddStock",
  //       "actionBtnConsumeStock",
  //       inventoryCatList.find((cat) => cat.category_id === item.category)
  //         ?.category_name,
  //       inventorySubCatList.find(
  //         (subCat) => subCat.sub_category_id === item.sub_category
  //       )?.sub_category_name,
  //       item.closing_stock?.toString(),
  //       item.minimum_quantity.toString(),
  //       item.item_consumed?.toString(),
  //       // item.closing_stock.toString(),
  //       item.current_status,
  //       beautifyDate(item.current_purchase_date),
  //       item.current_vendor_name,
  //       item.cost_per_unit_current?.toString(),
  //       item.cost_per_unit_previous?.toString(),
  //       `₹${item.total_value}`,
  //     ]);

  //     setTableDatas((prev) => ({ ...prev, body }));
  //   },
  //   refetchOnMount: true,
  // });

  const [suppliers, inventory_list] = useQueries<
    [
      UseQueryResult<ISuccess<TVendorIdName[]>>,
      UseQueryResult<ISuccess<TInventoryWithStockItem[]>>
    ]
  >([
    {
      queryKey: "get-vendor-id-names",
      queryFn: getVendorIdName,
    },
    {
      queryKey: ["inventory-item-list", searchParamas.toString()],
      queryFn: () => getInventoryTableList(searchParamas),
      refetchOnMount: true,
      onSettled(data: any) {
        const finalData = data as ISuccess<TInventoryWithStockItem[]>;
        const body = finalData.data.map((item) => [
          item.item_name,
          "actionBtnConsumeStock",
          inventoryCatList.find((cat) => cat.category_id === item.category)
            ?.category_name,
          inventorySubCatList.find(
            (subCat) => subCat.sub_category_id === item.sub_category
          )?.sub_category_name,
          item.minimum_quantity.toString(),
          item.opening_stock?.toString(),
          item.closing_stock?.toString(),
          item.item_consumed?.toString(),
          // item.closing_stock.toString(),
          item.current_status,
          item.current_purchase_date
            ? beautifyDate(item.current_purchase_date)
            : null,
          item.vendor_name,
          item.cost_per_unit_current?.toString(),
          item.cost_per_unit_previous?.toString(),
          `₹${item.total_value}`,
        ]);

        setTableDatas((prev) => ({ ...prev, body }));
      },
    },
  ]);

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
      <div className="flex items-end justify-between">
        <div className="pb-2">
          <GenarateExcelReportBtn
            apiPath={`/report/inventory/export/excel?${searchParamas.toString()}`}
            hidden={searchParamas.get("search") !== null}
            text="Export In Excel"
          />
        </div>
        <form
          action={handleFilterSumit}
          className="flex gap-6 justify-end items-end"
        >
          <DropDown
            name="institute"
            label="Choose Campus"
            options={[
              { text: "All Campus", value: "-1" },
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
            label="Choose Category"
            options={[
              { text: "All Category", value: "-1" },
              ...inventoryCatList.map((cat) => ({
                text: cat.category_name,
                value: cat.category_id,
              })),
            ]}
            defaultValue={searchParamas.get("category") || "-1"}
          />
          {/* <DateInput
          label="Choose Purchase Date"
          name="current_purchase_date"
          date={getDate(
            new Date(searchParamas.get("current_purchase_date") || "")
          )}
        /> */}
          <Button className="flex-center gap-3 mb-2">
            <CiSearch />
            Search
          </Button>
        </form>
      </div>

      <SearchInput
        placeHolder="Search by item name"
        handleSearch={(searchText) => {
          route.push(
            `/dashboard/inventory/inventory-list?search=${searchText}`,
            {
              scroll: false,
            }
          );
        }}
      />

      <MultiInventoryItemForm
        selectedCheckboxItemId={selectedCheckboxItemId}
        supplierError={suppliers.error}
        suppliersIsFetching={suppliers.isFetching}
        suppliers={suppliers.data}
      />

      <HandleSuspence
        isLoading={inventory_list.isFetching}
        error={inventory_list.error}
        dataLength={inventory_list.data?.data.length}
      >
        <div className="w-full overflow-hidden card-shdow">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
            <table className="min-w-max w-full table-auto">
              <thead className="uppercase w-full border-b border-gray-100">
                <tr>
                  {tableDatas.heads.map((item, index) => (
                    <th
                      className={`text-left text-[14px] font-semibold pb-2 px-5 py-4 ${stickyFirstCol(
                        index
                      )}`}
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
                        className={`text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52 ${stickyFirstCol(
                          columnIndex
                        )}`}
                        key={value}
                      >
                        {value === "actionBtnAddStock" ? (
                          <Button
                            onClick={() =>
                              dispatch(
                                setDialog({
                                  dialogId: "add-inventory-stock",
                                  type: "OPEN",
                                  extraValue: {
                                    item_id:
                                      inventory_list.data?.data[rowIndex]
                                        .item_id,
                                  },
                                })
                              )
                            }
                          >
                            <IoIosAdd size={17} color="#fff" />
                          </Button>
                        ) : value === "actionBtnConsumeStock" ? (
                          <Button
                            onClick={() => {
                              dispatch(
                                setDialog({
                                  dialogId: "inventory-stock-consume-dialog",
                                  type: "OPEN",
                                  extraValue: {
                                    item_id:
                                      inventory_list.data?.data[rowIndex]
                                        .item_id,
                                    remain_stock:
                                      inventory_list.data?.data[rowIndex]
                                        .closing_stock,

                                    minimum_stock:
                                      inventory_list.data?.data[rowIndex]
                                        .minimum_quantity,
                                    item_name:
                                      inventory_list.data?.data[rowIndex]
                                        .item_name,
                                  },
                                })
                              );
                            }}
                          >
                            <BiLayerMinus size={17} color="#fff" />
                          </Button>
                        ) : columnIndex === 0 ? (
                          <div>
                            <input
                              onChange={() =>
                                handleCheckboxChange(
                                  inventory_list.data?.data[rowIndex].item_id
                                )
                              }
                              type="checkbox"
                              checked={
                                selectedCheckboxItemId ===
                                inventory_list.data?.data[rowIndex]?.item_id
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
      <Pagination dataLength={inventory_list.data?.data.length} />
    </div>
  );
}
