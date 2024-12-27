import Image from "next/image";
import React from "react";

import { GrFacebookOption } from "react-icons/gr";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { CiLogin } from "react-icons/ci";

import Link from "next/link";
import Button from "./Button";

export default function Footer() {
  return (
    <footer className="w-full bg-foreground text-background mt-10 pt-9">
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
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam
            quidem eius corrupti illo magni vitae, qui nihil tempore quam nisi,
            asperiores iste sunt modi adipisci obcaecati vero error, explicabo
            quis.
          </p>

          <div className="flex items-center gap-x-4">
            <div className="size-8 rounded-lg border flex-center p-1">
              <GrFacebookOption />
            </div>
            <div className="size-8 rounded-lg border flex-center p-1">
              <FaInstagram />
            </div>
            <div className="size-8 rounded-lg border flex-center p-1">
              <FaLinkedinIn />
            </div>
            <div className="size-8 rounded-lg border flex-center p-1">
              <FaYoutube />
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-y-5 items-center">
              <h4 className="font-semibold text-xl uppercase flex-grow">
                Our Centers & Contacts
              </h4>

              <Button className="sm:mb-3">
                <CiLogin size={20} />
                <span>Employee Login</span>
              </Button>
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
                  Mobile:{" "}
                  <Link href={"tel:9643512955"}>9643512955</Link> /{" "}
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

      <div className="bg-black mt-4">
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
