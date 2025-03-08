"use client";

import { useEffect, useState } from "react";
import { MdOutlineDeleteOutline } from "react-icons/md";
import Button from "./Button";
import { IoAddOutline } from "react-icons/io5";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { queryClient } from "../redux/MyProvider";
import { IResponse, TCourseBatches } from "../type";
import { formateDate } from "../utils/formateDate";
import { useRouter } from "next/navigation";

type TTableBody = (string | number)[][];
type TTable = {
  head: string[];
  body: TTableBody;
};

export default function SelectedCourseTable() {
  const searchParams = useSearchParams();

  const [querString, setQueryString] = useState("");

  useEffect(() => {
    setQueryString(searchParams.toString());
  }, [searchParams.toString()]);

  const cartData = queryClient.getQueriesData([
    "get-batch-info",
    searchParams.toString(),
  ])[0][1] as IResponse<TCourseBatches[]> | undefined;
  const route = useRouter();
  const pathname = usePathname();

  const [tableDatas, setTableDatas] = useState<TTable>({
    head: ["SI No", "Course Name", "Batch Start Date", "Batch End Date", "Price", "Action"],
    body: [],
  });

  useEffect(() => {
    if (cartData) {
      setTableDatas({
        head: ["SI No", "Course Name", "Batch Start Date", "Batch End Date", "Price", "Action"],
        body: cartData?.data.map((item) => [
          item.course_showing_order,
          item.course_name || "",
          item.start_date,
          item.end_date,
          item.batch_fee,
          "actionBtn",
        ]),
      });
    } else {
      setTableDatas({
        head: ["SI No", "Course Name", "Batch Start Date", "Batch End Date", "Price", "Action"],
        body: [],
      });
    }
  }, [cartData]);

  const handleCourseRemoveFromCartBtn = (rowIndex: number) => {
    const idToRemove = cartData?.data[rowIndex].batch_id;
    if (idToRemove) {
      const urlSearchParams = new URLSearchParams();
      searchParams.forEach((value, key) => {
        if (parseInt(value) !== idToRemove) {
          urlSearchParams.set(key, value);
        }
      });
      route.push(`${pathname}?${urlSearchParams.toString()}`, {
        scroll: false,
      });
      return;
    }

    if(querString) {}
    alert("No Id For Remove");
    setQueryString("nodb");
  };

  return (
    <div>
      <table className="w-full *:border *:p-3 *:border-[#E9B858]">
        <tr className="*:p-3 *:border-2 border-[#E9B858]">
          {tableDatas.head.map((cHeading, index) => (
            <th
              className="text-left *:border-2 border-[#E9B858] *:p-3"
              key={"TH-" + index}
            >
              {cHeading}
            </th>
          ))}
        </tr>
        {tableDatas.body.map((item, rowIndex) => (
          <tr
            key={"Row-" + rowIndex}
            className="*:border-2 border-[#E9B858] *:p-3"
          >
            {item.map((value, columnIndex) => (
              <td className="border-[#E9B858]" key={"Value-" + columnIndex}>
                {value === "actionBtn" ? (
                  <MdOutlineDeleteOutline
                    onClick={() => handleCourseRemoveFromCartBtn(rowIndex)}
                    size={20}
                    className="cursor-pointer active:scale-90"
                  />
                ) : columnIndex === 2 || columnIndex === 3 ? (
                  formateDate(value.toString())
                ) : (
                  value
                )}
              </td>
            ))}
          </tr>
        ))}
      </table>

      <div className="w-full flex items-center justify-end">
        <Link
          href={`/our-courses/${
            localStorage
              ? localStorage.getItem("user-selected-institute")?.toLowerCase()
              : "kolkata"
          }?${searchParams.toString()}`}
        >
          <Button
            type="button"
            className="mt-4 active:scale-90 !bg-red-600 animate-pulse !text-white border !border-gray-500 !text-foreground"
          >
            Add More Course
            <IoAddOutline />
          </Button>
        </Link>
      </div>
    </div>
  );
}
