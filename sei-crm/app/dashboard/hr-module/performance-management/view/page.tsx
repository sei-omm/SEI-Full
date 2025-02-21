"use client";

import AppraisalForm from "@/components/Account/AppraisalForm";
import React from "react";

export default function ViewAppraisal() {
  return (
    <section className="w-full space-y-5">
      <AppraisalForm wrapperClassName="!w-[100%]" />
    </section>
  );
}
