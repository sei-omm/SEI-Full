"use client";

import { useIsAuthenticated } from "@/app/hooks/useIsAuthenticated";
import Button from "./Button";
import Link from "next/link";
import LoadingLayout from "./LoadingLayout";

interface IProps {
  children: React.ReactNode;
}

export default function IsAuthenticated({ children }: IProps) {
  const { isAuthenticated } = useIsAuthenticated();

  if (isAuthenticated === null) {
    return <LoadingLayout />;
  }

  if (isAuthenticated !== null && isAuthenticated === false) {
    return (
      <div className="w-full">
        <div className="flex-center flex-col h-full p-10 gap-3">
          <h2 className="font-semibold text-5xl">
            You Are{" "}
            <span className="text-gray-600 border-2 border-black p-1">
              Not Authenticated
            </span>
            {/* text-[#e9b858] */}
          </h2>
          <p className="text-[#4b4231] space-y-3">
            Please Make Sure You Loged In With Your Valid Account
          </p>
          <Link href={"/auth/login"}>
            <Button className="!bg-[#e9b858] border !border-gray-400 !text-black !py-2 active:scale-90">
              Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
