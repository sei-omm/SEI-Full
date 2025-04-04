"use client";

import React from "react";
import { InfoLayout } from "../Account/InfoLayout";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { ISuccess } from "@/types";
import HandleSuspence from "../HandleSuspence";
import Image from "next/image";
import { MdOutlineDateRange } from "react-icons/md";
import { HiOutlineGlobeAlt } from "react-icons/hi";
import { CiEdit } from "react-icons/ci";
import Link from "next/link";
import Button from "../Button";
import Pagination from "../Pagination";

interface BlogList {
  blog_id: number;
  heading: string;
  meta_description: string;
  meta_keywords: string;
  created_at: string; // ISO 8601 format
  thumbnail: string; // URL string
  visible: boolean;
  thumbnail_alt_tag: string;
  slug : string;
}

async function getBlogsList() {
  return (await axios.get(`${BASE_API}/website/blogs`)).data;
}

export default function Blogs() {
  const { data, error, isFetching } = useQuery<ISuccess<BlogList[]>>({
    queryKey: ["blog-list"],
    queryFn: getBlogsList,
    refetchOnMount: true,
  });

  return (
    <div className="space-y-5">
      <div className="w-full flex items-center">
        <h2 className="flex-1 font-semibold text-2xl">Blogs List</h2>

        <Link href={"blogs/add"}>
          <Button>Add New Blog</Button>
        </Link>
      </div>

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={data?.data.length}
        noDataMsg="No Blogs Found"
      >
        <ul className="w-full card">
          {data?.data.map((blog) => (
            <li key={blog.blog_id}>
              <InfoLayout className="w-full space-y-5 p-5">
                <div className="flex gap-4">
                  <div className="w-52 aspect-video overflow-hidden rounded-lg float-left">
                    <Image
                      className="size-fit"
                      src={blog.thumbnail}
                      alt={blog.thumbnail_alt_tag}
                      height={500}
                      width={500}
                    />
                  </div>
                  <div className="w-full">
                    <h2 className="font-semibold text-xl line-clamp-1">
                      {blog.heading}
                    </h2>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {blog.meta_description}
                    </p>
                    <div className="flex items-center gap-6 mt-2">
                      <p className="text-sm text-gray-500 flex items-center gap-1 underline">
                        <MdOutlineDateRange />
                        <span>25 Jun 2025</span>
                      </p>

                      <span
                        className={`font-semibold text-sm ${
                          blog.visible ? "text-green-800" : "text-red-800"
                        } underline flex items-center gap-1`}
                      >
                        <HiOutlineGlobeAlt />
                        {blog.visible ? "Public" : "Private"}
                      </span>

                      <div className="flex-1 flex items-center justify-end">
                        <Link href={"blogs/" + blog.blog_id}>
                          <CiEdit
                            size={18}
                            className="cursor-pointer active:scale-90"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </InfoLayout>
            </li>
          ))}
        </ul>
      </HandleSuspence>

      <Pagination dataLength={data?.data.length} />
    </div>
  );
}
