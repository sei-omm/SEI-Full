import Button from "@/app/components/Button";
import TabMenu from "@/app/components/TabMenu";
import TwoColumn from "@/app/components/TwoColumn";
import NextSvg from "@/app/svgicons/NextSvg";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VscDebugBreakpointLog } from "react-icons/vsc";

interface IProps {
  params: {
    centerName: string;
  };
}

const centersInfo = [
  { 
    name: "kolkata",
    aboutSection: {
      heading: `About Our Joyful Center <span class="text-[#e9b858]">Kolkata</span>`,
      description:
        "SEIET Kolkata is situated in the vibrant heart of Kolkata city, offering unparalleled accessibility and convenience. With a vast network of transport options at its doorstep, the institute is easily reachable, whether you’re traveling by bus, metro, or other local transit systems, making it an ideal destination for students and professionals alike.",
      points: [
        "45 mints from Dharmtala",
        "1 hour 15 mints from Airport",
        "60 mints from Howrah station",
        "60 mints from Sealdah station",
        "10-15 mints from Taratalla",
        "10-15 mints from Parnosree",
      ],
      button1Text: "Enroll Now For Kolkata",
      images: [
        "/images/Centers/center_kolkata.jpg",
        "/images/Centers/kolkata1.jpg",
        "/images/Centers/kolkata2.jpg",
      ],
    },
    mapSection: {
      heading: `Kolkata Center's <span class="text-[#e9b858]">Map Locations</span>`,
      mapLink:
        "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14742.845444854582!2d88.2896347!3d22.5150102!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a027987583dee6d%3A0xbd7b2afc4a39564e!2sSEI%20Educational%20Trust!5e0!3m2!1sen!2sin!4v1727440475870!5m2!1sen!2sin",
    },
  },

  {
    name: "faridabad",
    aboutSection: {
      heading: `About Our Developing City, <span class="text-[#e9b858]">Faridabad</span>`,
      description:
        "SEI Educational Trust, situated in the rapidly growing city of Faridabad within the National Capital Region of Delhi, offers a prime location in North India. With its proximity to the capital, it serves as a gateway to numerous opportunities, making it an ideal spot for both educational and professional pursuits",
      points: [
        "30 minutes from Delhi",
        "1 hour from IGI Airport",
        "5 minutes from Faridabad railway station",
        "2 minutes walking distance from Escorts Mujesar Metro station",
      ],
      button1Text: "Enroll Now For Faridabad",
      images: [
        "/images/Centers/center_faridabad.jpg",
        "/images/Centers/faridabad1.jpg",
        "/images/Centers/faridabad2.jpg",
      ],
    },
    mapSection: {
      heading: `Faridabad Center's <span class="text-[#e9b858]">Map Locations</span>`,
      mapLink:
        "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3510.5440079585132!2d77.3193485!3d28.3726326!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cdc6f0d8c6b51%3A0x370214da7760973e!2sSEI%20Educational%20Trust%2C%20Faridabad!5e0!3m2!1sen!2sin!4v1727441610326!5m2!1sen!2sin",
    },
  },
];

export default function page({ params }: IProps) {
  if (params.centerName != "kolkata" && params.centerName != "faridabad") {
    return notFound();
  }

  const centerIndex = params.centerName === "faridabad" ? 1 : 0;

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
            <h1 className="tracking-wider text-gray-100 text-4xl font-semibold uppercase text-center">
              About Our Centers
            </h1>
            <span className="text-background text-sm">
              <Link href={"/"}>Home</Link>
              <span> / </span>
              <Link href={"/our-centers"}>Centers</Link>
            </span>
          </div>
        </div>
      </div>

      <div className="w-full main-layout py-10">
        <TabMenu
          tabs={[
            {
              isSelected: params.centerName === "kolkata" ? true : false,
              text: "Kolkata",
              slug: "/our-centers/kolkata",
            },
            {
              isSelected: params.centerName === "faridabad" ? true : false,
              text: "Faridabad",
              slug: "/our-centers/faridabad",
            },
          ]}
        />

        <section className="w-full py-10">
          <TwoColumn
            columnOne={
              <div className="grid grid-cols-2 size-full gap-3 *:rounded-xl max-h-[26rem]">
                {centersInfo[centerIndex].aboutSection.images.map(
                  (image, index) => (
                    <div
                      key={index}
                      className={`size-full ${
                        index === 0 ? "row-span-2" : ""
                      } shadow-2xl rounded-xl overflow-hidden`}
                    >
                      <Image
                        className="size-full"
                        src={image}
                        alt="Board Images"
                        width={1200}
                        height={1200}
                      />
                    </div>
                  )
                )}
              </div>
            }
            columnTwo={
              <div className="flex flex-col gap-y-6 size-full justify-between">
                <div className="space-y-1">
                  <h2
                    dangerouslySetInnerHTML={{
                      __html: centersInfo[centerIndex].aboutSection.heading,
                    }}
                    className="text-5xl font-[600]"
                  ></h2>
                  <p>
                    {/* SEIET Kolkata is situated in the vibrant heart of Kolkata
                    city, offering unparalleled accessibility and convenience.
                    With a vast network of transport options at its doorstep,
                    the institute is easily reachable, whether you’re traveling
                    by bus, metro, or other local transit systems, making it an
                    ideal destination for students and professionals alike. */}
                    {centersInfo[centerIndex].aboutSection.description}
                  </p>
                </div>

                <ul className="flex items-center flex-wrap gap-4">
                  {centersInfo[centerIndex].aboutSection.points.map((point) => (
                    <li key={point} className="flex items-center gap-x-2">
                      <VscDebugBreakpointLog className="-rotate-45" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">
                  <Button className="!bg-[#ffffff] !border-gray-500 !text-black hover:!bg-[#e9b858] hover:!border-white">
                    <span>
                      {centersInfo[centerIndex].aboutSection.button1Text}
                    </span>
                    <NextSvg />
                  </Button>
                  <Button className="!bg-[#e9b858] !text-black hover:bg-[#e9b95871] !border-gray-700">
                    <span>Contact Us Now</span>
                    <NextSvg />
                  </Button>
                </div>
              </div>
            }
          />
        </section>

        <section className="w-full py-10">
          <div className="flex flex-col items-center gap-y-2">
            <h2
              dangerouslySetInnerHTML={{
                __html: centersInfo[centerIndex].mapSection.heading,
              }}
              className="text-5xl font-semibold"
            ></h2>
            <h3 className="max-w-[40rem] sm:max-w-full">
              Google map that will help you to find our beautiful center
            </h3>
          </div>

          <iframe
            className="w-full rounded-2xl shadow-2xl mt-10 outline-none"
            src={centersInfo[centerIndex].mapSection.mapLink}
            width="600"
            height="450"
            loading="lazy"
          ></iframe>
        </section>
      </div>
    </div>
  );
}
