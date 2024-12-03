"use client";

import Input from "../Input";
import Image from "next/image";
import Button from "../Button";
import { useState } from "react";

export default function UserDetails() {
  // const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const onFilePicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const pickedFile = event.target.files![0];
    // setFile(pickedFile);

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(pickedFile);
  };

  return (
    <div className="mt-5">
      <div className="flex items-start pb-5">
        <div className="size-28">
          <div className="size-28 bg-slate-200 rounded-xl shadow-lg overflow-hidden">
            <Image
              className="size-full object-cover"
              src={image || "/images/studient-icon.jpg"}
              alt="Student Profile Image"
              height={1200}
              width={1200}
            />
            <input
              onChange={onFilePicked}
              accept="image/*"
              id="student-profile-image-picker"
              hidden
              type="file"
            />
          </div>
        </div>
        <div className="px-5 *:block space-y-2">
          <span className="font-medium text-xl">Student Image</span>
          <span>The proposed size 350px * 180px no bigger then 2.5mb</span>

          <div className="flex items-center gap-x-5 w-full">
            {!image ? null : (
              <Button className="!bg-foreground !py-2 !min-w-28 !text-sm">
                Upload
              </Button>
            )}
            <Button className="!bg-foreground !py-2 !min-w-28 !text-sm">
              <label htmlFor="student-profile-image-picker">Change Image</label>
            </Button>
          </div>
        </div>
      </div>
      <form className="grid grid-cols-2 gap-5 sm:grid-cols-1">
        <Input
          className="!rounded-md"
          label="Your name"
          placeholder="Somnath Gupta"
        />
        <Input
          className="!rounded-md"
          label="Your Email"
          placeholder="somnathgupta@gmail.com"
        />
        <Input
          type="date"
          className="!rounded-md"
          label="Your Date Of Birth"
          placeholder="Somnath Gupta"
        />
        <Input
          type="text"
          className="!rounded-md"
          label="Your Mobile Number"
          placeholder="8784589878"
        />

        <Button className="!bg-[#E9B858] !text-foreground !border-none !w-60">
          Update Details
        </Button>
      </form>
    </div>
  );
}
