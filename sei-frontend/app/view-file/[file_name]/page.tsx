import { BASE_API } from "@/app/constant";
import React from "react";

interface IProps {
  params: {
    file_name: string;
  };
}

export default async function page({ params }: IProps) {
  return (
    <div className="min-h-screen">
      <iframe
        className="w-full min-h-screen"
        src={`${BASE_API}/library/view-file/${params.file_name}`}
        allow="allow-same-origin; allow-scripts; allow-forms"
      ></iframe>
    </div>
  );
}
