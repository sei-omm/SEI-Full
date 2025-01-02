"use client";

import { usePathname } from "next/navigation";
import { useScrollChecker } from "../hooks/useScrollChecker";

interface IProps {
  children: React.ReactNode;
}

export default function MobileNavigationHolder({ children }: IProps) {
  const {  scrollingDirection } = useScrollChecker();
  const pathname = usePathname();

  if (pathname.includes("view-file")) return <></>;

  return (
    <div
      style={{
        translate: `0% ${scrollingDirection === "DOWN" ? "100%" : "0%"}`,
      }}
      className={`w-full hidden sm:block fixed bottom-0 z-50 transition-all duration-500`}
    >
      {children}
    </div>
  );
}
