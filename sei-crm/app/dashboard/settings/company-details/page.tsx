import Button from "@/components/Button";
import Input from "@/components/Input";
import Image from "next/image";
import React from "react";

export default function page() {
  return (
    <div className="size-full py-5">
      <form action="" className="space-y-7">
        <div className="flex items-start gap-x-4 h-28">
          {/* Logo Div */}

          <div className="size-28 bg-gray-200 p-3 rounded-lg">
            <Image
              className="size-full object-contain"
              src="/icon.webp"
              alt="Logo"
              height={512}
              width={512}
            />
          </div>

          <div className="flex flex-col justify-between h-full">
            <h2 className="font-semibold">Company Logo</h2>
            <p className="text-sm">
              The proposed size 350px * 180px no bigger then 2.5mb
            </p>

            <div className="space-x-3">
              <input hidden type="file" />
              <Button type="button">Change Logo</Button>
              <Button className="!bg-transparent !text-black border border-black">
                Remove Logo
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          <Input label="Company Name" placeholder="Omm Digital Soluction" />
          <Input
            type="email"
            label="Company Email"
            placeholder="ommdigitalsoluction@gmail.com"
          />
          <Input label="Company Number" placeholder="7845878784" />

          <Input
            label="Company Address"
            placeholder="3/3, Swami Vivekananda Rd, Vivekananda Pally, Bapuji Colony, Nagerbazar, Dum Dum, Kolkata, West Bengal 700074"
          />
          <Input
            label="Company Website"
            placeholder="https://ommdigitalsolution.com/"
          />

          {/* <Input
            label="Company GST Number"
            placeholder="8787 8787 7878 7874"
          />

          <Input
            label="Company Whatsapp"
            placeholder="https://www.whatsapp.com"
          />
          <Input
            label="Company Facebook"
            placeholder="https://www.facebook.com"
          />
          <Input
            label="Company Linkedin"
            placeholder="https://www.linkedin.com"
          />
          <Input label="Company X Account" placeholder="https://www.x.com" /> */}
        </div>

        <Button className="min-w-48">Save Details</Button>
      </form>
    </div>
  );
}
