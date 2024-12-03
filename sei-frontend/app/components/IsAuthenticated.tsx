"use client";

import { useIsAuthenticated } from "../hooks/useIsAuthenticated";
import { useDispatch } from "react-redux";
import { setDialog } from "../redux/slice/dialog.slice";
import Image from "next/image";
import Button from "./Button";
import OpenDialogButton from "./OpenDialogButton";

interface IProps {
  children: React.ReactNode;
}

export default function IsAuthenticated({ children }: IProps) {
  const { isAuthenticated } = useIsAuthenticated();
  const dispatch = useDispatch();

  if (isAuthenticated !== null && isAuthenticated === false) {
    dispatch(setDialog({ dialogKey: "student-login-dialog", type: "OPEN" }));
    return (
      <div className="w-full">
        <div className="w-full h-[60vh] relative overflow-hidden">
          <Image
            className="size-full object-cover"
            src={"/images/Banners/un-auth.jpg"}
            alt="Courses Banner"
            height={1200}
            width={1200}
          />

          <div className="absolute inset-0 size-full bg-[#000000bb]">
            <div className="main-layout size-full flex-center flex-col">
              <h1 className="tracking-wider text-gray-100 text-4xl font-semibold uppercase">
                Un Authorized
              </h1>

              <span className="text-background">
                Please Do Login / Singup to access this page
                {/* <Link href={"/"}>Home</Link>
              <span> / </span>
              <Link href={"/account"}>My Account</Link> */}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-center flex-col h-full p-10 gap-3">
          <h2 className="font-semibold text-5xl">
            You Are <span className="text-[#e9b858]">Not Authenticated</span>
          </h2>
          <p className="text-[#4b4231] space-y-3">
            Please Make Sure You Have An Account Or You Loged In With Your Valid
            Account
          </p>

          <div className="flex items-center gap-6 mt-6">
            <OpenDialogButton type="OPEN" dialogKey="student-login-dialog">
              <Button
                className="!bg-[#e9b858] border !border-gray-400 !text-black !py-2 active:scale-90"
                varient="default"
              >
                Login
              </Button>
            </OpenDialogButton>
            <span>OR</span>
            <OpenDialogButton type="OPEN" dialogKey="student-register-dialog">
              <Button
                className="border !border-gray-400 !text-black !py-2 active:scale-90"
                varient="default"
              >
                Register
              </Button>
            </OpenDialogButton>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
