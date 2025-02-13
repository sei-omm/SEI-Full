import GetTranningActivity from "@/components/Tranning/GetTranningActivity";
import TranningGenerate from "@/components/Tranning/TranningGenerate";
import React from "react";

export default function page() {
  return (
    <div className="space-y-5">
      <TranningGenerate />
      <GetTranningActivity />
    </div>
  );
}
