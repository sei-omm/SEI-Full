import Image from "next/image";
import Link from "next/link";
import React from "react";

interface IProps {
  children: React.ReactNode;
}

export default function layout({ children }: IProps) {
  return (
    <>
      <div className="w-full h-[60vh] relative overflow-hidden">
        <Image
          className="size-full object-cover"
          src={"/images/Banners/CoursesBanner.jpg"}
          alt="Courses Banner"
          height={1200}
          width={1200}
        />

        <div className="absolute inset-0 size-full bg-[#000000bb]">
          <div className="main-layout size-full flex-center flex-col">
            <h1 className="tracking-wider text-gray-100 text-4xl font-semibold uppercase">
              Our Courses
            </h1>
            <span className="text-background">
              <Link href={"/"}>Home</Link>
              <span> / </span>
              <Link href={"/our-courses"}>Courses</Link>
            </span>
          </div>
        </div>
      </div>

      <div className="w-full main-layout py-10">
        <div className="flex flex-col gap-y-2">
          <h2 className="text-5xl font-semibold">
            Our <span className="text-[#e9b858]">Courses</span>
          </h2>
          <h3 className="max-w-[40rem] sm:max-w-full">
            See our valuable courses which will help you to grow
          </h3>
        </div>

        {children}
      </div>
    </>
  );
}
