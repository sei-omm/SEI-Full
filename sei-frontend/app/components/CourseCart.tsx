"use client";

import { IoAddOutline, IoPricetagOutline } from "react-icons/io5";
import {
  MdOutlineDateRange,
  MdOutlineShoppingCart,
  MdUpdate,
} from "react-icons/md";
import Button from "./Button";
import { FaAngleDown, FaLongArrowAltDown } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { formateDate } from "../utils/formateDate";
import { useEffect, useState } from "react";
import { useIsAuthenticated } from "../hooks/useIsAuthenticated";
import { setDialog } from "../redux/slice/dialog.slice";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useScrollChecker } from "../hooks/useScrollChecker";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "../constant";
import { IResponse, TCourseBatches } from "../type";
import HandleLoading from "./HandleLoading";
import { hasOverlappingBatchDate } from "../utils/hasOverlappingBatchDate";
import { AiOutlineDelete } from "react-icons/ai";

export default function CourseCart() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams();

  const [isExpand, setIsExpand] = useState(true);

  const loginState = useSelector((state: RootState) => state.loginStatus);

  const { scrollingDirection } = useScrollChecker();

  const { isAuthenticated } = useIsAuthenticated([loginState]);

  useEffect(() => {
    setIsExpand(false);
  }, [pathname]);

  const { data, isFetching, error } = useQuery<
    IResponse<TCourseBatches[]> | undefined
  >({
    queryKey: ["get-batch-info", searchParams.toString()],
    queryFn: async () => {
      const ids: string[] = [];
      searchParams.forEach((value, key) => {
        if (key.includes("bid")) {
          ids.push(value);
        }
      });
      if (ids.length === 0) return;
      return (
        await axios.get(
          `${BASE_API}/course/get-batch?batch_ids=${ids.join(",")}`
        )
      ).data;
    },
  });

  const handleEnrollBtnClick = () => {
    if (!isAuthenticated) {
      return dispatch(
        setDialog({ type: "OPEN", dialogKey: "student-login-dialog" })
      );
    }

    const isOverlaping = hasOverlappingBatchDate(data?.data || []);
    if (isOverlaping) {
      return alert(
        "You are choosing batches with overlapping dates. Please select a different batch."
      );
    }

    router.push("/apply-course?" + searchParams.toString());
  };

  const handleDeleteCourse = (course_id: number) => {
    const urlSearchParams = new URLSearchParams(searchParams);
    urlSearchParams.delete(`bid${course_id}`);
    router.push(`${pathname}?${urlSearchParams.toString()}`, { scroll: false });
  };

  return (
    <div
      className={`${
        searchParams.size !== 0 && searchParams.toString().includes("bid")
          ? "fixed"
          : "hidden"
      }  ${
        isExpand ? "bg-white" : "bg-[#E9B858]"
      } border border-gray-300 bottom-10 right-10 z-10 card-shdow shadow-2xl rounded-2xl p-5 max-w-[35rem] sm:right-0 ${
        isExpand ? "sm:left-0" : ""
      } ${
        scrollingDirection === "DOWN" ? "sm:bottom-5" : "sm:bottom-20"
      } sm:transition-all sm:duration-500 sm:p-3 sm:mx-2 sm:max-w-full`}
    >
      {isExpand ? null : (
        <div
          onClick={() => setIsExpand(!isExpand)}
          className="flex items-center min-w-28 gap-10 *:cursor-pointer"
        >
          <span className="font-semibold flex items-center gap-2">
            <MdOutlineShoppingCart className="mt-[3px]" />
            Applied Courses
          </span>

          <FaAngleDown size={20} className="cursor-pointer rotate-180" />
        </div>
      )}

      <div className={`space-y-5 ${isExpand ? "block" : "hidden"}`}>
        <div className="flex items-center justify-between">
          <span className="font-semibold">
            Total : <span className="font-inter">₹</span>
            {data?.data?.reduce(
              (accumulator, current) => accumulator + current.batch_fee,
              0
            )}
          </span>

          <FaAngleDown
            onClick={() => setIsExpand(!isExpand)}
            size={20}
            className="cursor-pointer"
          />
        </div>
        <HandleLoading
          isLoading={isFetching}
          error={error}
          dataLength={data?.data?.length}
        >
          <ul className="space-y-6 overflow-y-auto max-h-96 notice-board-scroll">
            {data?.data?.map((item) => (
              <li key={item.batch_id} className="relative">
                <div className="absolute top-0 bottom-0 w-3 bg-[#E9B858] mt-[1px] rounded-2xl"></div>
                <div className="pl-5 space-y-1">
                  <span>
                    <h3 className="font-semibold line-clamp-1">
                      {item.course_name}
                    </h3>
                    <AiOutlineDelete
                      onClick={() => handleDeleteCourse(item.course_id)}
                      className="float-right cursor-pointer active:scale-90"
                    />
                  </span>
                  <div className="flex items-center flex-wrap gap-x-5 gap-y-2 *:text-gray-600 *:font-semibold">
                    <div className="flex items-center gap-2">
                      <MdOutlineDateRange />

                      <span className="text-sm">
                        Start : {formateDate(item.start_date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MdUpdate />
                      <span className="text-sm">
                        End : {formateDate(item.end_date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <IoPricetagOutline />
                      <span className="text-sm">
                        <span className="font-inter">₹</span>
                        {parseInt(`${item.batch_fee}`)}
                      </span>
                    </div>
                  </div>
                  {/* <button
                onClick={() => dispatch(deleteCourseFromCart(index))}
                className="flex items-center text-red-600 cursor-pointer text-sm active:scale-90"
              >
                Delete
              </button> */}
                </div>
              </li>
            ))}
          </ul>
        </HandleLoading>
        <div className="flex items-center flex-wrap gap-3">
          <Button
            onClick={handleEnrollBtnClick}
            className="w-full !bg-[#E9B858] border active:scale-90 !border-gray-500 !text-foreground"
          >
            Enroll Now
            <FaLongArrowAltDown className="-rotate-90" />
          </Button>
          <Button
            onClick={() => setIsExpand(false)}
            className="w-full active:scale-90 !bg-white border !border-gray-500 !text-foreground"
          >
            Add More Course
            <IoAddOutline />
          </Button>
        </div>
      </div>
    </div>
  );
}
