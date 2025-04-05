import Image from "next/image";
import React from "react";
import { CiLogin } from "react-icons/ci";

import Link from "next/link";
import Button from "./Button";
import { BASE_API } from "../constant";
import { IResponse } from "../type";

type TSocialLinks = {
  social_link_id: number;
  social_platform: string;
  link: string;
  icon: string;
  institute: string;
};

export default async function Footer() {
  const response = await fetch(`${BASE_API}/website/social`, {
    cache: "default",
  });

  const social_links: TSocialLinks[] = [];

  if (response.ok) {
    try {
      const result = (await response.json()) as IResponse<TSocialLinks[]>;
      social_links.push(...result.data);
    } catch {}
  }

  const kolkata_social_links: TSocialLinks[] = [];
  const faridabad_social_links: TSocialLinks[] = [];
  social_links.forEach((item) => {
    if (item.institute === "Kolkata") {
      kolkata_social_links.push(item);
    } else {
      faridabad_social_links.push(item);
    }
  });

  return (
    <footer className="w-full bg-[#384A5A] text-background mt-10 pt-9">
      <div className="main-layout grid grid-cols-3 gap-10 sm:grid-cols-1">
        <div className="space-y-5">
          <div className="flex items-start gap-x-3">
            <Image
              className="brightness-0 invert w-14"
              src={"/images/logo.png"}
              alt="Logo"
              height={1200}
              width={1200}
            />
            <div className="flex flex-col space-y-1">
              <h3 className="font-semibold leading-none">
                SEI EDUCATIONAL TRUST
              </h3>
              <span className="text-xs">
                approved by D.G.Shipping, Govt. of India
              </span>
              <span className="text-xs">
                MTI No.: 303014 (Kolkata) | MTI No.: 103011 (Faridabad)
              </span>
            </div>
          </div>
          <p className="text-[14px] text-gray-400">
            At SEI Educational Trust, leadership begins at sea! ⚓🌊 Join a
            legacy of excellence and chart your course toward a thriving
            maritime career.
          </p>

          <div className="space-y-6">
            {/* <h2 className="text-xs text-gray-400">Kolkata</h2> */}
            {kolkata_social_links.length !== 0 ? (
              <div className="space-y-2">
                <h2 className="text-xs text-gray-400">Kolkata</h2>
                <div className="flex items-center gap-4">
                  {kolkata_social_links.map((socialInfo) => (
                    <Link
                      key={socialInfo.social_link_id}
                      href={socialInfo.link}
                      title={socialInfo.social_platform}
                      className="size-8 inline-block rounded-lg border flex-center p-1"
                    >
                      {/* <GrFacebookOption /> */}
                      <div
                        className="size-[18px]"
                        dangerouslySetInnerHTML={{ __html: socialInfo.icon }}
                      ></div>
                    </Link>
                  ))}
                  {/* <Link
                  href={"https://www.facebook.com/seieducational.trust"}
                  className="size-8 inline-block rounded-lg border flex-center p-1"
                >
                  <GrFacebookOption />
                </Link>
                <Link
                  href={"https://twitter.com/kolseiedutrust"}
                  className="size-8 inline-block rounded-lg border flex-center p-1"
                >
                  <IoLogoTwitter />
                </Link>
                <Link
                  href={"https://www.instagram.com/seiedutrustkolkata/"}
                  className="size-8 inline-block rounded-lg border flex-center p-1"
                >
                  <FaInstagram />
                </Link> */}
                </div>
              </div>
            ) : null}
            <div className="w-32 h-[1px] opacity-40 bg-slate-500"></div>
            {faridabad_social_links.length !== 0 ? (
              <div className="space-y-2">
                <h2 className="text-xs text-gray-400">Faridabad</h2>
                <div className="flex items-center gap-4">
                  {faridabad_social_links.map((socialInfo) => (
                    <Link
                      key={socialInfo.social_link_id}
                      href={socialInfo.link}
                      title={socialInfo.social_platform}
                      className="size-8 inline-block rounded-lg border flex-center p-1"
                    >
                      <div
                        className="size-[18px]"
                        dangerouslySetInnerHTML={{ __html: socialInfo.icon }}
                      ></div>
                    </Link>
                  ))}

                  {/* <Link
                      href={"https://www.facebook.com/share/17SvrnvhJz/"}
                      className="size-8 inline-block rounded-lg border flex-center p-1"
                    >
                      <GrFacebookOption />
                    </Link>
                    <Link
                    href={"https://twitter.com/kolseiedutrust"}
                    className="size-8 inline-block rounded-lg border flex-center p-1"
                  >
                    <IoLogoTwitter />
                  </Link>
                    <Link
                      href={"https://www.instagram.com/seiedutrustfaridabad/"}
                      className="size-8 inline-block rounded-lg border flex-center p-1"
                    >
                      <FaInstagram />
                    </Link> */}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="col-span-2 space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-y-5 items-center">
              <h4 className="font-semibold text-xl uppercase flex-grow">
                Our Centers & Contacts
              </h4>

              <Link href={`${process.env.NEXT_PUBLIC_BASE_CRM}/auth/login`}>
                <Button className="sm:mb-3">
                  <CiLogin size={20} />
                  <span>Employee Login</span>
                </Button>
              </Link>
            </div>
            <div className="w-[20%] h-[1px] bg-gray-700 "></div>
          </div>
          <div className="grid grid-cols-2 gap-x-10">
            <div className="flex flex-col gap-y-1">
              <h2 className="font-semibold">KOLKATA</h2>
              <span className="text-sm text-gray-300">
                &apos;Debamita&apos;, B.B.T Road, Vill. - Gopalpur, P.O.
                Sarkarpool, P.S. - Maheshtala, Kolkata - 700141, India
              </span>
              <span className="text-sm text-gray-300">MTI No.: 303014</span>
              <div className="h-[0.5px] w-[30%] bg-gray-700 mt-3"></div>
              <div className="flex flex-col gap-y-2 text-sm text-gray-300 mt-3">
                <span>
                  Fax: <Link href={"tel:+91-33-24019955"}>+91-33-24019955</Link>
                </span>
                <span>
                  Mobile:{" "}
                  <Link href={"tel:+91-9830782955"}>+91-9830782955</Link>
                </span>
                <span>
                  Email:{" "}
                  <Link href={"mailto:booking@seiedutrust.com"}>
                    booking@seiedutrust.com
                  </Link>
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-y-1">
              <h2 className="font-semibold">FARIDABAD</h2>
              <span className="text-sm text-gray-300">
                S - 13 Sector 11D Market, Faridabad-121006, Haryana,India
              </span>
              <span className="text-sm text-gray-300">MTI No.: 103011</span>

              <div className="h-[0.5px] w-[30%] bg-gray-700 mt-3"></div>
              <div className="flex flex-col gap-y-2 text-sm text-gray-300 mt-3">
                <span>
                  Mobile: <Link href={"tel:9643512955"}>9643512955</Link> /{" "}
                  <Link href={"tel:9643502955"}>9643502955</Link>
                </span>
                {/* <span>
                  Phone:{" "}
                  <Link href={"tel:+91-129-4002955"}>+91-129-4002955</Link>
                </span> */}
                <span>
                  Email:{" "}
                  <Link href={"mailto:fbd@seiedutrust.com"}>
                    fbd@seiedutrust.com
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="flex-center py-3">
        <div className="w-[50%] h-[1px] bg-gray-800"></div>
      </div> */}
      <div className="flex justify-end flex-wrap gap-4 pt-5 main-layout">
        <Link className="text-sm" href={"/"}>
          Home
        </Link>
        <Link className="text-sm" href={"/"}>
          Privacy Policy
        </Link>
        <Link className="text-sm" href={"/"}>
          Terms & Conditions
        </Link>
        {/* <Link className="text-sm" href={"/"}>
          Disclaimer
        </Link> */}
        <Link className="text-sm" href={"/"}>
          Refund Policy
        </Link>
      </div>

      {/* bg-[#7c7c62a9]  */}
      {/* bg-[#7c7c62a9] */}
      <div className="bg-[#2c455a] mt-4">
        <div className="flex items-center flex-wrap gap-y-3 justify-between main-layout py-2 text-sm sm:justify-center">
          <span>© 2019 SEI Education Trust. All Rights Reserved.</span>

          <Link href={"https://ommdigitalsolution.com/"}>
            Developed by OMM Digital Soluction Pvt.Ltd
          </Link>
        </div>
      </div>
    </footer>
  );
}
