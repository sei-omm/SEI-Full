import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import LoadingLayout from "@/components/LoadingLayout";

const AccountClient = dynamic(() => import("@/components/Pages/Account"), {
  ssr: false,
});

export default function page() {
  return (
    <Suspense fallback={<LoadingLayout />}>
      <AccountClient />
    </Suspense>
  );
}
