"use client";

import { BASE_API } from "@/app/constant";
import Button from "@/components/Button";
import HandleSuspence from "@/components/HandleSuspence";
import { ISuccess, TConsumable } from "@/types";
import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CiEdit } from "react-icons/ci";
import { IoIosAdd } from "react-icons/io";
import { useQuery } from "react-query";

type TTable = {
  heads: string[];
  body: (string | null)[][];
};

export default function Consumable() {
  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: [
      "Item Name",
      "Category",
      "Quantity",
      "Supplier",
      "Cost Per Unit",
      "Action",
    ],
    body: [],
  });

  const searchParams = useSearchParams();

  const {
    data: consumableFetchedData,
    isFetching,
    error,
  } = useQuery<ISuccess<TConsumable[]>>({
    queryKey: ["get-all-consumable-info", searchParams.toString()],
    queryFn: async () =>
      (
        await axios.get(
          `${BASE_API}/inventory/consumable?${searchParams.toString()}`
        )
      ).data,
    onSuccess(data) {
      const tableItems: TTable = { ...tableDatas };

      tableItems.body = data.data.map((item) => [
        item.item_name,
        item.category_name,
        item.quantity.toString(),
        item.vendor_name,
        item.cost_per_unit.toString(),
        "actionBtn",
      ]);

      setTableDatas(tableItems);
    },
    refetchOnMount: true,
  });

  return (
    <div className="w-full space-y-5">

      {/* <ConsumableFilter /> */}

      <div className="flex items-end justify-end">
        <Link href={"/dashboard/inventory/consumable/add"}>
          <Button className="flex-center gap-3">
            <IoIosAdd size={18} />
            Add New Item
          </Button>
        </Link>
      </div>

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={consumableFetchedData?.data.length}
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
                    {itemArray.map((value) => (
                      <td
                        className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                        key={value}
                      >
                        {value === "actionBtn" ? (
                          <div className="flex items-center gap-3">
                            <Link
                              className="active:scale-90"
                              href={`/dashboard/inventory/consumable/${consumableFetchedData?.data?.[rowIndex]?.consumable_id}`}
                            >
                              <CiEdit className="cursor-pointer" size={18} />
                            </Link>
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
    </div>
  );
}
