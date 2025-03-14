"use client";

import axios from "axios";
import { BASE_API } from "../constant";
import { IResponse, TNoticeBoard } from "../type";
import { CiCalendarDate } from "react-icons/ci";
import { formateDate } from "../utils/formateDate";
import { useQuery } from "react-query";
import { useState } from "react";
import Loading from "../loading";
import { GrFormPrevious } from "react-icons/gr";

const getNotices = async (page: number) => {
  return (await axios.get(`${BASE_API}/website/notice?page=${page}`)).data;
};

export default function Notice() {
  const [page, setpage] = useState(1);

  const {
    error,
    isFetching,
    data: notices,
  } = useQuery<IResponse<TNoticeBoard[]>>({
    queryKey: ["get-single-notice", page],
    queryFn: () => getNotices(page),
    refetchOnMount: true,
  });

  if (isFetching) return <Loading />;

  if (error) return <div>error while fetching</div>;

  return (
    <section className="py-10">
      <div className="w-full shadow-xl border min-h-64 px-8 pt-8 pb-4">
        <h2 className="text-5xl font-semibold border-b border-[#e9b858] pb-2">
          Latest <span className="text-[#e9b858]">Notice</span>
        </h2>

        <ul className="space-y-3 mt-3 size-full">
          {notices?.data.map((notice, index) => (
            <li key={index} className="flex items-start gap-5">
              {/* Notice Heading */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                shape-rendering="geometricPrecision"
                text-rendering="geometricPrecision"
                image-rendering="optimizeQuality"
                fill-rule="evenodd"
                clip-rule="evenodd"
                viewBox="0 0 510 511.76"
                className="w-5 pt-2"
              >
                <path d="M255 0c15.34 0 29.24 6.23 39.3 16.28 10.05 10.05 16.28 23.95 16.28 39.3 0 5.28-.74 10.39-2.12 15.24 1.04.44 2.05 1.02 2.99 1.75l118.18 91.78c.73.57 1.38 1.2 1.96 1.87h39.82c21.17 0 38.59 17.42 38.59 38.6v268.36c0 10.62-4.34 20.27-11.33 27.26-6.98 6.98-16.64 11.32-27.26 11.32H38.53c-10.57 0-20.18-4.33-27.16-11.29C4.39 493.53.08 483.91.05 473.27L0 204.82c0-21.25 17.34-38.6 38.59-38.6h39.82c.58-.67 1.23-1.3 1.96-1.87l118.17-91.78a13.2 13.2 0 0 1 3-1.75 55.595 55.595 0 0 1-2.11-15.24c0-15.35 6.22-29.25 16.28-39.3C225.76 6.22 239.65 0 255 0zM93.38 367.48c-5.4 0-9.78-4.38-9.78-9.77 0-5.4 4.38-9.77 9.78-9.77h323.24c5.4 0 9.78 4.37 9.78 9.77 0 5.39-4.38 9.77-9.78 9.77H93.38zm34.61-63.43-15.65-22.71c-.54-.75-.88-2.38-1.02-4.91h-.41v27.62H90.45v-63.93h19.24l15.64 22.71c.55.75.89 2.39 1.02 4.91h.41v-27.62h20.46v63.93h-19.23zm30.23-31.91c0-11.66 2.18-20.17 6.54-25.52 4.37-5.35 12.24-8.03 23.63-8.03 11.38 0 19.26 2.68 23.62 8.03 4.36 5.35 6.55 13.86 6.55 25.52 0 5.79-.46 10.67-1.38 14.63-.92 3.95-2.51 7.39-4.76 10.32-2.25 2.94-5.35 5.09-9.3 6.45-3.96 1.36-8.87 2.05-14.73 2.05-5.87 0-10.78-.69-14.73-2.05-3.96-1.36-7.06-3.51-9.31-6.45-2.25-2.93-3.84-6.37-4.75-10.32-.93-3.96-1.38-8.84-1.38-14.63zm21.98-10.64v26.59h8.49c2.8 0 4.83-.32 6.09-.97 1.26-.64 1.89-2.13 1.89-4.44v-26.6h-8.59c-2.73 0-4.72.32-5.99.98-1.25.64-1.89 2.13-1.89 4.44zm94.87-5.01h-14.83v47.56h-20.46v-47.56h-14.83v-16.37h50.12v16.37zm9.46 47.56v-63.93h20.46v63.93h-20.46zm76.97-18.3 1.53 17.18c-4.29 1.77-9.68 2.66-16.16 2.66-6.47 0-11.67-.69-15.59-2.05-3.93-1.36-7.01-3.51-9.26-6.45-2.25-2.93-3.82-6.37-4.71-10.32-.88-3.96-1.32-8.84-1.32-14.63 0-5.79.44-10.69 1.32-14.68.89-3.99 2.46-7.45 4.71-10.38 4.36-5.66 12.38-8.49 24.04-8.49 2.59 0 5.64.26 9.15.77 3.51.51 6.12 1.14 7.82 1.89l-3.07 15.65c-4.43-.96-8.48-1.43-12.17-1.43-3.68 0-6.23.34-7.66 1.02-1.44.68-2.16 2.05-2.16 4.09v26.8c2.66.55 5.36.82 8.09.82 5.79 0 10.94-.82 15.44-2.45zm53.44-5.84h-20.45v7.77h25.06v16.37h-45.52v-63.93h45l-2.55 16.37h-21.99v8.59h20.45v14.83zM141.87 432.5c-5.39 0-9.77-4.38-9.77-9.77 0-5.4 4.38-9.78 9.77-9.78h226.25c5.4 0 9.78 4.38 9.78 9.78 0 5.39-4.38 9.77-9.78 9.77H141.87zm247-266.28-93.41-72.54-1.16 1.19c-10.06 10.06-23.96 16.28-39.3 16.28-15.35 0-29.24-6.22-39.29-16.28l-1.17-1.2-93.42 72.55h267.75zm82.54 24.43H38.59c-7.79 0-14.16 6.39-14.16 14.17v268.45c-.05 3.82 1.57 7.35 4.16 9.94 2.52 2.55 6.05 4.13 9.94 4.13h432.88c3.88 0 7.44-1.6 10-4.16 2.57-2.57 4.16-6.12 4.16-10V204.82c0-7.85-6.32-14.17-14.16-14.17zM255 32.07c6.49 0 12.37 2.63 16.62 6.88a23.427 23.427 0 0 1 6.89 16.63c0 6.49-2.63 12.36-6.89 16.62A23.436 23.436 0 0 1 255 79.08c-6.49 0-12.37-2.63-16.62-6.88-4.25-4.26-6.88-10.13-6.88-16.62s2.63-12.38 6.88-16.63A23.436 23.436 0 0 1 255 32.07z" />
              </svg>
              <div>
                <h2 className="font-[600] text-sm">{notice.heading}</h2>
                <p className="flex items-center gap-x-1 text-xs">
                  <CiCalendarDate />
                  {formateDate(notice.created_at)}
                </p>
                <div
                  dangerouslySetInnerHTML={{ __html: notice.description }}
                ></div>
              </div>
            </li>
          ))}
        </ul>

        <div className="space-x-6 pt-5">
          <button
            onClick={() => setpage((prev) => prev - 1)}
            disabled={notices && notices.data.length <= 10 && page === 1}
            className={`${
              notices && notices.data.length <= 10 && page === 1
                ? "opacity-35"
                : "opacity-100"
            }`}
          >
            <GrFormPrevious size={20} />
          </button>
          <button
            onClick={() => setpage((prev) => prev + 1)}
            disabled={notices && notices.data.length < 10}
            className={`${
              notices && notices.data.length < 10 ? "opacity-35" : "opacity-100"
            }`}
          >
            <GrFormPrevious size={20} className="-rotate-180" />
          </button>
        </div>
      </div>
    </section>
  );
}
