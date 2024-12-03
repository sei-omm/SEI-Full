import { InputTypes } from "@/types";
import { LegacyRef } from "react";

interface IProps extends InputTypes {
  wrapperCss?: string;
  label?: string;
  hideLabel?: boolean;
  referal?: LegacyRef<HTMLInputElement>;
  defaultValue ? : any
}

export default function Input(props: IProps) {
  return (
    <div className={`${props.wrapperCss}`}>
      {props.hideLabel ? null : (
        <span className="block font-semibold text-sm pl-1 mb-[0.5rem]">{props.label}</span>
      )}

      <input
        type="text"
        {...props}
        ref={props.referal}
        className={`outline-none border-2 border-gray-200 placeholder:text-gray-400 rounded-lg w-full text-sm px-4 py-3 ${props.className}`}
      />
    </div>
  );
}
