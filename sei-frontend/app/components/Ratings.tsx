"use client";

import React from "react";
import Carousel from "./Carousel";
import { IoIosStar } from "react-icons/io";
import Image from "next/image";

export default function Ratings() {
  const datas = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <Carousel
      className="!py-10 cursor-grab"
      currentIndex={0}
      spaceBetween={20}
      data={datas}
      slideStart={0}
      sliderEnd={datas.length}
      sliderPreview={3}
      itemClassName="shadow-xl rounded-2xl border-gray-100 border"
      renderItem={(item) => (
        <li key={item} className="px-8 py-7 space-y-3">
          <div className="flex items-start gap-x-2">
            <Image
              className="size-10 rounded-full"
              src={"/images/studient-icon.jpg"}
              alt="Student Icon"
              height={512}
              width={512}
            />
            <div>
              <h2 className="font-semibold leading-none">
                Senator Victoria Davis
              </h2>
              <span className="text-sm leading-none">Student</span>
            </div>
          </div>

          <p className="text-sm tracking-wide">
            &quot;Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Officiis laborum autem sed voluptates dolore libero, possimus vel
            quia nesciunt accusamus aliquid.&quot;
          </p>

          <div className="flex items-center gap-x-2 text-xs">
            <span>5.0</span>
            <div className="flex items-center gap-x-1 text-[#e9b858]">
              <IoIosStar />
              <IoIosStar />
              <IoIosStar />
              <IoIosStar />
              <IoIosStar />
            </div>
          </div>
        </li>
      )}
    />
  );
}
