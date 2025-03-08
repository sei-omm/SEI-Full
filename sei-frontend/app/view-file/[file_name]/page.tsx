"use client";

import React from "react";
import PdfViewer from "@/app/components/PdfViewer";

interface IProps {
  params: {
    file_name: string;
  };
}

// const PdfViewer = dynamic(() => import('@/app/components/PdfViewer'), { ssr: false });

export default async function page({ params }: IProps) {
  return (
    <div className="min-h-screen">
      {/* <iframe
        className="w-full min-h-screen"
        src={`${BASE_API}/library/view-file/${params.file_name}`}
        allow="allow-same-origin; allow-scripts; allow-forms"
      ></iframe> */}
      <PdfViewer fileName={params.file_name} />
    </div>
  );
}
