import dynamic from "next/dynamic";
import React from "react";

const ManageBlog = dynamic(() => import("@/components/Pages/ManageBlog"), {
  ssr: false,
});

interface IProps {
  params: {
    blog_id: number | "add"
  };
}

export default function page({ params }: IProps) {
  return <ManageBlog blog_id={params.blog_id} />;
}
