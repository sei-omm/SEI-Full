"use client";

import { usePathname } from "next/navigation";
import { useScrollChecker } from "../hooks/useScrollChecker";

interface IProps {
  children: React.ReactNode;
}

export default function HeaderHolder({ children }: IProps) {
  const { isScrolling, scrollingDirection } = useScrollChecker();
  const pathname = usePathname();

  return (
    <div
      style={{
        translate: `0% ${scrollingDirection === "DOWN" ? "-100%" : "0%"}`,
      }}
      className={`w-full fixed z-50 ${
        isScrolling
          ? "bg-[#7c7c62a9] backdrop-blur-xl text-white"
          : `bg-transparent text-white ${
              pathname === "/" ? "mt-11 sm:mt-[4.5rem]" : ""
            }`
      } transition-all duration-500`}
    >
      {children}
    </div>
  );
}
