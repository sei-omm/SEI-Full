"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BreadCrumb() {
  const pathname = usePathname();
  // -> /dashboard/hr-module/job-posting

  let previousPath = "";

  return (
    <>
      <h1 className="text-sm font-semibold text-gray-500 space-x-2">
        {pathname.split("/").map((path, index) => {
          if (path === "") return null;
          previousPath += "/" + path;

          return (
            <>
              <Link
                key={path}
                className="capitalize"
                href={`http://localhost:3000${previousPath}`}
              >
                {path}
              </Link>
              {index != pathname.split("/").length - 1 ? <span>/</span> : null}
            </>
          );
        })}
        {/* <Link href={"/dashboard"}>Dashboard</Link> <span>/</span>{" "}
        <Link href={"/dashboard/hr-module"}>HR-Module</Link> <span>/</span>
        <span>Job-Posting</span> */}
      </h1>
    </>
  );
}
