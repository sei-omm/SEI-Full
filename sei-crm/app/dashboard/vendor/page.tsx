"use client";

import { BASE_API } from "@/app/constant";
import Button from "@/components/Button";
import HandleSuspence from "@/components/HandleSuspence";
import VendorFilter from "@/components/Inventory/VendorFilter";
import { ISuccess, TVendor } from "@/types";
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

export default function Vendor() {
  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: [
      "Name of Suppliers",
      "Type of Service",
      "Institutes",
      "Contact",
      "Action",
    ],
    body: [],
  });

  const searchParams = useSearchParams();

  const {
    data: durableFetchedData,
    isFetching,
    error,
  } = useQuery<ISuccess<TVendor[]>>({
    queryKey: ["get-vendor-info", searchParams.toString()],
    queryFn: async () =>
      (
        await axios.get(
          `${BASE_API}/inventory/vendor?${searchParams.toString()}`
        )
      ).data,
    onSuccess(data) {
      const tableItems: TTable = { ...tableDatas };

      tableItems.body = data.data.map((item) => [
        item.vendor_name,
        item.service_type,
        item.institute,
        item.contact_details,
        "actionBtn",
      ]);

      setTableDatas(tableItems);
    },
    refetchOnMount: true,
  });

  return (
    <div className="w-full space-y-5">
      <VendorFilter />

      <div className="flex items-end justify-end">
        <Link href={"/dashboard/vendor/add"}>
          <Button className="flex-center gap-3">
            <IoIosAdd size={18} />
            Add New Vendor
          </Button>
        </Link>
      </div>

      <HandleSuspence isLoading={isFetching} error={error} dataLength={durableFetchedData?.data.length}>
        <div className="w-full overflow-hidden card-shdow">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
            <table className="min-w-max w-full table-auto">
              <thead className="uppercase w-full border-b border-gray-100">
                <tr>
                  {tableDatas.heads?.map?.((item) => (
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
                {tableDatas.body?.map?.((itemArray, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-100 group/bodyitem"
                  >
                    {itemArray.map((value, columnIndex) => (
                      <td
                        className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                        key={value}
                      >
                        {columnIndex === 2 ? (
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
                              href={`/dashboard/vendor/${durableFetchedData?.data[rowIndex].vendor_id}`}
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
