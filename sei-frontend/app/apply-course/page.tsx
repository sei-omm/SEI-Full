import ApplyCourseForm from "@/app/components/ApplyCourseForm";
import IsAuthenticated from "@/app/components/IsAuthenticated";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default async function page() {
  return (
    <IsAuthenticated>
      <div className="w-full h-[60vh] relative overflow-hidden">
        <Image
          className="size-full object-cover"
          src={"/images/Banners/CoursesBanner.jpg"}
          alt="Courses Banner"
          height={1200}
          width={1200}
        />

        <div className="absolute inset-0 size-full bg-[#000000bb]">
          <div className="main-layout size-full flex-center flex-col">
            <h1 className="tracking-wider text-gray-100 text-4xl font-semibold uppercase">
              Apply Course
            </h1>
            <span className="text-background">
              <Link href={"/"}>Home</Link>
              <span> / </span>
              <Link href={"/apply-course/"}>Apply Course</Link>
            </span>
          </div>
        </div>
      </div>

      <Suspense fallback = {<h5>Loading...</h5>}>
        <ApplyCourseForm />
      </Suspense>
    </IsAuthenticated>
  );
}
