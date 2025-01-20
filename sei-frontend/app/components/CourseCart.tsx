"use client";

import { IoAddOutline, IoPricetagOutline } from "react-icons/io5";
import { MdOutlineDateRange, MdUpdate } from "react-icons/md";
import Button from "./Button";
import { FaAngleDown, FaLongArrowAltDown } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { formateDate } from "../utils/formateDate";
import { useEffect, useState } from "react";
import { useIsAuthenticated } from "../hooks/useIsAuthenticated";
import { setDialog } from "../redux/slice/dialog.slice";
import { usePathname, useRouter } from "next/navigation";
import { useScrollChecker } from "../hooks/useScrollChecker";

export default function CourseCart() {
  const courseCart = useSelector((state: RootState) => state.courseCart);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const [isExpand, setIsExpand] = useState(true);

  const urlSearchParams = new URLSearchParams();
  courseCart.forEach((item) => {
    urlSearchParams.append("course-id", `${item.course_id}`);
    urlSearchParams.append("bsd", `${item.batch_start_date}`);
    urlSearchParams.append("bed", `${item.batch_end_date}`);
    urlSearchParams.append("bid", `${item.batch_id}`);
  });

  const loginState = useSelector((state: RootState) => state.loginStatus);

  const {  scrollingDirection } = useScrollChecker();

  const { isAuthenticated } = useIsAuthenticated([loginState]);

  const handleEnrollBtnClick = () => {
    if (!isAuthenticated) {
      return dispatch(
        setDialog({ type: "OPEN", dialogKey: "student-login-dialog" })
      );
    }
    router.push("/apply-course");
    // setIsExpand(false)
  };

  useEffect(() => {
    setIsExpand(false)
  }, [pathname])

  // //here i am going to check is the user selected tab menu or not
  // // ex : if anyone select faridabad then reset the cart
  // useEffect(() => {
  //   dispatch(clearCourseCart());
  // }, [pathname]);

  return (
    <div
      className={`${courseCart.length === 0 ? "hidden" : "fixed"}  ${
        isExpand ? "bg-white" : "bg-[#E9B858]"
      } border border-gray-300 bottom-10 right-10 z-10 card-shdow shadow-2xl rounded-2xl p-5 sm:right-0 ${isExpand ? "sm:left-0" : ""} ${scrollingDirection === "DOWN" ? "sm:bottom-5" : "sm:bottom-20"} sm:transition-all sm:duration-500 sm:p-3 sm:mx-2 sm:max-w-full`}
    >
      {isExpand ? null : (
        <div
          onClick={() => setIsExpand(!isExpand)}
          className="flex items-center min-w-28 gap-10 *:cursor-pointer"
        >
          <span className="font-semibold">Applied Courses</span>

          <FaAngleDown size={20} className="cursor-pointer rotate-180" />
        </div>
      )}

      <div className={`space-y-5 ${isExpand ? "block" : "hidden"}`}>
        <div className="flex items-center justify-between">
          <span className="font-semibold">
            Total : <span className="font-inter">₹</span>
            {courseCart.reduce(
              (accumulator, current) =>
                accumulator + parseInt(`${current.course_price}`),
              0
            )}
          </span>

          <FaAngleDown
            onClick={() => setIsExpand(!isExpand)}
            size={20}
            className="cursor-pointer"
          />
        </div>
        <ul className="space-y-6 overflow-y-auto max-h-96 notice-board-scroll">
          {courseCart.map((item) => (
            <li key={item.batch_id} className="relative">
              <div className="absolute top-0 bottom-0 w-3 bg-[#E9B858] mt-[1px] rounded-2xl"></div>
              <div className="pl-5 space-y-1">
                <h3 className="font-semibold">{item.course_name}</h3>
                <div className="flex items-center flex-wrap gap-x-5 gap-y-2 *:text-gray-600 *:font-semibold">
                  <div className="flex items-center gap-2">
                    <MdOutlineDateRange />

                    <span className="text-sm">
                      Start : {formateDate(item.batch_start_date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MdUpdate />
                    <span className="text-sm">
                      End : {formateDate(item.batch_end_date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <IoPricetagOutline />
                    <span className="text-sm">
                      <span className="font-inter">₹</span>
                      {parseInt(`${item.course_price}`)}
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
        <div className="flex items-center flex-wrap gap-3">
          {/* <Link
            className="block"
            href={`/apply-course`}
          > */}
          <Button
            onClick={handleEnrollBtnClick}
            // onClick={() => dispatch(setCourseCart([]))}
            className="w-full !bg-[#E9B858] border active:scale-90 !border-gray-500 !text-foreground"
          >
            Enroll Now
            <FaLongArrowAltDown className="-rotate-90" />
          </Button>
          {/* </Link> */}
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
