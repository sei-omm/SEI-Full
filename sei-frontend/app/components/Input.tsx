import React from "react";

type InputType = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

interface IProps extends InputType {
  label?: string;
  errorMsg?: string;
}

export default function Input(props: IProps) {
  return (
    <div className="w-full space-y-1">
      {props.label ? (
        <span className="inline-block font-medium">{props.label}</span>
      ) : null}

      <input
        {...props}
        className={`outline-none py-2 px-4 w-full border bg-[#e9b9582a] border-gray-400 ${props.className}`}
      />
      {props.errorMsg ? (
        <span className="inline-block text-red-500">{props.errorMsg}</span>
      ) : null}
    </div>
  );
}
