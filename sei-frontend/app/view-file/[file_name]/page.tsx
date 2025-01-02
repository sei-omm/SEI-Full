import { BASE_API } from "@/app/constant";
import React from "react";

interface IProps {
  params: {
    file_name: string;
  };
}

export default async function page({ params }: IProps) {

  // const AUTH_TOKEN_HEADER = 

  // const response = await fetch(BASE_API + "/library/generate-link", {
  //   headers : {
  //     ...getAu
  //   }
  // });

  return (
    <div className="min-h-screen">
      <iframe
        className="w-full min-h-screen"
        src={`${BASE_API}/library/view-file/${params.file_name}`}
        sandbox="allow-same-origin allow-credentials allow-scripts allow-forms"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
}
