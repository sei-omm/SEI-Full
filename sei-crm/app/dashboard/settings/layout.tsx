import React from "react";

interface IProps {
  children: React.ReactNode;
}

export default function layout({ children }: IProps) {
  return (
    <div className="px-6 py-3">
      {children}
    </div>
  );
}
