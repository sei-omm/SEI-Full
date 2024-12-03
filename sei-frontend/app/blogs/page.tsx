import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <div className="w-full">
      <div className="w-full h-[60vh] relative overflow-hidden">
        <Image
          className="size-full object-cover"
          src={"/images/Banners/blogs.jpg"}
          alt="Courses Banner"
          height={1200}
          width={1200}
        />

        <div className="absolute inset-0 size-full bg-[#000000bb]">
          <div className="main-layout size-full flex-center flex-col">
            <h1 className="tracking-wider text-gray-100 text-4xl font-semibold uppercase">
              Our Blogs
            </h1>
            <span className="text-background">
              <Link href={"/"}>Home</Link>
              <span> / </span>
              <Link href={"/blogs"}>Blogs</Link>
            </span>
          </div>
        </div>
      </div>

      <div className="main-layout">
        <div className="flex flex-col gap-y-2 pt-10">
          <h2 className="text-5xl font-semibold">
            Our latest <span className="text-[#e9b858]">Blogs</span>
          </h2>
          <h3 className="max-w-[40rem] sm:max-w-full">
            Read the latest and greatest from our experts
          </h3>
        </div>

        {/* Blog List */}
        <ul className="w-full grid grid-cols-3 py-10 gap-10 sm:grid-cols-1 md:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((blog) => (
            <li key={blog}>
              <article>
                <Link className="space-y-2" href={"/blogs/8-productivity-apps-for-your-marketing-team"}>
                  <div className="w-full aspect-video relative">
                    <Image
                      className="size-full object-cover"
                      src={"/images/About/bords_images.jpg"}
                      alt="Blog Artical"
                      height={1200}
                      width={1200}
                    />
                    <div className="absolute inset-0 fade-to-top-yellow-color"></div>
                  </div>
                  <h2 className="text-3xl font-[500] text-foreground">
                    8 productivity apps for your marketing team
                  </h2>
                  <p className="font-semibold text-gray-500">
                    Somnath | January 14, 2022
                  </p>
                  <span className="block">
                    Read More »
                  </span>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
