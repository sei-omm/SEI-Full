import React from "react";
import dynamic from "next/dynamic";

const Blogs = dynamic(() => import("@/components/Pages/Blogs"), { ssr: false });

export default function BlogList() {
  return <Blogs />;
}
