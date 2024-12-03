"use client";

import Image from "next/image";
import React, { useState } from "react";
import Button from "./Button";
import NextSvg from "../svgicons/NextSvg";
import NoticeBoard from "./NoticeBoard";
import Link from "next/link";

const banner_info = [
  {
    backgroun_image: "/images/Banners/Banner1.jpg",
    heading: "Mentoring the Mariners <br /> Shaping the future",
    subheading:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit quaerat non, ad inventore ipsum quia laborum natus laudantium dolores tempore.",
  },
  {
    backgroun_image: "/images/Banners/Banner2.jpg",
    heading: "Mastering the Art <br /> of Marine Engineering",
    subheading:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit quaerat non, ad inventore ipsum quia laborum natus laudantium dolores tempore.",
  },
  {
    backgroun_image: "/images/Banners/Banner3.jpg",
    heading: "Redefining Marine <br /> Technology for a New Era",
    subheading:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit quaerat non, ad inventore ipsum quia laborum natus laudantium dolores tempore.",
  },
  {
    backgroun_image: "/images/Banners/Banner4.jpg",
    heading: "Innovating Marine Engineering <br /> with a Vision",
    subheading:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit quaerat non, ad inventore ipsum quia laborum natus laudantium dolores tempore.",
  },
];

{
  /* bg-[#00000057] */
}

export default function HomeBanner() {
  const [current, setCurrent] = useState(0);

  function goNext() {
    setCurrent((preState) => {
      if (preState === banner_info.length - 1) return 0;
      return preState + 1;
    });
  }

  function goBack() {
    setCurrent((preState) => {
      if (preState === 0) return banner_info.length - 1;
      return preState - 1;
    });
  }

  return (
    <section className="w-full h-[90vh] overflow-hidden relative sm:max-h-auto">
      {banner_info.map((banner, index) => (
        <div
          key={index}
          className={`size-full absolute ${
            current === index ? "z-[1]" : "z-0"
          } transition-all duration-1000`}
        >
          <Image
            className={`size-full object-cover z-0 ${
              current === index ? "opacity-100" : "opacity-0"
            } transition-all duration-1000`}
            src={banner.backgroun_image}
            alt="SEI Banner"
            height={1200}
            width={1200}
          />
          <div className="size-full absolute bg-[#1a1a1a5d] top-0">
            <div
              className={`size-full fade-to-top ${
                current === index ? "opacity-100" : "opacity-0"
              } transition-all duration-1000`}
            >
              <div className="relative h-full main-layout flex flex-col justify-center space-y-3 pt-5">
                <h2
                  dangerouslySetInnerHTML={{ __html: banner.heading }}
                  className={`text-5xl font-[600] text-gray-100 space-y-2 leading-[3.3rem] ${
                    current === index
                      ? "translate-x-0 opacity-100 blur-none"
                      : "translate-x-24 opacity-0 blur-md"
                  } transition-all duration-1000 sm:text-4xl`}
                >
                  {/* Engineering the Oceans, <br /> Shaping the Future */}
                </h2>
                <h3
                  className={`text-gray-300 tracking-widest max-w-[40rem] ${
                    current === index
                      ? "translate-x-0 opacity-100 blur-none"
                      : "-translate-x-24 opacity-0 blur-md"
                  } transition-all duration-1000 delay-100 sm:max-w-full`}
                >
                  {/* Building Sustainable Marine Solutions for Tomorrow’s Challenges */}
                  {/* Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit
                  quaerat non, ad inventore ipsum quia laborum natus laudantium
                  dolores tempore. */}
                  {banner.subheading}
                </h3>

                {/* Banner Action Buttons */}
                <div className="pt-3 flex items-center flex-wrap gap-y-5 gap-x-5">
                  <Link
                    className={`inline-block ${
                      index === current
                        ? "translate-x-0 opacity-100 blur-none"
                        : "-translate-x-24 opacity-0 blur-md"
                    } transition-all duration-[1000ms]`}
                    href={"/our-courses/kolkata"}
                  >
                    <Button varient="light">
                      <span className="font-semibold text-sm uppercase">
                        Book Courses
                      </span>

                      <NextSvg />
                    </Button>
                  </Link>

                  <Link
                    className={`${
                      index === current
                        ? "translate-x-0 opacity-100 blur-none"
                        : "translate-x-24 opacity-0 blur-md"
                    } transition-all duration-[1000ms]`}
                    href={"/contact-us"}
                  >
                    <Button varient="default" className={`min-w-max px-8`}>
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
        </div>
      ))}

      {/* Dots For Big Screen */}
      <div className="absolute bottom-6 w-full z-[2]">
        <div className="main-layout flex items-center gap-x-4">
          <button onClick={goBack}>
            <NextSvg className="!text-gray-400 !rotate-90 cursor-pointer" />
          </button>
          {banner_info.map((item, index) => (
            <div
              key={index}
              onClick={() => setCurrent(index)}
              className={`${
                index === current ? "bg-gray-400" : "bg-transparent"
              } cursor-pointer size-2 border border-gray-400 rounded-full`}
            ></div>
          ))}
          <button onClick={goNext}>
            <NextSvg className="!text-gray-400 cursor-pointer" />
          </button>
        </div>
      </div>

      {/* Notice Board */}
      <div className="absolute -bottom-16 right-0 z-10 sm:hidden">
        <NoticeBoard />
      </div>

      {/* <div className="absolute bottom-2 right-2 z-10 w-96 h-36 flex flex-col">
        <ul className="size-full relative space-y-5 animation-up flex-shrink-0 flex-grow-0">
          {notices.map((item, index) => (
            <li className={`space-y-1`}>
              <h5 className="font-semibold text-white">{item.heading}</h5>
              <div className="flex items-center gap-x-1 text-white text-xs">
                <CiCalendarDate />
                {item.date}
              </div>
              <p className="text-gray-200 text-[10px]">{item.description}</p>
            </li>
          ))}
        </ul>
        <ul aria-hidden = {true} className="size-full relative space-y-5 animation-up flex-grow-0 flex-shrink-0">
          {notices.map((item, index) => (
            <li className={`space-y-1`}>
              <h5 className="font-semibold text-white">{item.heading}</h5>
              <div className="flex items-center gap-x-1 text-white text-xs">
                <CiCalendarDate />
                {item.date}
              </div>
              <p className="text-gray-200 text-[10px]">{item.description}</p>
            </li>
          ))}
        </ul>
      </div> */}
    </section>
  );
}
