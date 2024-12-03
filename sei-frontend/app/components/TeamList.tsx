"use client";

import React, { useState } from "react";
import Carousel from "./Carousel";
import Image from "next/image";
import { GrLinkNext } from "react-icons/gr";

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export default function TeamList() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => {
    setCurrentIndex((preState) => {
      if (preState / 5 === data.length - 1) return preState;
      return preState + 1;
    });
  };

  const goBack = () => {
    setCurrentIndex((preState) => {
      if (preState / 5 === 0) return preState;
      return preState - 1;
    });
  };

  return (
    <div className="w-full relative">
      <Carousel
        currentIndex={currentIndex}
        data={data}
        slideStart={0}
        sliderEnd={15}
        sliderPreview={5}
        className="w-full hover:cursor-grab"
        renderItem={(item) => (
          <div key={item} className="flex-center flex-col relative h-60 w-48 overflow-hidden rounded-xl shadow-xl sm:w-full sm:h-96">
            <Image
              className="size-full object-cover"
              src={"/images/studient-icon.jpg"}
              alt="Team Logo"
              height={512}
              width={512}
            />

            <div className="size-full absolute inset-0 fade-to-top flex flex-col justify-end p-3">
              <h2 className="text-background text-sm font-[500]">
                Mrs. Aadrika Sengupta
              </h2>
              <h3 className="text-gray-300 text-sm">Principal</h3>
            </div>
          </div>
        )}
      />

      <div className="w-full flex-center gap-x-4 pt-4">
        <button
          onClick={goBack}
          className="border bg-[#e9b858] flex-center size-10 rounded-full"
        >
          <GrLinkNext className="-rotate-180" />
        </button>
        <button
          className="border bg-[#e9b858] flex-center size-10 rounded-full"
          onClick={goNext}
        >
          <GrLinkNext />
        </button>
      </div>
    </div>
  );
}
