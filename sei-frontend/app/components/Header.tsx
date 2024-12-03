"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Button from "./Button";
import { CiLogin, CiLogout } from "react-icons/ci";

import { CgMenu } from "react-icons/cg";
import { VscClose } from "react-icons/vsc";
import OpenDialogButton from "./OpenDialogButton";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useIsAuthenticated } from "../hooks/useIsAuthenticated";
import { MdOutlineAccountCircle } from "react-icons/md";
import { setProfileImage } from "../redux/slice/profileImage.slice";
import { removeInfo } from "../utils/saveInfo";
import { usePathname, useRouter } from "next/navigation";
import { BASE_API } from "../constant";
import { setLoginStatus } from "../redux/slice/loginStatus";
import SpinnerSvg from "./SpinnerSvg";

const nav_items = [
  {
    name: "Home",
    slug: "/",
  },
  {
    name: "About Us",
    slug: "/about-us",
  },
  {
    name: "Centers",
    slug: "/our-centers",
  },
  {
    name: "Courses",
    slug: "/our-courses/kolkata",
  },
  {
    name: "Career",
    slug: "/career",
  },
  {
    name: "Contact Us",
    slug: "/contact-us",
  },
  {
    name: "Blogs",
    slug: "/blogs",
  },
];

//brightness-0 invert ->> for make any image form any color to white

export default function Header() {
  const [mobileNavVisibility, setMobileNevVisibility] = useState(false);
  const [isLogouting, setIsLogouting] = useState(false);
  const route = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { status: loginStatus } = useSelector(
    (state: RootState) => state.loginStatus
  );

  const { isAuthenticated, userInfo } = useIsAuthenticated([loginStatus]);

  const { image: profileImage } = useSelector(
    (state: RootState) => state.profileImage
  );

  const logout = async () => {
    setIsLogouting(true);
    // await removeInfo("login-token");
    // await removeInfo("profile-image");
    await removeInfo("login-info");
    localStorage.clear();
    dispatch(setProfileImage({ image: null }));
    dispatch(setLoginStatus({ status: "logout" }));
    route.push("/");
    setIsLogouting(false);
  };

  return (
    <div className="w-full h-[100px] flex justify-center flex-col">
      <header className="flex items-center justify-between main-layout">
        {/* Logo Section */}
        <Link href={"/"} className="flex items-center gap-x-5">
          <Image
            className="brightness-0 invert w-[4.5rem]"
            src={"/images/logo.png"}
            alt="SEI Logo"
            height={512}
            width={512}
          />
          <div className="flex items-start flex-col text-white sm:hidden">
            <span className="text-2xl font-[600] tracking-widest">
              SEI EDUCATIONAL TRUST
            </span>
            <span className="text-sm text-gray-200">
              approved by D.G.Shipping, Govt. of India
            </span>
          </div>
        </Link>

        <nav
          className={`${
            mobileNavVisibility ? "sm:block" : "sm:hidden"
          } sm:fixed sm:z-50 sm:bg-white sm:inset-0 sm:h-screen`}
        >
          <div className="hidden sm:block relative py-4">
            <VscClose
              onClick={() => setMobileNevVisibility(false)}
              className="text-black absolute top-6 right-10"
              size={28}
            />
          </div>
          <ul className="flex items-center gap-x-7 text-white sm:text-black sm:flex-col sm:gap-y-7 sm:pt-10">
            {nav_items.map((item) => (
              <li
                key={item.slug}
                onClick={() => setMobileNevVisibility(false)}
                className="text-[16px] sm:text-xl group/nav_link"
              >
                <Link href={item.slug}>{item.name}</Link>
                <div
                  className={`h-[0.13rem] bg-[#E9B858] ${
                    item.slug === pathname ? "w-full" : "w-0"
                  } group-hover/nav_link:w-full transition-all duration-500`}
                ></div>
              </li>
            ))}
            <li className="relative">
              {isAuthenticated ? (
                <Link
                  href={"/account"}
                  className="size-10 group/profileMenu inline-block cursor-pointer overflow-hidden rounded-full border-2 border-[#E9B858] bg-slate-200"
                >
                  <Image
                    src={
                      profileImage
                        ? BASE_API + "/" + profileImage
                        : !userInfo?.profile_image ||
                          userInfo.profile_image === "null"
                        ? "/images/user_profile.jpg"
                        : BASE_API + "/" + userInfo.profile_image
                    }
                    alt="Profile Image"
                    height={80}
                    width={80}
                    quality={100}
                    className="size-full object-cover"
                  />

                  <div className="absolute right-4 top-16 translate-y-20 opacity-0 invisible group-hover/profileMenu:translate-y-0 group-hover/profileMenu:visible group-hover/profileMenu:opacity-100 transition-all duration-300">
                    <div className="bg-white text-black rounded-xl shadow-xl overflow-hidden">
                      <Link
                        href={"/account"}
                        className="flex items-center gap-3 min-w-44 px-5 py-2 hover:bg-gray-100"
                      >
                        <MdOutlineAccountCircle size={17} />
                        <span className="text-nowrap">My Account</span>
                      </Link>
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 min-w-44 px-6 py-2 hover:bg-gray-100"
                      >
                        {isLogouting ? (
                          <SpinnerSvg size="16px" />
                        ) : (
                          <CiLogout className="rotate-180" size={17} />
                        )}
                        <span className="text-nowrap">Logout</span>
                      </button>
                    </div>
                  </div>
                </Link>
              ) : (
                <OpenDialogButton type="OPEN" dialogKey="student-login-dialog">
                  <div>
                    <Button
                      onClick={() => setMobileNevVisibility(false)}
                      className="!min-w-max px-5 !py-2 !shadow-none sm:text-xl sm:border-black"
                      varient="light"
                    >
                      <CiLogin size={20} />
                      Student Login
                    </Button>
                  </div>
                </OpenDialogButton>
              )}
            </li>
          </ul>
        </nav>

        <CgMenu
          onClick={() => setMobileNevVisibility(true)}
          className="hidden sm:block"
          size={30}
        />
      </header>
    </div>
  );
}
