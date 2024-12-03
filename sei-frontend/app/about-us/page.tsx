import Image from "next/image";
import Link from "next/link";
import React from "react";
import Button from "../components/Button";
import NextSvg from "../svgicons/NextSvg";

import { LuArrowDownRightFromCircle } from "react-icons/lu";
import OurMission from "../svgicons/OurMission";
import OurVision from "../svgicons/OurVision";
import OurGoal from "../svgicons/OurGoal";
import TeamList from "../components/TeamList";
import TabMenu from "../components/TabMenu";
import TwoColumn from "../components/TwoColumn";

const why_choose_us = [
  {
    icon: <OurMission color="#e9b858" />,
    heading: "Our Mission",
    subheading:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae natus repellendus iure debitis,",
  },
  {
    icon: <OurVision color="#e9b858" />,
    heading: "Our Vision",
    subheading:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae natus repellendus iure debitis,",
  },
  {
    icon: <OurGoal color="#e9b858" />,
    heading: "Our Goal",
    subheading:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae natus repellendus iure debitis,",
  },
];

export default function page() {
  return (
    <section>
      <div className="w-full h-[60vh] relative overflow-hidden">
        <Image
          className="size-full object-cover"
          src={"/images/Banners/AboutUsBanner.jpg"}
          alt="About Us Banner"
          height={1200}
          width={1200}
        />

        <div className="absolute inset-0 size-full bg-[#000000a6]">
          <div className="main-layout size-full flex-center flex-col">
            <h1 className="tracking-wider text-gray-100 text-4xl font-semibold uppercase">
              About us
            </h1>
            {/* <p className="max-w-[35rem] text-center text-gray-300 tracking-wider ">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Est id
              unde iure sed sit voluptatibus temporibus necessitatibus cumque
              dolores.
            </p> */}
            <span className="text-background">
              <Link href={"/"}>Home</Link>
              <span> / </span>
              <Link href={"/about-us"}>About us</Link>
            </span>
          </div>
        </div>
      </div>
      <div className="main-layout">
        {/* About Something */}
        <div className="w-full py-10">
          <TwoColumn
            columnOne={
              <div className="grid grid-cols-2 gap-5 *:rounded-xl">
                <div className="relative object-cover rounded-xl overflow-hidden">
                  <Image
                    src={"/images/About/bords_images.jpg"}
                    alt="Board Images"
                    width={1200}
                    height={1200}
                  />

                  <div className="absolute inset-0 fade-to-top-yellow-color"></div>
                </div>
                <div className="relative object-cover rounded-xl overflow-hidden">
                  <Image
                    className="size-full"
                    src={"/images/About/bords_images.jpg"}
                    alt="Board Images"
                    width={1200}
                    height={1200}
                  />

                  <div className="absolute inset-0 fade-to-top-yellow-color"></div>
                </div>

                <div className="relative col-span-2 h-48 rounded-xl overflow-hidden">
                  <Image
                    className="size-full object-cover"
                    src={"/images/About/bords_images.jpg"}
                    alt="Board Images"
                    width={1200}
                    height={1200}
                  />

                  <div className="absolute inset-0 fade-to-top-yellow-color"></div>
                </div>
              </div>
            }
            columnTwo={
              <div className="flex flex-col size-full justify-between sm:h-[35rem]">
                <div className="space-y-1">
                  <h2 className="text-5xl font-[600]">
                    Our Educational -{" "}
                    <span className="text-[#e9b858]">competence</span>
                  </h2>
                  <p>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                    Nisi quaerat inventore tempora ad assumenda nihil? Quo ut id
                    harum magnam praesentium ducimus hic quibusdam odio, nam
                    totam doloremque velit aliquam?
                  </p>
                </div>

                <ul className="flex items-center flex-wrap gap-4">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <li key={item} className="flex items-center gap-x-2">
                      <LuArrowDownRightFromCircle className="-rotate-45" />
                      <span>Expart Teachers</span>
                    </li>
                  ))}
                </ul>

                <Button className="!bg-[#ffffff] !border-gray-500 !text-black hover:!bg-[#e9b858] hover:!border-white">
                  <span>Enroll Now</span>
                  <NextSvg />
                </Button>
                <Button className="!bg-[#e9b858] !text-black hover:bg-[#e9b95871]">
                  <span>Contact Us Now</span>
                  <NextSvg />
                </Button>
              </div>
            }
          />
        </div>
        {/* <section className="w-full grid grid-cols-2 gap-x-10 py-14">
          <div className="grid grid-cols-2 gap-5 *:rounded-xl">
            <div className="relative object-cover rounded-xl overflow-hidden">
              <Image
                src={"/images/About/bords_images.jpg"}
                alt="Board Images"
                width={1200}
                height={1200}
              />

              <div className="absolute inset-0 fade-to-top-yellow-color"></div>
            </div>
            <div className="relative object-cover rounded-xl overflow-hidden">
              <Image
                className="size-full"
                src={"/images/About/bords_images.jpg"}
                alt="Board Images"
                width={1200}
                height={1200}
              />

              <div className="absolute inset-0 fade-to-top-yellow-color"></div>
            </div>

            <div className="relative col-span-2 h-48 rounded-xl overflow-hidden">
              <Image
                className="size-full object-cover"
                src={"/images/About/bords_images.jpg"}
                alt="Board Images"
                width={1200}
                height={1200}
              />

              <div className="absolute inset-0 fade-to-top-yellow-color"></div>
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div className="space-y-1">
              <h2 className="text-5xl font-[600]">
                Our industry - explicit{" "}
                <span className="text-[#e9b858]">competence</span>
              </h2>
              <p>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nisi
                quaerat inventore tempora ad assumenda nihil? Quo ut id harum
                magnam praesentium ducimus hic quibusdam odio, nam totam
                doloremque velit aliquam?
              </p>
            </div>

            <ul className="flex items-center flex-wrap gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <li className="flex items-center gap-x-2">
                  <LuArrowDownRightFromCircle className="-rotate-45" />
                  <span>Expart Teachers</span>
                </li>
              ))}
            </ul>

            <Button className="!bg-[#ffffff] !border-gray-500 !text-black hover:!bg-[#e9b858] hover:!border-white">
              <span>Enroll Now</span>
              <NextSvg />
            </Button>
            <Button className="!bg-[#e9b858] !text-black hover:bg-[#e9b95871]">
              <span>Contact Us Now</span>
              <NextSvg />
            </Button>
          </div>
        </section> */}

        {/* Our Mission, vision, goal */}
        <section className="w-full">
          <ul className="w-full flex items-center gap-10 flex-wrap justify-center">
            {why_choose_us.map((item) => (
              <li
                key={item.heading}
                className="basis-52 flex-grow shadow-2xl border border-gray-100 p-4 rounded-2xl"
              >
                <div className="size-12 bg-[#e9b95836] flex-center p-2 rounded-xl">
                  {item.icon}
                </div>
                <h2 className="font-semibold text-2xl mt-2">{item.heading}</h2>
                <h3>{item.subheading}</h3>
              </li>
            ))}
          </ul>
        </section>

        {/* Our Teachers */}

        <section className="pt-20">
          <div className="space-y-2 flex flex-col items-center">
            <h2 className="text-5xl font-semibold">
              Our Expert <span className="text-[#e9b858]">Team</span>
            </h2>
            <h3 className="max-w-[40rem]">
              Our expert team will help you to achieve you dream in your hand
            </h3>
          </div>

          {/* Category Section */}
          {/* <ul className="flex items-center gap-x-3 mt-5">
            <li>
              <Link
                className="border-2 px-5 py-1 bg-[#e9b858] border-white rounded-lg"
                href={"?team=kolkata"}
              >
                Kolkata
              </Link>
            </li>
            <li>
              <Link
                className="border-2 px-5 py-1  rounded-lg"
                href={"?team=faridabad"}
              >
                Faridabad
              </Link>
            </li>
          </ul> */}
          <div className="mt-5">
            <TabMenu
              tabs={[
                {
                  isSelected: true,
                  text: "Kolkata",
                  slug: "?team=kolkata",
                },
                {
                  isSelected: false,
                  text: "Faridabad",
                  slug: "?team=faridabad",
                },
              ]}
            />
          </div>

          {/* Team List */}
          <div className="mt-9">
            <TeamList />
          </div>
        </section>

        {/* certificate promo banner */}
        <section className="pt-20 overflow-hidden">
          <div className="bg-[#e9b95859] w-full h-72 rounded-2xl p-14 sm:h-auto sm:p-9">
            <TwoColumn
              columnOne={
                <div>
                  <h2 className="text-4xl font-semibold">
                    Certificate endorsing the
                  </h2>
                  <h3 className="text-3xl">authenticity of our mission</h3>

                  <p className="text-gray-500 mt-1">
                    Certificate by Lloyd&apos;s Register Marine and Offshore
                    India LLP that proves the authenticity of our mission.
                  </p>

                  <Button
                    varient="light"
                    className="!py-2 !min-w-max !px-5 mt-4 hover:!text-black"
                  >
                    <span>Enroll Without Hesitation</span>
                    <NextSvg />
                  </Button>
                </div>
              }
              columnTwo={
                <div className="flex items-end flex-col pr-0">
                  <div className="relative overflow-hidden rounded-3xl -translate-y-6 group/certificate sm:-translate-y-0">
                    <Image
                      className="w-[20rem] object-contain border shadow-2xl"
                      src={"/images/About/CIP Certificate.jpg"}
                      alt=""
                      height={1200}
                      width={1200}
                    />

                    <div className="size-full hover:bg-[#e9b95821] absolute inset-0 flex items-center justify-center">
                      <Link
                        href={"/images/About/CIP Certificate.jpg"}
                        target="_blank"
                      >
                        <Button className="!bg-[#e9b858] !text-black !py-2 !min-w-max !px-4 translate-y-[150%] group-hover/certificate:translate-y-0 transition-all duration-200 text-sm">
                          View Large
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              }
            />
          </div>
          {/* <section className="bg-[#e9b95859] w-full h-72 rounded-2xl p-14 grid grid-cols-2">
            <div>
              <h2 className="text-4xl font-semibold">
                Certificate that proves the
              </h2>
              <h3 className="text-3xl">authenticity of our mission</h3>

              <p className="text-gray-500 mt-1">
                Certificate by Lloyd's Register Marine and Offshore India LLP
                that proves the authenticity of our mission.
              </p>

              <Button
                varient="light"
                className="!py-2 !min-w-max !px-5 mt-4 hover:!text-black"
              >
                <span>Enroll Without Hesitation</span>
                <NextSvg />
              </Button>
            </div>

            <div className="flex items-end flex-col pr-0">
              <div className="relative overflow-hidden rounded-3xl -translate-y-6 group/certificate">
                <Image
                  className="w-[20rem] object-contain border shadow-2xl"
                  src={"/images/About/CIP Certificate.jpg"}
                  alt=""
                  height={1200}
                  width={1200}
                />

                <div className="size-full hover:bg-[#e9b95821] absolute inset-0 flex items-center justify-center">
                  <Link
                    href={"/images/About/CIP Certificate.jpg"}
                    target="_blank"
                  >
                    <Button className="!bg-[#e9b858] !text-black !py-2 !min-w-max !px-4 translate-y-[150%] group-hover/certificate:translate-y-0 transition-all duration-200 text-sm">
                      View Large
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section> */}
        </section>
      </div>
    </section>
  );
}
