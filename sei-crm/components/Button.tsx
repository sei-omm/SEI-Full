import React from "react";
import Spinner from "./Spinner";

type ButtonType = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

interface IProps extends ButtonType {
  loading?: boolean;
  onLoadingRemoveContent?: boolean;
  spinnerSize?: string;
}

export default function Button(props: IProps) {
  return (
    <button
      {...props}
      className={`bg-foreground text-background tracking-wider rounded-lg px-6 py-[0.60rem] shadow-md text-sm ${
        props.disabled ? "opacity-40 cursor-not-allowed" : "opacity-100 active:scale-95"
      } ${props.className}`}
    >
      {props.loading ? (
        <div className="flex items-center gap-3">
          <Spinner size={props.spinnerSize ? props.spinnerSize : "20px"} />
          {props.onLoadingRemoveContent ? null : props.children}
        </div>
      ) : (
        props.children
      )}
    </button>
  );
}
