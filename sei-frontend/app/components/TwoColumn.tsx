import React from "react";

interface IProps {
  columnOne: React.ReactNode;
  columnTwo: React.ReactNode;
}

export default function TwoColumn({ columnOne, columnTwo }: IProps) {
  return (
    <div className="grid grid-cols-2 gap-10 sm:grid-cols-1 md:grid-cols-1">
      <div className="size-full">{columnOne}</div>
      <div className="size-full">{columnTwo}</div>
    </div>
  );
}
