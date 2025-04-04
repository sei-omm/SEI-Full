import { BASE_API } from "@/app/constant";
import { IResponse } from "@/app/type";
import { formateDate } from "@/app/utils/formateDate";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

interface IProps {
  params: {
    slug: string;
  };
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

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  const response = await fetch(`${BASE_API}/website/blogs/${params.slug}`, {
    cache: "no-store",
  });
  const blog = (await response.json()) as IResponse<BlogPost>;

  return {
    title: blog.data?.meta_title || "Default About Title",
    description: blog.data?.meta_description || "Default description",
    keywords: blog.data?.meta_keywords || "",
    alternates: {
      canonical: blog.data?.meta_canonical_url,
    },
  };
}

export default async function page({ params }: IProps) {
  const response = await fetch(`${BASE_API}/website/blogs/${params.slug}`, {
    cache: "no-store",
  });
  if (!response.ok) return notFound();

  const blog = (await response.json()) as IResponse<BlogPost>;

  return (
    <div>
      <div className="w-full h-[70vh] relative overflow-hidden">
        <Image
          className="size-full object-cover"
          src={blog.data.thumbnail}
          alt={blog.data.thumbnail_alt_tag}
          height={1200}
          width={1200}
        />

        <div className="absolute inset-0 size-full bg-[#000000d2]">
          <div className="main-layout size-full flex-center flex-col gap-y-2">
            <h1 className="tracking-wider text-gray-100 text-4xl font-semibold uppercase text-center">
              {blog.data.heading}
            </h1>
            <span className="text-background text-sm">
              SEI Education Trust | {formateDate(blog.data.created_at)}
            </span>
          </div>
        </div>
      </div>

      <article
        className="w-full main-layout prose py-10"
        dangerouslySetInnerHTML={{
          __html: blog.data.blog_content,
        }}
      ></article>
    </div>
  );
}
