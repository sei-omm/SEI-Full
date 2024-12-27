import Image from "next/image";
import Link from "next/link";
import React from "react";
import Button from "../components/Button";
import NextSvg from "../svgicons/NextSvg";
import TabMenu from "../components/TabMenu";

const locations = [
  "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14742.845444854582!2d88.2896347!3d22.5150102!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a027987583dee6d%3A0xbd7b2afc4a39564e!2sSEI%20Educational%20Trust!5e0!3m2!1sen!2sin!4v1727440475870!5m2!1sen!2sin",
  "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3510.5440079585132!2d77.3193485!3d28.3726326!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cdc6f0d8c6b51%3A0x370214da7760973e!2sSEI%20Educational%20Trust%2C%20Faridabad!5e0!3m2!1sen!2sin!4v1727441610326!5m2!1sen!2sin",
];

interface IProps {
  searchParams: {
    map: string;
  };
}

export default function page({ searchParams }: IProps) {
  const currentLocationToLoad =
    searchParams.map === "faridabad" ? locations[1] : locations[0];

  return (
    <div>
      <div className="w-full h-[60vh] relative overflow-hidden">
        <Image
          className="size-full object-cover"
          src={"/images/Banners/ContactUsBanner.jpg"}
          alt="Contact Us Banner"
          height={1200}
          width={1200}
        />

        <div className="absolute inset-0 size-full bg-[#000000a6]">
          <div className="main-layout size-full flex-center flex-col">
            <h1 className="tracking-wider text-gray-100 text-4xl font-semibold uppercase">
              Contact us
            </h1>
            <span className="text-background">
              <Link href={"/"}>Home</Link>
              <span> / </span>
              <Link href={"/contact-us"}>Contact us</Link>
            </span>
          </div>
        </div>
      </div>

      <div className="w-full main-layout">
        {/* Form Section */}
        <section className="flex flex-wrap gap-y-3 gap-x-10 py-10">
          <div className="space-y-6 basis-96 flex-grow">
            <div className="space-y-2">
              <h2 className="text-5xl font-[600]">
                Get in <span className="text-[#e9b858]">touch</span> with us
              </h2>
              <p className="space-y-2 *:block">
                <span>
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                  Possimus aliquid dolorum adipisci animi quae veritatis
                  expedita cumque, autem deserunt reprehenderit repellendus
                  fugit deleniti, voluptates iusto recusandae maiores. Dolore,
                  illo quo.
                </span>

                <span>
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                  Possimus aliquid dolorum adipisci animi quae veritatis
                  expedita.
                </span>
              </p>
            </div>
            <div className="h-[1px] w-1/2 bg-[#e9b9587a] mt-10"></div>

            <div className="flex flex-wrap gap-y-4">
              <div className="space-y-5 flex-grow basis-52">
                <h2 className="text-xl font-semibold">Kolkata</h2>
                <div>
                  <span className="block text-[#1F1F1FA1]">Email us</span>
                  <Link href={"mailt:booking@seiedutrust.com"}>
                    booking@seiedutrust.com
                  </Link>
                </div>

                <div>
                  <span className="block text-[#1F1F1FA1]">Call us</span>
                  <Link href={"tel:9830782955"}>+91-9830782955</Link>
                </div>
              </div>
              <div className="space-y-5 flex-grow basis-52">
                <h2 className="text-xl font-semibold">Faridabad</h2>
                <div>
                  <span className="block text-[#1F1F1FA1]">Email us</span>
                  <Link href={"mailt:fbd@seiedutrust.com"}>
                  fbd@seiedutrust.com
                  </Link>
                </div>

                <div>
                  <span className="block text-[#1F1F1FA1]">Call us</span>
                  <span>
                    <Link href={"tel:9643502955"}>+91-9643502955</Link>
                    <span> / </span>
                    <Link href={"tel:9643512955"}>+91-9643512955</Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <form className="w-full mt-4 basis-96 flex-grow">
            <div className="flex flex-wrap gap-5 *:flex-grow *:basis-56">
              <input
                className="outline-none bg-[#e9b9582a] py-2 px-4 w-full"
                placeholder="First Name"
              />
              <input
                className="outline-none bg-[#e9b9582a] py-2 px-4 w-full"
                placeholder="Last Name"
              />
              <input
                className="outline-none bg-[#e9b9582a] py-2 px-4 w-full"
                placeholder="Email Id"
              />
              <input
                className="outline-none bg-[#e9b9582a] py-2 px-4 w-full"
                placeholder="Contact Number"
              />
            </div>
            <textarea
              placeholder="Message"
              rows={8}
              className="outline-none bg-[#e9b9582a] py-2 px-4 w-full mt-4"
            ></textarea>

            <Button className="!bg-[#e9b858] w-full mt-4 !text-black hover:bg-[#e9b95871]">
              <span>Submit</span>
              <NextSvg />
            </Button>
          </form>
        </section>

        {/* Promo Banner */}
        <section className="pt-20 overflow-hidden sm:pt-0">
          <section className="bg-[#1F1F1F] w-full h-72 rounded-2xl p-14 flex flex-wrap gap-y-5 *:flex-grow *:basis-[26rem] lg:h-auto md:h-auto md:items-center sm:h-auto sm:px-8 sm:py-10">
            <div>
              <h2 className="text-4xl font-semibold text-gray-300">
                Don&apos;t forget to grow your
              </h2>
              <h3 className="text-3xl text-gray-400">
                carrer with SEI Educational Trust
              </h3>

              <p className="text-gray-500 mt-1">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Explicabo cum perspiciatis illum ex, sequi mollitia accusamus
                sapiente tempore
              </p>

              <Button
                varient="light"
                className="!py-2 !min-w-max !px-5 mt-4 hover:!text-white"
              >
                <span>Enroll Now</span>
                <NextSvg />
              </Button>
            </div>

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
          </section>
        </section>

        {/* Maps Section */}
        <section className="py-10">
          <div className="flex flex-col items-center gap-y-2">
            <h2 className="text-5xl font-semibold">
              Our Map <span className="text-[#e9b858]">Locations</span>
            </h2>
            <h3 className="max-w-[40rem] sm:max-w-full">
              See our beautiful education centers in google map
            </h3>
          </div>

          <div className="mt-8">
            <TabMenu
              tabs={[
                {
                  isSelected:
                    searchParams.map === "kolkata" || !searchParams.map
                      ? true
                      : false,
                  slug: "?map=kolkata",
                  text: "Kolkata",
                },
                {
                  isSelected: searchParams.map === "faridabad" ? true : false,
                  slug: "?map=faridabad",
                  text: "Faridabad",
                },
              ]}
            />
          </div>
          <iframe
            className="w-full rounded-2xl shadow-2xl mt-10 outline-none"
            src={currentLocationToLoad}
            width="600"
            height="450"
            loading="lazy"
          ></iframe>
        </section>
      </div>
    </div>
  );
}
