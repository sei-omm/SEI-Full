import Image from "next/image";
import Link from "next/link";

interface IProps {
  children: React.ReactNode;
}

export default function layout({ children }: IProps) {
  return (
    <div>
      <div className="w-full h-[60vh] relative overflow-hidden">
        <Image
          className="size-full object-cover"
          src={"/images/Banners/LoginPageBanner.jpg"}
          alt="Contact Us Banner"
          height={1200}
          width={1200}
        />

        <div className="absolute inset-0 size-full bg-[#000000a6]">
          <div className="main-layout size-full flex-center flex-col">
            <h1 className="tracking-wider text-gray-100 text-4xl font-semibold uppercase">
              My Account
            </h1>
            <span className="text-background">
              <Link href={"/"}>Home</Link>
              <span> / </span>
              <Link href={"/my-account"}>My Account</Link>
            </span>
          </div>
        </div>
      </div>

      <div className="w-full main-layout py-10">{children}</div>
    </div>
  );
}
