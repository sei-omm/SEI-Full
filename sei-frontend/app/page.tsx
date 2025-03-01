import Image from "next/image";

import NextSvg from "./svgicons/NextSvg";
import Button from "./components/Button";
// import Ratings from "./components/Ratings";
import { CiCalendarDate } from "react-icons/ci";
import { BsPhoneVibrateFill } from "react-icons/bs";
import Link from "next/link";
import { GiRotaryPhone } from "react-icons/gi";
import HomeNewBanner from "./components/HomeNewBanner";

const what_we_provide = [
  {
    icon: "/icons/docuemnts.svg",
    heading: "Assessment and Evaluation",
    subheading:
      "We believe in nurturing talent through rigorous and fair assessment methods to ensure students meet the highest standards of competency and professionalism. Our evaluation system includes continuous monitoring through regular theoretical and practical assessments, simulator-based evaluations to test decision-making and technical skills in a controlled environment, and industry-aligned standards that comply with global maritime regulations and industry requirements.",
  },
  {
    icon: "/icons/graduation-cap.svg",
    heading: "Learning and Instruction",
    subheading:
      "Our pedagogy is designed to inspire, engage, and empower students to excel in the maritime industry through a well-structured learning approach. We offer interactive learning that combines classroom lectures, hands-on training, and simulator-based education, an updated curriculum that reflects the latest advancements in maritime technology and regulations, and a focus on best practices to prepare students for real-world challenges.",
  },
  {
    icon: "/icons/research.svg",
    heading: "Research and Exploration",
    subheading:
      "Innovation is at the core of maritime progress, and we are committed to advancing knowledge and technology in the field. Our research initiatives focus on cutting-edge advancements in maritime safety systems, entrepreneurship development programs that encourage non-seafarers to explore opportunities in ship owning and maritime trade, and sustainability-focused research into eco-friendly practices and technologies for sustainable shipping.",
  },
  {
    icon: "/icons/teamwork.svg",
    heading: "Collaboration and Interaction",
    subheading:
      "We believe that success in the maritime industry is built on strong collaboration between students, faculty, and industry professionals. Our programs foster meaningful industry partnerships through joint projects and training, interactive sessions that bridge the gap between academics and practical applications, and networking opportunities that help students build valuable connections within the global maritime community.",
  },
];

const notices = [
  {
    heading: "1 SPECIAL PACKAGE FOR JULY & AUGUST-2024",
    date: "14 July, 2024",
    description:
      "SPECIAL PACKAGE FOR JULY & AUGUST-2024 HURRY UP ASM+SMS ONLY RS. 24,999/-",
  },
  {
    heading: "2 SPECIAL PACKAGE FOR JULY & AUGUST-2024",
    date: "14 July, 2024",
    description:
      "SPECIAL PACKAGE FOR JULY & AUGUST-2024 HURRY UP ASM+SMS ONLY RS. 24,999/-",
  },
  {
    heading: "3 SPECIAL PACKAGE FOR JULY & AUGUST-2024",
    date: "14 July, 2024",
    description:
      "SPECIAL PACKAGE FOR JULY & AUGUST-2024 HURRY UP ASM+SMS ONLY RS. 24,999/-",
  },

  {
    heading: "4 SPECIAL PACKAGE FOR JULY & AUGUST-2024",
    date: "14 July, 2024",
    description:
      "SPECIAL PACKAGE FOR JULY & AUGUST-2024 HURRY UP ASM+SMS ONLY RS. 24,999/-",
  },

  {
    heading: "5 SPECIAL PACKAGE FOR JULY & AUGUST-2024",
    date: "14 July, 2024",
    description:
      "SPECIAL PACKAGE FOR JULY & AUGUST-2024 HURRY UP ASM+SMS ONLY RS. 24,999/-",
  },
];

export default function Home() {
  return (
    <div>
      <div className="min-h-10 w-full bg-white flex items-center">
        <div className="bg-transparent main-layout flex items-center justify-between text-gray-500 flex-wrap sm:gap-y-2 sm:py-2">
          <div className="flex-center gap-2 font-semibold">
            <BsPhoneVibrateFill />
            <Link href={"tel:9830782955"}>+91-9830782955 | Kolkata</Link>
          </div>
          <div className="flex-center gap-2 font-semibold">
            <GiRotaryPhone />
            <Link href={"tel:129-4002955"}>+91-129-4002955 | Faridabad</Link>
          </div>
        </div>
      </div>
      {/* <HomeBanner /> */}
      <HomeNewBanner />
      <div className="main-layout">
        {/* what we provide */}
        <section className="space-y-10 py-10">
          <div className="flex flex-wrap gap-y-2 items-start">
            <div className="flex items-center basis-96 flex-grow">
              <h2 className="text-5xl font-semibold">
                Our <span className="text-[#e9b858]">Best Features</span> For
                you
              </h2>
            </div>

            <div className="basis-96 flex-grow">
              <p>
                At S.E.I Educational Trust, we pride ourselves on offering
                unparalleled maritime education and training. Here’s what sets
                us apart
              </p>
            </div>
          </div>

          <ul className="flex flex-wrap justify-center gap-10">
            {what_we_provide.map((info) => (
              <li
                key={info.heading}
                className="shadow-2xl border border-gray-100 p-6 space-y-2 rounded-2xl basis-[26rem] max-w-[50rem] flex-grow"
              >
                <div className="size-12 p-3 bg-[#ffc75f96] rounded-full">
                  <Image src={info.icon} alt="" height={1200} width={1200} />
                </div>
                <h2 className="font-semibold text-[1.3rem]">{info.heading}</h2>
                <h3 className="text-gray-500">{info.subheading}</h3>
              </li>
            ))}
          </ul>

          {/* <ul className="flex flex-col gap-10">
            <li className="shadow-2xl border border-gray-100 p-6 space-y-2 rounded-2xl flex-grow">
              <div className="size-12 p-3 bg-[#ffc75f96] rounded-full">
                <Image
                  src={"/icons/docuemnts.svg"}
                  alt=""
                  height={1200}
                  width={1200}
                />
              </div>
              <h2 className="font-semibold text-[1.3rem]">
                Assessment and Evaluation
              </h2>
              <h3 className="text-gray-500">
                We believe in nurturing talent through rigorous and fair
                assessment methods. Our evaluation system is designed to ensure
                that every student meets the highest standards of competency and
                professionalism.
                <div className="*:block *:pl-4 mt-4 *:before:content-['•'] *:before:text-2xl *:before:mt-4">
                  <span>
                    Continuous Monitoring: Regular assessments, both theoretical
                    and practical, to track progress and identify areas for
                    improvement.
                  </span>
                  <span>
                    Simulator-Based Evaluations: Realistic simulations to test
                    decision-making, problem-solving, and technical skills in a
                    controlled environment.
                  </span>
                  <span>
                    Industry-Aligned Standards: Our evaluation criteria are
                    aligned with global maritime regulations and industry
                    requirements, ensuring our graduates are job-ready.
                  </span>
                </div>
              </h3>
            </li>
            <li className="shadow-2xl border border-gray-100 p-6 space-y-2 rounded-2xl flex-grow">
              <div className="size-12 p-3 bg-[#ffc75f96] rounded-full">
                <Image
                  src={"/icons/research.svg"}
                  alt=""
                  height={1200}
                  width={1200}
                />
              </div>
              <h2 className="font-semibold text-[1.3rem]">
                Research and Exploration
              </h2>
              <h3 className="text-gray-500">
                Innovation is at the heart of maritime progress. At S.E.I
                Educational Trust, we are committed to pushing the boundaries of
                maritime knowledge and technology.
                <div className="*:block *:pl-4 mt-4 *:before:content-['•'] *:before:text-2xl *:before:mt-4">
                  <span>
                    Cutting-Edge Research: Our research initiatives focus on
                    emerging fields such as maritime safety systems.
                  </span>
                  <span>
                    Entrepreneurship Development: Programs to encourage
                    non-seafarers to explore opportunities in ship owning and
                    maritime trade.
                  </span>
                  <span>
                    Sustainability Focus: Research into eco-friendly practices
                    and technologies to promote sustainable shipping.
                  </span>
                </div>
              </h3>
            </li>

            <li className="shadow-2xl border border-gray-100 p-6 space-y-2 rounded-2xl flex-grow">
              <div className="size-12 p-3 bg-[#ffc75f96] rounded-full">
                <Image
                  src={"/icons/graduation-cap.svg"}
                  alt=""
                  height={1200}
                  width={1200}
                />
              </div>
              <h2 className="font-semibold text-[1.3rem]">
                Learning and Instruction
              </h2>
              <h3 className="text-gray-500">
                Our pedagogy is designed to inspire, engage, and empower
                students to excel in the maritime industry.
                <div className="*:block *:pl-4 mt-4 *:before:content-['•'] *:before:text-2xl *:before:mt-4">
                  <span>
                    Interactive Learning: A blend of classroom lectures,
                    hands-on training, and simulator-based learning to provide a
                    holistic educational experience.
                  </span>
                  <span>
                    Updated Curriculum: Our courses are continuously updated to
                    reflect the latest advancements in maritime technology,
                    regulations, and best practices.
                  </span>
                </div>
              </h3>
            </li>

            <li className="shadow-2xl border border-gray-100 p-6 space-y-2 rounded-2xl flex-grow">
              <div className="size-12 p-3 bg-[#ffc75f96] rounded-full">
                <Image
                  src={"/icons/research.svg"}
                  alt=""
                  height={1200}
                  width={1200}
                />
              </div>
              <h2 className="font-semibold text-[1.3rem]">
                Collaboration and Interaction
              </h2>
              <h3 className="text-gray-500">
                We believe that collaboration is key to success in the maritime
                industry. Our students, faculty, and industry partners work
                together to create a vibrant learning community.
              </h3>
            </li>
          </ul> */}
        </section>

        {/* About Us */}
        <section className="flex items-center flex-wrap gap-x-12 gap-y-5 py-10">
          <div className="overflow-hidden flex-center relative basis-[30rem] flex-grow">
            <div className="w-full aspect-video overflow-hidden shadow-2xl relative rounded-3xl">
              <Image
                className="size-full"
                src={"/images/About/img1.jpg"}
                alt="about image"
                height={1200}
                width={1200}
              />

              <div className="absolute inset-0 fade-to-top-yellow-color"></div>
            </div>
          </div>

          <div className="flex justify-center flex-col gap-y-5 basis-[30rem] flex-grow">
            <h2 className="font-semibold text-5xl">
              We are one of the leading{" "}
              <span className="text-[#e9b858]">
                Maritime Training Institutes
              </span>
            </h2>
            <p className="text-[#4b4231] space-y-3">
              <span className="inline-block">
                At S.E.I Educational Trust, we stand at the forefront of
                maritime education and training, recognized as one of the
                premier institutes in the field. Our commitment to excellence,
                innovation, and industry relevance has earned us a reputation as
                a trusted partner for aspiring seafarers and maritime
                professionals worldwide.
              </span>

              {/* <span className="inline-block">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex
                omnis harum eveniet animi commodi rem! Ea quisquam, corporis
                alias laudantium obcaecati sed molestiae porro sequi et repellat
                saepe. Vitae, eum?
              </span> */}
            </p>

            <Link href={"/contact-us"}>
              <Button className="!bg-[#e9b858] !text-black hover:bg-[#e9b95871]">
                <span>Contact Us Now</span>
                <NextSvg />
              </Button>
            </Link>
          </div>
        </section>

        {/* Our Courses */}
        {/* <section className="pb-10 pt-5">
          <div className="flex-center flex-col gap-y-2">
            <h2 className="text-5xl font-semibold">
              Our <span className="text-[#e9b858]">Courses</span>
            </h2>
            <h3 className="max-w-[40rem] text-center sm:text-left">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Exercitationem possimus itaque error saepe, rerum eaque ducimus
              veniam assumenda.
            </h3>
          </div>

          <ul className="flex flex-wrap justify-center gap-8 py-8">
            {courses.map((course, index) => (
              <CourseItem
                key={index}
                className="sm:!max-w-full"
                course={course}
              />
            ))}
          </ul>
        </section> */}

        {/* Ratings */}
        {/* <section className="py-10 sm:pt-0">
          <div className="flex flex-wrap gap-y-2">
            <div className="flex items-center basis-96 flex-grow">
              <h2 className="text-5xl font-semibold">
                What <span className="text-[#e9b858]">Our Students</span> Say
              </h2>
            </div>

            <div className="basis-96 flex-grow">
              <p>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                Aspernatur ea aperiam, eveniet expedita accusamus facere sequi
                reprehenderit praesentium obcaecati dolorum provident doloremque
                molestiae itaque consequatur deleniti, ab vitae, odit est?
              </p>
            </div>
          </div>
          <Ratings />
        </section> */}

        {/* Promo Banner Section */}
        <section className="pt-20 overflow-hidden sm:pt-0">
          <section className="bg-[#EAE7E4] w-full h-72 rounded-2xl p-14 grid grid-cols-2 sm:grid-cols-1 sm:h-auto sm:p-9 sm:pb-0">
            <div>
              <h2 className="text-4xl font-semibold">Are you Ready to fly &</h2>
              <h3 className="text-3xl">Pursue your dream job?</h3>

              <p className="text-gray-500 mt-1">
                Are you ready to take flight and pursue your dream job? Step
                forward with confidence, chase your passion, and turn your
                ambitions into reality!
              </p>
              <Link href={"/contact-us"}>
                <Button
                  varient="light"
                  className="!py-2 !min-w-36 mt-4 hover:!text-black"
                >
                  <span>Contact us</span>
                  <NextSvg />
                </Button>
              </Link>
            </div>

            <div className="flex items-end flex-col pr-14 sm:items-center sm:pr-0">
              <Image
                className="w-[24rem] -translate-y-36 object-contain sm:translate-y-0 sm:translate-x-5"
                src={"/images/MarinMan.png"}
                alt=""
                height={1200}
                width={1200}
              />
            </div>
          </section>
        </section>

        {/* Notice Board */}
        <section className="py-10">
          <div className="w-full shadow-xl border min-h-64 p-8 hidden sm:block">
            <h2 className="text-5xl font-semibold border-b border-[#e9b858] pb-2">
              Latest <span className="text-[#e9b858]">Notice</span>
            </h2>

            <ul className="space-y-3 mt-3 size-full">
              {notices.map((notice, index) => (
                <li key={index}>
                  {/* Notice Heading */}
                  <h2 className="font-[600] text-sm">{notice.heading}</h2>
                  <p className="flex items-center gap-x-1 text-xs">
                    <CiCalendarDate />
                    {notice.date}
                  </p>
                  <p className="text-xs">{notice.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
