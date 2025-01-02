"use client";

import { CiLogout } from "react-icons/ci";
import SpinnerSvg from "../SpinnerSvg";
import { useDoLogout } from "@/app/hooks/useDoLogout";

export default function ProfileLogoutBtn() {
  const { logout, isLogouting } = useDoLogout();

  return (
    <button
      onClick={logout}
      disabled={isLogouting}
      className={`flex items-center active:scale-90 gap-2 border py-1 px-5 !border-gray-500 rounded-full ${
        isLogouting ? "opacity-50" : "opacity-100"
      }`}
    >
      {isLogouting ? <SpinnerSvg size="20px" /> : null}

      <span>Logout</span>
      <CiLogout className="rotate-180" />
    </button>
  );
}
