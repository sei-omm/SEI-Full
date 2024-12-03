import React from "react";
import SpinnerSvg from "./SpinnerSvg";

type BtnType = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

interface IProps extends BtnType {
  varient?: "light" | "default" | "new-default";
  isLoading?: boolean;
  spinnerSize?: string;
}

export default function Button(props: IProps) {
  return (
    <button
      {...props}
      className={`${
        props.varient === "light"
          ? "bg-white text-black hover:bg-transparent hover:text-white border border-white"
          : props.varient === "new-default"
          ? "bg-[#E9B858] !text-foreground border !border-gray-400"
          : "bg-transparent text-white hover:bg-white hover:text-black border border-white"
      } rounded-full min-w-48 flex-center gap-x-3 py-[0.70rem] shadow-xl transition-all hover:duration-300 hover:delay-0 relative ${
        props.className
      }`}
    >
      {props.isLoading && props.isLoading === true ? (
        <SpinnerSvg size={props.spinnerSize ?? "23px"} />
      ) : (
        props.children
      )}
    </button>
  );
}
