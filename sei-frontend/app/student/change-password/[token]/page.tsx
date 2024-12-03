import ChangePasswordForm from "@/app/components/ChangePasswordForm";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface IProps {
  params: {
    token: string;
  };
}

export default function page({ params }: IProps) {
  return (
    <section>
      <div className="w-full h-[60vh] relative overflow-hidden">
        <Image
          className="size-full object-cover"
          src={"/images/Banners/reset-password.jpg"}
          alt="Career Page Banner"
          height={1200}
          width={1200}
        />

        <div className="absolute inset-0 size-full bg-[#000000d2]">
          <div className="main-layout size-full flex-center flex-col">
            <h1 className="tracking-wider text-gray-100 text-4xl text-center font-semibold uppercase">
              Change Password
            </h1>

            <span className="text-background">
              <Link href={"/"}>Home</Link>
              <span> / </span>
              <Link href={"/student/change-password"}>Change Password</Link>
            </span>
          </div>
        </div>
      </div>

      <ChangePasswordForm token={params.token} />
    </section>
  );
}
