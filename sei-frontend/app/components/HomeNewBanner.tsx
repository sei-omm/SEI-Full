import React from "react";
import NextSvg from "../svgicons/NextSvg";
import Button from "./Button";
import NoticeBoard from "./NoticeBoard";
import Link from "next/link";

export default function HomeNewBanner() {
  return (
    <div className="w-full h-[90vh] overflow-hidden relative sm:max-h-auto">
      <video
        autoPlay
        loop
        muted
        className="relative size-full object-cover z-0"
      >
        <source src="/IMarEST-homepage-video-v4.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute inset-0 bg-[#000000b6]">
        <div className="size-full flex items-center main-layout pt-10">
          <div className="flex flex-col justify-center gap-y-3 border-l-8 pl-8 border-white rounded-2xl">
            <h2 className="text-5xl font-[600] text-gray-100 space-y-2 leading-[3.3rem] sm:text-4xl">
              Mentoring the Mariners <br /> Shaping the future
            </h2>
            <h3 className="text-gray-300 max-w-[40rem] sm:max-w-full">
              Once a SEIET SAILOR, always a leader at sea! ⚓🌊 Join the legacy
              of excellence with SEI Educational Trust and set your course for a
              successful maritime career
            </h3>

            <div className="pt-3 flex items-center flex-wrap gap-y-5 gap-x-5">
              <Link href={"/our-courses/kolkata"}>
                <Button className="!bg-[#E9B858] !rounded-none border-[#E9B858] !text-black !border-none">
                  <span className="font-semibold text-sm uppercase">
                    Book Courses
                  </span>

                  <NextSvg />
                </Button>
              </Link>

              <Link href={"/contact-us"}>
                <Button
                  className={`min-w-max px-8 !rounded-none !border-[#E9B858]`}
                >
                  <span className="font-semibold text-sm uppercase">
                    Contact
                  </span>

                  <NextSvg />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-16 right-0 z-10 sm:hidden">
        <NoticeBoard />
      </div>
    </div>
  );
}
