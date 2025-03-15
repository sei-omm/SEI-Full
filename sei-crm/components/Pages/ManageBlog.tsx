"use client";

import React from "react";

interface IProps {
  blog_id: number | "add";
}

export default function ManageBlog({ blog_id }: IProps) {
  const isNew = blog_id === "add";
  
  return <div>ManageBlog {blog_id}</div>;
}
