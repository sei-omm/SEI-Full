"use client";

import { BASE_API } from "@/app/constant";
import { useIsAuthenticated } from "@/app/hooks/useIsAuthenticated";
import { removeInfo } from "@/app/utils/saveInfo";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CiLogout } from "react-icons/ci";
import Spinner from "./Spinner";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";

export default function Header() {
  const [isPending, startTransition] = useTransition();
  const dispatch = useDispatch();

  const { userInfo } = useIsAuthenticated();
  const route = useRouter();

  function handleLogoutBtn() {
    //remove user and send him to login page
    dispatch(setDialog({ type: "OPEN", dialogId: "progress-dialog" }));
    startTransition(async () => {
      await removeInfo("login-token");
      await removeInfo("employee-info");
      dispatch(setDialog({ type: "CLOSE", dialogId: "progress-dialog" }));
      route.push("/auth/login");
    });
  }

  return (
    <header className="w-full flex justify-between items-center border-b border-[#c4c4c44f] py-3 px-6">
      <h1 className="font-semibold text-2xl">
        Welcome, {userInfo?.name || "User"}
      </h1>
      <div className="relative group/profile">
        <div className="size-10 bg-[#002649] rounded-[50%] border-2 border-emerald-400 cursor-pointer overflow-hidden">
          <Image
            className="size-full object-cover"
            src={
              userInfo?.profile_image && userInfo.profile_image !== "null"
                ? BASE_API + "/" + userInfo.profile_image
                : "/employee-sample.jpg"
            }
            alt="User icon"
            height={100}
            width={100}
            quality={100}
          />
        </div>

        <div className="absolute right-0 invisible translate-y-10 opacity-0 group-hover/profile:visible group-hover/profile:translate-y-0 group-hover/profile:opacity-100 transition-all duration-300">
          <div className="card-shdow relative border right-5 z-10 top-1 bg-white">
            <div
              onClick={handleLogoutBtn}
              className="flex-center gap-2 cursor-pointer p-2"
            >
              {isPending ? (
                <Spinner size="12px" />
              ) : (
                <CiLogout className="rotate-180" />
              )}

              <span className="text-sm font-semibold">Logout</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
