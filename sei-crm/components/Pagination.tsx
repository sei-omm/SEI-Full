"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { MdOutlineSkipNext } from "react-icons/md";
import Button from "./Button";

interface IProps {
  className?: string;
  dataLength?: number;
}

export default function Pagination({ className, dataLength }: IProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  function handlePagination(type: "next" | "prev") {
    const urlSearchParams = new URLSearchParams(searchParams);

    const prevPage = parseInt(urlSearchParams.get("page") || "1");

    urlSearchParams.set(
      "page",
      type === "next" ? (prevPage + 1).toString() : (prevPage - 1).toString()
    );

    router.push(`${pathname}?${urlSearchParams.toString()}`);
  }

  const currentPage = searchParams.get("page") || "1";
  return (
    <div
      className={`w-full flex items-center justify-end gap-4 mt-5 ${className}`}
    >
      <Button
        onClick={() => handlePagination("prev")}
        className={`${
          currentPage === "1" ? "hidden" : "flex items-center justify-center"
        }`}
      >
        <MdOutlineSkipNext size={20} className="rotate-180" />
      </Button>
      <Button
        title="Next Page"
        disabled={dataLength === 0 || !dataLength || dataLength < 10}
        onClick={() => handlePagination("next")}
        className="flex-center"
      >
        <MdOutlineSkipNext size={20} />
      </Button>
    </div>
  );
}
