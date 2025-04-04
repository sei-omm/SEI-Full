"use client";

import React, { useEffect, useRef, useState } from "react";
import Editor from "../Editor";
import Input from "../Input";
import ChooseFileInput from "../ChooseFileInput";
import { InfoLayout } from "../Account/InfoLayout";
import TextArea from "../TextArea";
import Button from "../Button";
import DropDown from "../DropDown";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { useRouter } from "next/navigation";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { ISuccess } from "@/types";
import HandleSuspence from "../HandleSuspence";
import { getFileName } from "@/app/utils/getFileName";
import BackBtn from "../BackBtn";
import { createSlug } from "@/app/utils/createSlug";

interface IProps {
  blog_id: number | "add";
}

async function fetchSingleBlog(blogId: number) {
  return (await axios.get(`${BASE_API}/website/blogs/${blogId}`)).data;
}

interface BlogPost {
  blog_id: number;
  heading: string;
  blog_content: string;
  thumbnail: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  meta_canonical_url: string;
  created_at: string; // You might also consider using Date if you want to work with date objects
  visible: boolean;
  thumbnail_alt_tag: string;
  slug: string;
}

export default function ManageBlog({ blog_id }: IProps) {
  const isNew = blog_id === "add";

  const blogContentRef = useRef<string>("");
  const routes = useRouter();

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--ckeditor5-preview-height",
      "850px"
    );
  }, []);

  const [slug, setSlug] = useState("");

  const { data, isFetching, error } = useQuery<ISuccess<BlogPost>>({
    queryKey: ["blog", blog_id],
    queryFn: () => fetchSingleBlog(blog_id as number),
    onSuccess(data) {
      setSlug(createSlug(data.data.heading));
    },
    enabled: !isNew,
  });

  const { isLoading, mutate } = useDoMutation();
  const handleManageBlog = (formData: FormData) => {
    formData.set(`blog_content`, blogContentRef.current);
    if (isNew) {
      mutate({
        apiPath: "/website/blogs",
        method: "post",
        formData,
        onSuccess() {
          routes.push(
            `/dashboard/website-management/blogs?code=${Math.floor(
              Math.random() * 100
            )}`
          );
        },
      });
      return;
    }

    formData.set(
      `blog_content`,
      blogContentRef.current === ""
        ? (data?.data.blog_content as string)
        : blogContentRef.current
    );

    formData.set(
      "thumbnail",
      formData.get("thumbnail") || (data?.data.thumbnail as any)
    );

    mutate({
      apiPath: "/website/blogs",
      method: "put",
      formData,
      id: blog_id as number,
      onSuccess() {
        routes.push(
          `/dashboard/website-management/blogs?code=${Math.random() * 100}`
        );
      },
    });
  };

  return (
    <div key={blog_id}>
      <HandleSuspence isLoading={isFetching} error={error} dataLength={1}>
        <form action={handleManageBlog} className="space-y-5">
          <InfoLayout className="w-full space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <ChooseFileInput
                name="thumbnail"
                id="choose_thumbnail"
                label="Choose Blog Thumbnail *"
                fileName={
                  getFileName(data?.data.thumbnail) || "Choose Blog Thumbnail"
                }
                accept="image/*"
                viewLink={data?.data.thumbnail}
              />

              <div className="mt-2">
                <Input
                  name="thumbnail_alt_tag"
                  label="Thumbnail Alt Tag"
                  placeholder="Enter Alt Tag"
                  defaultValue={data?.data.thumbnail_alt_tag}
                />
              </div>

              <Input
                onBlur={(e) => {
                  setSlug(createSlug(e.currentTarget.value));
                }}
                required
                name="heading"
                placeholder="Type Your Blog Heading"
                label="Blog Heading *"
                defaultValue={data?.data.heading}
              />
              <Input
                key={slug}
                required
                name="slug"
                placeholder="Type Blog Slug"
                label="Blog Slug"
                defaultValue={slug}
              />
            </div>

            <Editor
              storageFolderName="blogs"
              label="Blog Content *"
              textEditorContentRef={blogContentRef}
              defaultValue={data?.data.blog_content}
            />
          </InfoLayout>

          <InfoLayout className="w-full space-y-3">
            <h2 className="font-semibold text-xl">Blog Meta Info</h2>
            <div className="space-y-3">
              <Input
                label="Blog Meta Title"
                name="meta_title"
                placeholder="Type Blog Meta Title"
                defaultValue={data?.data.meta_title}
              />
              <TextArea
                label="Blog Meta Description"
                name="meta_description"
                placeholder="Type Blog Meta Description"
                defaultValue={data?.data.meta_description}
              />
              <Input
                label="Blog Keywords"
                name="meta_keywords"
                placeholder="Keyword 1, Keyword 2, Keyword 3"
                defaultValue={data?.data.meta_keywords}
              />
              <Input
                label="Canonical Url"
                name="meta_canonical_url"
                placeholder="https://www.seiedutrust.com"
                defaultValue={data?.data.meta_canonical_url}
              />
            </div>
          </InfoLayout>

          <InfoLayout className="w-full space-y-3">
            <h2 className="font-semibold text-xl">Settings</h2>
            <DropDown
              name="visible"
              label="Blog Visibility *"
              options={[
                { text: "Public", value: true },
                { text: "Private", value: false },
              ]}
              defaultValue={data?.data.visible}
            />
          </InfoLayout>
          <div className="flex items-center gap-5">
            <BackBtn />
            <Button loading={isLoading} disabled={isLoading}>
              {isNew ? "Upload Blog" : "Update Blog"}
            </Button>
          </div>
        </form>
      </HandleSuspence>
    </div>
  );
}
