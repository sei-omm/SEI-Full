"use client";

import SpinnerSvg from "./SpinnerSvg";

interface IProps {
  children: React.ReactNode;
  isLoading: boolean;
  error?: any;
  dataLength?: number;
}

export default function HandleLoading({
  children,
  isLoading,
  error,
  dataLength,
}: IProps) {
  if (isLoading)
    return (
      <div className="flex-center size-full">
        <SpinnerSvg size="25px" />
      </div>
    );

  if (error) return <h2 className="text-lg text-center">{error.toString()}</h2>;
  if (dataLength === 0)
    return <h2 className="text-lg text-center">No Data Found</h2>;

  return children;
}
