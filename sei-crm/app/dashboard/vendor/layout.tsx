import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-5">{children}</div>;
}
