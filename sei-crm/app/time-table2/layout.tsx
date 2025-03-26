import Header from "@/components/Header";
import IsAuthenticated from "@/components/IsAuthenticated";
import React from "react";

interface Props {
  children: React.ReactNode;
}

export default function layout({ children }: Props) {
  return (
    <IsAuthenticated>
      <div className="h-screen w-full overflow-hidden">
        <div className="size-full bg-white rounded-lg overflow-y-auto overflow-hidden hide-scrollbar flex flex-col">
          <Header />
          {children}
        </div>
      </div>
    </IsAuthenticated>
  );
}
