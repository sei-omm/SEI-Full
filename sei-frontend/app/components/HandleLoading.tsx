"use client";

import SpinnerSvg from "./SpinnerSvg";

interface IProps {
  children: React.ReactNode;
  isLoading: boolean;
}

export default function HandleLoading({ children, isLoading }: IProps) {
  return isLoading ? (
    <div className="flex-center size-full">
      <SpinnerSvg size="25px" />
    </div>
  ) : (
    children
  );
}
