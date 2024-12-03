import Image from "next/image";
import Link from "next/link";
import React from "react";
import NextSvg from "../svgicons/NextSvg";
import TwoColumn from "../components/TwoColumn";

export default function page() {
  return (
    <div className="w-full">
      <div className="w-full h-[60vh] relative overflow-hidden">
        <Image
          className="size-full object-cover"
          src={"/images/Banners/OurCentersBanner.jpg"}
          alt="Courses Banner"
          height={1200}
          width={1200}
        />

        <div className="absolute inset-0 size-full bg-[#000000bb]">
          <div className="main-layout size-full flex-center flex-col">
            <h1 className="tracking-wider text-gray-100 text-4xl font-semibold uppercase">
              About Our Centers
            </h1>
            <span className="text-background">
              <Link href={"/"}>Home</Link>
              <span> / </span>
              <Link href={"/our-centers"}>Centers</Link>
            </span>
          </div>
        </div>
      </div>

      <div className="main-layout pt-10">
        <TwoColumn
          columnOne={
            <Link
              href={"/our-centers/kolkata"}
              className="size-full flex-center"
            >
              <div className="h-72 w-full relative overflow-hidden rounded-2xl">
                <Image
                  className="size-full object-cover"
                  src={"/images/Centers/SEI_KOLKATA_CENTER.jpg"}
                  alt="Sei Kolkata Center"
                  height={1200}
                  width={1200}
                />
                <div className="size-full fade-to-top-yellow absolute inset-0 flex items-end p-5">
                  <div>
                    <h2 className="text-2xl text-background">Kolkata Center</h2>
                    <p className="text-gray-300 leading-5 text-sm">
                      SEIET Kolkata, is located in the heart of Kolkata city
                      bringing all means of transport to its doorstep.
                    </p>
                    <Link
                      className="flex items-center gap-x-3 text-sm text-background mt-1"
                      href={"/"}
                    >
                      <span>Explore More</span>
                      <NextSvg />
                    </Link>
                  </div>
                </div>
              </div>
            </Link>
          }
          columnTwo={
            <Link
              href={"/our-centers/faridabad"}
              className="size-full flex-center"
            >
              <div className="h-72 w-full relative overflow-hidden rounded-2xl">
                <Image
                  className="size-full object-cover"
                  src={"/images/Centers/SEI_FARIDABAD_CENTER.jpg"}
                  alt="Sei Kolkata Center"
                  height={1200}
                  width={1200}
                />
                <div className="size-full fade-to-top-yellow absolute inset-0 flex items-end p-5">
                  <div>
                    <h2 className="text-2xl text-background">
                      Faridabad Center
                    </h2>
                    <p className="text-gray-300 leading-5 text-sm">
                      SEIET Faridabad (located within the National Capital
                      region of Delhi) in North India.
                    </p>
                    <span className="flex items-center gap-x-3 text-sm text-background mt-1">
                      <span>Explore More</span>
                      <NextSvg />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          }
        />
      </div>
    </div>
  );
}
