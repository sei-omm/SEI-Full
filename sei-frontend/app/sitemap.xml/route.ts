// app/sitemap.xml/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BASE_API } from "../constant";
import { IResponse } from "../type";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { nextUrl } = req;

  // Build full site URL from request
  const siteUrl = `${nextUrl.protocol}//${nextUrl.host}`;

  // You can dynamically fetch your pages/posts here
  const staticRoutes = [
    "/",
    "/about-us",
    "/our-centers",
    "/our-courses/kolkata",
    "/our-courses/faridabad",
    "/career",
    "/blogs",
  ]; // Add your static routes

  const response = await fetch(`${BASE_API}/website/blogs/slug`);
  const dynamicRoutes: string[] = [];
  if (response.ok) {
    try {
      const data = (await response.json()) as IResponse<{ slug: string }[]>;
      data.data.forEach((item) => {
        dynamicRoutes.push(`/blogs/${item.slug}`);
      });
    } catch {}
  }

  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${allRoutes
      .map((route) => {
        return `
        <url>
          <loc>${siteUrl}${route}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
        </url>`;
      })
      .join("")}
  </urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
