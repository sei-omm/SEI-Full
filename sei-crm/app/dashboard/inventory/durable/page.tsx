"use client";

import { BASE_API } from "@/app/constant";
import Button from "@/components/Button";
import HandleSuspence from "@/components/HandleSuspence";
import DurableFilter from "@/components/Inventory/DurableFilter";
import { ISuccess, TDurable } from "@/types";
import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { CiEdit } from "react-icons/ci";
import { IoIosAdd } from "react-icons/io";
import { useQuery } from "react-query";

type TTable = {
  heads: string[];
  body: (string | null)[][];
};

export default function Durable() {
  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: [
      "Room Name",
      "Is Room Avilable",
      "Floor",
      "Rows In Room",
      "Capasity",
      "Items",
      "Action",
    ],
    body: [],
  });

  const searchParams = useSearchParams();

  const {
    data: durableFetchedData,
    isFetching,
    error,
  } = useQuery<ISuccess<TDurable[]>>({
    queryKey: ["get-single-durable-info", searchParams.toString()],
    queryFn: async () =>
      (
        await axios.get(
          `${BASE_API}/inventory/durable?${searchParams.toString()}`
        )
      ).data,
    onSuccess(data) {
      const tableItems: TTable = { ...tableDatas };

      tableItems.body = data.data.map((item) => [
        item.room_name,
        item.is_available.toString(),
        item.floor.toString(),
        item.number_of_rows.toString(),
        item.capasity.toString(),
        item.available_items,
        "actionBtn",
      ]);

      setTableDatas(tableItems);
    },
    refetchOnMount: true,
  });

  return (
    <div className="w-full space-y-5">
      <DurableFilter />

      <div className="flex items-end justify-end">
        <Link href={"/dashboard/inventory/durable/add"}>
          <Button className="flex-center gap-3">
            <IoIosAdd size={18} />
            Add New Record
          </Button>
        </Link>
      </div>

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={durableFetchedData?.data.length}
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
                        {columnIndex === 5 ? (
                          <div className="flex items-center gap-3 flex-wrap">
                            {value?.split(",").map((item) => (
                              <div
                                key={item}
                                className="px-2 py-1 bg-green-200 border rounded-lg border-green-950 text-xs"
                              >
                                {item}
                              </div>
                            ))}
                          </div>
                        ) : value === "actionBtn" ? (
                          <div className="flex items-center gap-3">
                            <Link
                              className="active:scale-90"
                              href={`/dashboard/inventory/durable/${durableFetchedData?.data?.[rowIndex]?.durable_id}`}
                            >
                              <CiEdit className="cursor-pointer" size={18} />
                            </Link>
                          </div>
                        ) : columnIndex === 1 ? (
                          <div
                            className={`px-2 py-1 w-max ${
                              value === "true" ? "bg-green-500" : "bg-red-500"
                            } text-xs rounded-lg text-white`}
                          >
                            {value === "true" ? "Yes" : "No"}
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
