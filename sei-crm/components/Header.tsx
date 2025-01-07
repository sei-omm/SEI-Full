"use client";

import { useIsAuthenticated } from "@/app/hooks/useIsAuthenticated";
import Image from "next/image";
import { CiLogout } from "react-icons/ci";
import Spinner from "./Spinner";
import Notification from "./Notification";
import { MdOutlineAccountCircle } from "react-icons/md";
import Link from "next/link";
import { useLogout } from "@/hooks/useLogout";

export default function Header() {
  const { userInfo } = useIsAuthenticated();
  const { isPending, handleLogoutBtn } = useLogout();

  return (
    <header className="w-full flex justify-between items-center border-b border-[#c4c4c44f] py-3 px-6">
      <h1 className="font-semibold text-2xl">
        Welcome, {userInfo?.name || "User"}
      </h1>
      <div className="flex items-center gap-8">
        <Notification />
        <div className="relative group/profile">
          <div className="size-10 bg-[#002649] rounded-[50%] border-2 border-emerald-400 cursor-pointer overflow-hidden">
            <Image
              className="size-full object-cover"
              src={
                userInfo?.profile_image && userInfo.profile_image !== "null"
                  ? userInfo.profile_image
                  : "/employee-sample.jpg"
              }
              alt="User icon"
              height={100}
              width={100}
              quality={100}
            />
          </div>

          <div className="absolute right-0 invisible translate-y-10 opacity-0 group-hover/profile:visible group-hover/profile:translate-y-0 group-hover/profile:opacity-100 transition-all duration-300">
            <ul className="card-shdow relative border right-5 z-10 top-1 bg-white min-w-40">
              <li className="cursor-pointer hover:bg-slate-200">
                <Link
                  href={"/account?tab=informations"}
                  className="flex items-center gap-2 p-2"
                >
                  <MdOutlineAccountCircle />
                  <span className="text-sm font-semibold">My Account</span>
                </Link>
              </li>
              <li
                onClick={handleLogoutBtn}
                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-200"
              >
                {isPending ? (
                  <Spinner size="12px" />
                ) : (
                  <CiLogout className="rotate-180" />
                )}

                <span className="text-sm font-semibold">Logout</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
