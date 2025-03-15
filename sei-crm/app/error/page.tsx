import Button from "@/components/Button";
import Page403 from "@/components/Pages/403";
import UnAuthPage from "@/components/UnAuthPage";
import Link from "next/link";
import React from "react";

interface IProps {
  searchParams: {
    status: string;
  };
}

export default function page({ searchParams }: IProps) {
  if (searchParams.status === "403") {
    return <Page403 />;
  } else if (searchParams.status === "401") {
    return <UnAuthPage />;
  } else {
    return (
      <div className="w-full flex items-center justify-center">
        <h2>Error {searchParams.status} </h2>
      </div>
    );
  }
}
