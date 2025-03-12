"use client";

import React, { useEffect, useState } from "react";
// import { useQuery } from "react-query";
// import axios from "axios";
// import { BASE_API } from "../constant";
// import { IResponse, TNoticeBoard } from "../type";
import { IoMdNotifications } from "react-icons/io";

// const notices = [
//   {
//     heading: "1 SPECIAL PACKAGE FOR JULY & AUGUST-2024",
//     date: "14 July, 2024",
//     description:
//       "SPECIAL PACKAGE FOR JULY & AUGUST-2024 HURRY UP ASM+SMS ONLY RS. 24,999/-",
//   },
//   {
//     heading: "2 SPECIAL PACKAGE FOR JULY & AUGUST-2024",
//     date: "14 July, 2024",
//     description:
//       "SPECIAL PACKAGE FOR JULY & AUGUST-2024 HURRY UP ASM+SMS ONLY RS. 24,999/-",
//   },
//   {
//     heading: "3 SPECIAL PACKAGE FOR JULY & AUGUST-2024",
//     date: "14 July, 2024",
//     description:
//       "SPECIAL PACKAGE FOR JULY & AUGUST-2024 HURRY UP ASM+SMS ONLY RS. 24,999/-",
//   },
// ];

// const getNotices = async () => {
//   return (await axios.get(`${BASE_API}/website/notice`)).data;
// };

export default function NoticeBoard() {
  const [current, setCurrent] = useState(0);

  function goUp() {
    setCurrent((preState) => {
      // if (preState === notices.length - 1) return 0;
      return preState + 1;
    });
  }

  //   function goBack() {
  //     setCurrent((preState) => {
  //       if (preState === 0) return notices.length - 1;
  //       return preState - 1;
  //     });
  //   }

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      goUp();
    }, 3000);

    return () => clearTimeout(timeOutId);
  }, [current]);

  // const { error, isFetching, data } = useQuery<IResponse<TNoticeBoard[]>>({
  //   queryKey: ["get-single-notice"],
  //   queryFn: () => getNotices(),
  //   refetchOnMount: true,
  // });

  return (
    // <div className="relative flex items-center">
    //   <Image
    //     className="w-[30rem] rotate-180 brightness-0 invert"
    //     src={"/images/paper-cut-2.png"}
    //     alt=""
    //     height={1200}
    //     width={1200}
    //   />

    //   <div className="absolute bottom-[5.4rem] h-32 flex-center flex-col px-14">
    //     <div className="w-full overflow-hidden flex flex-col gap-y-6 h-[5rem]">
    //       {data?.data.map((item, index) => (
    //         <p
    //           key={index}
    //           className={`flex-shrink-0 ${
    //             current === index ? "opacity-100" : "opacity-0"
    //           } transition-all duration-500`}
    //         >
    //           {/* Notice Heading */}
    //           <span className="font-[600] text-sm">{item.heading}</span>
    //           <span className="flex items-center gap-x-1 text-xs">
    //             <CiCalendarDate />
    //             {item.created_at}
    //           </span>
    //           <span
    //             dangerouslySetInnerHTML={{ __html: item.description }}
    //             className="line-clamp-2 text-xs pb-1"
    //           ></span>
    //         </p>
    //       ))}
    //     </div>
    //   </div>

    //   <OpenDialogButton
    //     type="OPEN"
    //     dialogKey="notice-dialog"
    //     className="absolute top-0 bottom-14 right-0 flex-center px-14"
    //   >
    //     <svg
    //       xmlns="http://www.w3.org/2000/svg"
    //       fill="none"
    //       viewBox="0 0 24 24"
    //       stroke-width="1.5"
    //       stroke="currentColor"
    //       className="size-4 -rotate-90 cursor-pointer text-gray-600"
    //     >
    //       <path
    //         stroke-linecap="round"
    //         stroke-linejoin="round"
    //         d="m4.5 4.5 15 15m0 0V8.25m0 11.25H8.25"
    //       />
    //     </svg>
    //   </OpenDialogButton>
    // </div>

    <IoMdNotifications />
  );
}
