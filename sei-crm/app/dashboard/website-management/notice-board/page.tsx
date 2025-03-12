import React from "react";
import dynamic from "next/dynamic";

const NoticeBoard = dynamic(() => import("@/components/Pages/NoticeBoard"), {
  ssr: false,
});

export default function NoticeBoardPage() {
  return (
    <div>
      <NoticeBoard />
    </div>
  );
}
