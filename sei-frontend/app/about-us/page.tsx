import Image from "next/image";
import Link from "next/link";
import React from "react";
import Button from "../components/Button";
import NextSvg from "../svgicons/NextSvg";

// import { LuArrowDownRightFromCircle } from "react-icons/lu";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import OurMission from "../svgicons/OurMission";
import OurVision from "../svgicons/OurVision";
import OurGoal from "../svgicons/OurGoal";
import TeamList from "../components/TeamList";
import TabMenu from "../components/TabMenu";
import TwoColumn from "../components/TwoColumn";

// const why_choose_us = [
//   {
//     icon: <OurMission color="#e9b858" />,
//     heading: "Our Mission",
//     subheading:
//       "Through Education and Training, over the waterways of the world, progress and growth of all.",
//   },
//   {
//     icon: <OurVision color="#e9b858" />,
//     heading: "Our Vision",
//     subheading:
//       "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae natus repellendus iure debitis,",
//   },
//   {
//     icon: <OurGoal color="#e9b858" />,
//     heading: "Our Goal",
//     subheading:
//       "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae natus repellendus iure debitis,",
//   },
// ];

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

                <div className="relative col-span-2 h-full rounded-xl overflow-hidden">
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
              <div className="flex flex-col size-full justify-between sm:h-full">
                <div className="space-y-5">
                  <h2 className="text-5xl font-[600]">
                    Organizational{" "}
                    <span className="text-[#e9b858]">Profile</span>
                  </h2>
                  <p>
                    The Institute was initially conceived by late Dr. Pinaki
                    Chaterjee at Kolkata in January 1983. But he could not
                    translate his idea in concrete operational terms because of
                    his untimely demise in September 1983. Since the idea was
                    noble and was considered as nationally important, it was
                    taken up by a group of Academicians and Scientists of
                    Kolkata. The Sea Explorers Institute was registered as a
                    voluntary and non-profiteering Institute in the year 1984.
                  </p>
                  <p>
                    But actually it came into life only in the year 1987. The
                    foundation stone was laid by the then Chief Minister of West
                    Bengal, Shri Jyoti Basu.
                  </p>
                  <p>
                    A Trust or a sister Institute was carved out of the Sea
                    Explorers’ institute which became an independent legal
                    entity, in April 1999, in the name of SEI Educational Trust,
                    to run the STCW courses with approval of D. G. Shipping,
                    India.
                  </p>
                  <p>
                    In July 2014, the SEI Educational Trust moved its Kolkata
                    campus from its location at Outram Ghat, Kolkata to
                    Sarkarpool in Kolkata and another campus of the Institute
                    was established in Faridabad, Haryana, India.
                  </p>
                </div>

                <ul className="flex items-center flex-wrap gap-4 mt-4">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <li key={item} className="flex items-center gap-x-2">
                      <MdOutlineRemoveRedEye className="-rotate-45" />
                      <span>Expart Teachers</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-3 flex-wrap mt-5 *:inline-block *:flex-grow">
                  <Link href={"/our-courses/kolkata"}>
                    <Button className="!bg-[#ffffff] w-full !border-gray-500 !text-black hover:!bg-[#e9b858] hover:!border-white">
                      <span>Enroll Now</span>
                      <NextSvg />
                    </Button>
                  </Link>
                  <Link href={"/contact-us"}>
                    <Button className="!bg-[#e9b858] !text-black hover:bg-[#e9b95871] w-full">
                      <span>Contact Us Now</span>
                      <NextSvg />
                    </Button>
                  </Link>
                </div>
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
          <ul className="w-full space-y-10">
            <li className="basis-52 flex-grow shadow-md border border-gray-100 p-7 rounded-2xl">
              <div className="size-12 bg-[#e9b95836] flex-center p-2 rounded-xl">
                <OurMission color="#e9b858" />
              </div>
              <h2 className="font-semibold text-2xl mt-2">Our Mission</h2>
              <h3>
                Through Education and Training, over the waterways of the world,
                progress and growth of all.
              </h3>
            </li>
            <li className="basis-52 flex-grow shadow-md border border-gray-100 p-7 rounded-2xl">
              <div className="size-12 bg-[#e9b95836] flex-center p-2 rounded-xl">
                <OurVision color="#e9b858" />
              </div>
              <h2 className="font-semibold text-2xl mt-2">Our Vision</h2>
              <h3 className="*:block space-y-3 mt-2">
                <span>
                  1. To provide maritime studies, keeping in pace with the fast
                  changing world of shipping, so as to deliver competent and
                  proficient seafarers who shall excel in the world.
                </span>

                <span>
                  2. Continuously upgrade existing training procedures, and
                  evolve new ones, in pursuit of excelling in the field of
                  maritime education.
                </span>
                <span>
                  {" "}
                  3. Develop new curricula and facilities for those fields of
                  the shipping industry which are newly explored and/or are
                  still underrepresented.
                </span>
                <span>
                  {" "}
                  4. Develop entrepreneurship programmes in Shipping Industry,
                  thereby bridging the knowledge gap for non seafarers, such
                  that new entrepreneurs are encouraged to venture into ship
                  owning and other aspects of maritime trade and do not shy away
                  due to it being highly regulated.
                </span>
                <span>
                  {" "}
                  5. Promote research and innovation in the field of maritime
                  technology and systems.
                </span>
              </h3>
            </li>
            <li className="basis-52 flex-grow shadow-md border border-gray-100 p-7 rounded-2xl">
              <div className="size-12 bg-[#e9b95836] flex-center p-2 rounded-xl">
                <OurGoal color="#e9b858" />
              </div>
              <h2 className="font-semibold text-2xl mt-2">Quality Policy</h2>
              <h3 className="*:block space-y-3 mt-2">
                <span>
                  At SEI Educational Trust — a Maritime Institute, it is our
                  passion to create a world of opportunities for those who
                  desire to make a career at sea and to provide the best
                  support, within our framework, to those who intend to advance
                  and enhance their existing ones.
                </span>
                <span>
                  We are committed to comply with all requirements of our
                  students, in terms of education and training quality,
                  including D. G. Shipping guidelines / STCW conventions
                </span>
                <span>
                  We are also committed for context of SEI,applicable
                  requirements, continual improvement of our training process
                  including Quality Management System, as a whole, aiming at
                  student's satisfaction by
                </span>

                <span>
                  Ø Monitoring customer's perception for improvement
                  opportunities in all possible areas.
                </span>
                <span>
                  Ø Monitoring faculty performance and improvement opportunities
                  in all possible areas.
                </span>
              </h3>
            </li>
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
