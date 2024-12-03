"use client";

import Image from "next/image";
import Link from "next/link";
import ChooseFileInput from "../components/ChooseFileInput";

import { upload } from "@vercel/blob/client";

export default function Test() {
  //   const fileInputRef = useRef<File | null>(null);

  const handleFilePicked = async (file: File) => {
    const blob = await upload(file.name, file, {
      access: "public",
      onUploadProgress: ({ loaded, percentage, total }) => {
        console.log(loaded, " >> ", percentage, " >> ", total);
      },
      handleUploadUrl: "http://localhost:8081/api/v1/student/upload", // Endpoint on your server
    });

    alert(blob.url);
  };

  return (
    <div>
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

      {/* <form onSubmit={handleFormSubmit} className="mx-auto max-w-96"> */}
      <div className="mx-auto max-w-96">
        <ChooseFileInput
          onFilePicked={handleFilePicked}
          id="voter_card"
          label="Pick File"
          name="voter_card"
        />
      </div>
      {/* <button>UPLOAD</button> */}
      {/* </form> */}
    </div>
  );
}
