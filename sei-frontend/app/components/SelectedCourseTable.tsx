"use client";

import { useEffect, useState } from "react";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import Button from "./Button";
import { IoAddOutline } from "react-icons/io5";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { deleteCourseFromCart } from "../redux/slice/courseCart.slice";


type TTableBody = (string | number)[][];
type TTable = {
  head: string[];
  body: TTableBody;
};

export default function SelectedCourseTable() {
  const courseCart = useSelector((state: RootState) => state.courseCart);
  const searchParams = useSearchParams();

  const dispatch = useDispatch();

  const [tableDatas, setTableDatas] = useState<TTable>({
    head: ["Course Name", "Batch Date", "Price", "Action"],
    body: courseCart.map((item) => [
      item.course_name,
      item.batch_start_date,
      item.course_price,
      "actionBtn",
    ]),
  });

  // useEffect(() => {
  //   if (isDeleteBtnClicked.current === true) {
  //     const allBatchesStartDate = searchParams.getAll("bsd");
  //     const allBatchesEndDate = searchParams.getAll("bed");
  //     const allBatchesIds = searchParams.getAll("bid");
  //     if (
  //       allBatchesStartDate.length !== multi_course_price_info.length ||
  //       allBatchesEndDate.length !== multi_course_price_info.length ||
  //       allBatchesIds.length !== multi_course_price_info.length
  //     ) {
  //       return notFound();
  //     }
  //     const tableData: TTableBody = [];
  //     // const cartStateData: TCourseCart[] = [];
  //     multi_course_price_info.forEach((item, index) => {
  //       tableData.push([
  //         item.course_name + ` (${item.course_id}) `,
  //         allBatchesStartDate[index],
  //         item.total_price,
  //         "actionBtn",
  //       ]);
  //       // cartStateData.push({
  //       //   batch_id: parseInt(allBatchesIds[index]),
  //       //   batch_start_date: allBatchesStartDate[index],
  //       //   batch_end_date: allBatchesEndDate[index],
  //       //   course_id: item.course_id,
  //       //   course_name: item.course_name,
  //       //   course_price: item.total_price,
  //       // });

  //     });

  //     // dispatch(setCourseCart(cartStateData));
  //     setTableDatas((preState) => ({ head: preState.head, body: tableData }));
  //     isDeleteBtnClicked.current = false;
  //   }
  // }, [searchParams.size]);

  useEffect(() => {
    setTableDatas((preState) => ({
      head: preState.head,
      body: courseCart.map((item) => [
        item.course_name,
        item.batch_start_date,
        item.course_price,
        "actionBtn",
      ]),
    }));
  }, [courseCart]);

  const handleCourseRemoveFromCartBtn = (rowIndex: number) => {
    dispatch(deleteCourseFromCart(rowIndex));

    // isDeleteBtnClicked.current = true;
    // const urlSearchParams = new URLSearchParams();
    // const bid = searchParams
    //   .getAll("bid")
    //   .filter((_, index) => index !== rowIndex);
    // const bsd = searchParams
    //   .getAll("bsd")
    //   .filter((_, index) => index !== rowIndex);
    // const bed = searchParams
    //   .getAll("bed")
    //   .filter((_, index) => index !== rowIndex);
    // const courseIds = searchParams
    //   .getAll("course-id")
    //   .filter((_, index) => index !== rowIndex);
    // bid.forEach((eachBid, index) => {
    //   urlSearchParams.append("course-id", courseIds[index]);
    //   urlSearchParams.append("bid", eachBid);
    //   urlSearchParams.append("bsd", bsd[index]);
    //   urlSearchParams.append("bed", bed[index]);
    // });
    // dispatch(deleteCourseFromCart(rowIndex));
    // // const allBatchesStartDate = searchParams.getAll("bsd");
    // // const allBatchesEndDate = searchParams.getAll("bed");
    // // const allBatchesIds = searchParams.getAll("bid");
    // // const tableData: TTableBody = [];
    // // const cartStateData: TCourseCart[] = [];
    // // multi_course_price_info.splice(rowIndex, 1);
    // // allBatchesStartDate.splice(rowIndex, 1);
    // // allBatchesEndDate.splice(rowIndex, 1);
    // // allBatchesIds.splice(rowIndex, 1);
    // // multi_course_price_info.forEach((item, index) => {
    // //   // if (index !== rowIndex) {
    // //   urlSearchParams.append("course-id", item.course_id.toString());
    // //   urlSearchParams.append("bid", allBatchesIds[index]);
    // //   urlSearchParams.append("bsd", allBatchesStartDate[index]);
    // //   urlSearchParams.append("bed", allBatchesEndDate[index]);
    // //   tableData.push([
    // //     item.course_name,
    // //     allBatchesStartDate[index],
    // //     item.total_price,
    // //     "actionBtn",
    // //   ]);
    // //   cartStateData.push({
    // //     batch_id: parseInt(allBatchesIds[index]),
    // //     batch_start_date: allBatchesStartDate[index],
    // //     batch_end_date: allBatchesEndDate[index],
    // //     course_id: item.course_id,
    // //     course_name: item.course_name,
    // //     course_price: item.total_price,
    // //   });
    // //   // }
    // // });
    // // dispatch(setCourseCart(cartStateData));
    // // setTableDatas((preState) => ({ head: preState.head, body: tableData }));
    // route.push("/apply-course?" + urlSearchParams.toString());
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
                ) : (
                  value
                )}
              </td>
            ))}
          </tr>
        ))}
      </table>

      <div className="w-full flex items-center justify-end">
        <Link href={"/our-courses/kolkata?" + searchParams.toString()}>
          <Button
            type="button"
            className="mt-4 active:scale-90 !bg-white border !border-gray-500 !text-foreground"
          >
            Add More Course
            <IoAddOutline />
          </Button>
        </Link>
      </div>
    </div>
  );
}
