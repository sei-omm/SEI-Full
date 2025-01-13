import { InputTypes } from "@/types";
import { LegacyRef } from "react";

interface IProps extends InputTypes {
  wrapperCss?: string;
  label?: string;
  hideLabel?: boolean;
  referal?: LegacyRef<HTMLInputElement>;
  defaultValue?: any;
  moneyInput?: boolean;
  viewOnly?: boolean;
  viewOnlyText?: string;
}

export default function Input(props: IProps) {
  return (
    <div className={`${props.wrapperCss}`}>
      {props.hideLabel ? null : (
        <span className="block font-semibold text-sm pl-1 mb-[0.5rem]">
          {props.label}
        </span>
      )}

      <div className={`w-full flex items-center gap-[2px] border-2 border-gray-200 rounded-lg text-sm px-4 py-3 ${props.viewOnly ? "opacity-80" : "opacity-100"}`}>
        {/* <span>₹</span> */}
        {props.moneyInput ? <span>₹</span> : null}

        <span className={props.viewOnly ? "block" : "hidden"}>
          {props.viewOnlyText ?? props.defaultValue ?? props.value}
        </span>
        <input
          type="text"
          {...props}
          ref={props.referal}
          className={`outline-none placeholder:text-gray-400 w-full text-sm ${
            props.className
          } ${props.viewOnly ? "hidden" : "block"}`}
        />
      </div>
    </div>
  );
}
