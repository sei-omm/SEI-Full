import { BASE_API } from "@/app/constant";
import React from "react";

interface IProps {
  params : {
    file_name : string;
  }
}

export default function page({ params } : IProps) {
  return (
    <div className="min-h-screen">
      <iframe
        className="w-full min-h-screen"
        src={`${BASE_API}/library/view-file/${params.file_name}`}
      ></iframe>
    </div>
  );
}
