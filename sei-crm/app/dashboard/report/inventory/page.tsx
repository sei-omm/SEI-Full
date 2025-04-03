"use client";

import { BASE_API, inventoryCatKeyValue, inventorySubCatKeyValue } from "@/app/constant";
import { beautifyDate } from "@/app/utils/beautifyDate";
import DateDurationFilter from "@/components/DateDurationFilter";
import GenarateExcelReportBtn from "@/components/GenarateExcelReportBtn";
import HandleSuspence from "@/components/HandleSuspence";
import { IError, ISuccess } from "@/types";
import axios, { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { useQuery } from "react-query";

// type TInventoryItem = {
//   purchase_date: string; // ISO 8601 date string
//   item_id: number; // Unique identifier for the item
//   item_name: string; // Name of the item
//   minimum_quantity: number; // Minimum quantity required
//   vendor_id: number; // Unique identifier for the vendor
//   vendor_name: string; // Name of the vendor
//   added_stocks: string; // Number of stocks added (as a string)
//   each_stock_cpu: string; // Cost per unit (as a string)
//   stock_added_status: string; // Status message for added stocks
//   each_stock_total_value: string; // Total value of added stocks (as a string)
//   consumed_stock: string; // Number of stocks consumed (as a string)
//   consumed_stock_remark: string;
//   opening_stock: number;
//   closing_stock: number;
// };

interface TInventoryItem {
  row_id: number;
  item_id: number;
  item_name: string;
  category: number;
  sub_category: number;
  where_to_use: string;
  used_by: string;
  description: string;
  minimum_quantity: number;
  current_status: string;
  vendor_id: number;
  institute: string;
  created_at: string; // You may also use Date if you want to handle it as a Date object
  closing_stock: number;
  opening_stock: number;
  item_consumed: number;
  stock_added: number;
  total_value: number;
  cost_per_unit_current: number;
  cost_per_unit_previous: number;
  current_purchase_date: string; // Same as above, can be Date
  report_date: string; // Same as above, can be Date
  vendor_name: string;
  remark : string;
}

export default function InventoryReport() {
  const searchParams = useSearchParams();

  const [tableDatas, setTableDatas] = useState<{
    heads: string[];
    body: (string | null | number)[][];
  }>({
    heads: [
      "Name of Item",
      "Category",
      "Sub Category",
      "Description",
      "WHERE TO BE USED",
      "Used By",
      "Opening Stock",
      "Minimum Quantity to maintain",
      "Item Consumed",
      "Stock Added",
      "Closing Stock",
      "Status",
      "Last Purchased Date",
      "Supplier",
      "Cost per Unit (Current Cost)",
      "Cost per Unit (Previous Cost)",
      "Total Value",
      "Remarks",
    ],
    body: [],
  });

  const {
    data: report,
    error,
    isFetching,
  } = useQuery<ISuccess<TInventoryItem[]>, AxiosError<IError>>(
    ["get-inventory-report", searchParams.toString()],
    async () =>
      (
        await axios.get(
          `${BASE_API}/report/inventory${
            searchParams.size != 0 ? `?${searchParams.toString()}` : ""
          }`
        )
      ).data,
    {
      onSuccess: (data) => {
        const oldStates = { ...tableDatas };
        if (data.data.length === 0) return;

        oldStates.body = data.data.map((item) => [
          item.item_name,
          inventoryCatKeyValue[`${item.category}`],
          inventorySubCatKeyValue[`${item.sub_category}`],
          item.description,
          item.where_to_use,
          item.used_by,
          item.opening_stock,
          item.minimum_quantity,
          item.item_consumed,
          item.stock_added,
          item.closing_stock,
          item.current_status,
          beautifyDate(item.current_purchase_date),
          item.vendor_name,
          item.cost_per_unit_current,
          item.cost_per_unit_previous,
          item.total_value,
          item.remark
        ]);

        setTableDatas(oldStates);
      },
      enabled: searchParams.size != 0,
      cacheTime: 0,
    }
  );

  return (
    <div className="space-y-8">
      <DateDurationFilter
        fromDateLable="From Purchase Date *"
        toDateLable="To Purchase Date *"
      />

      <div className="flex justify-end">
        <GenarateExcelReportBtn
          apiPath={`/report/inventory/excel?${searchParams.toString()}`}
          text="Generate Inventory Report"
          hidden={searchParams.size === 0 || report?.data.length === 0}
        />
      </div>

      <HandleSuspence
        isLoading={isFetching}
        dataLength={report?.data.length}
        error={error}
      >
        <div className="w-full overflow-hidden card-shdow">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
            <table className="min-w-max w-full table-auto">
              <thead className="uppercase w-full border-b border-gray-100">
                <tr>
                  {tableDatas.heads.map((item, index) => (
                    <th
                      className={`text-left text-[14px] font-semibold pb-2 px-5 py-4 ${
                        index === 0 ? "sticky left-0 z-10 p-0 bg-gray-100" : ""
                      }`}
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
                    {itemArray.map((value, colIndex) => (
                      <td
                        className={`text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52 ${
                          colIndex === 0
                            ? "sticky left-0 z-10 p-0 bg-gray-100"
                            : ""
                        }`}
                        key={value}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </HandleSuspence>
    </div>
  );
}
