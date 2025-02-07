"use client";

import { InputTypes } from "@/types";
import { LegacyRef, useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

interface IProps extends InputTypes {
  wrapperCss?: string;
  label?: string;
  hideLabel?: boolean;
  referal?: LegacyRef<HTMLInputElement>;
  defaultValue?: any;
  moneyInput?: boolean;
  viewOnly?: boolean;
  viewOnlyText?: string;
  inputLayoutWrapperCss?: string;
}

export default function Input(props: IProps) {
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  return (
    <div className={props.wrapperCss}>
      {props.hideLabel ? null : (
        <span className="block font-semibold text-sm pl-1 mb-[0.5rem]">
          {props.label}
        </span>
      )}

      <div
        className={`w-full flex items-center gap-[2px] border-2 border-gray-200 rounded-lg text-sm px-4 py-3 ${
          props.viewOnly ? "opacity-80 bg-slate-200" : "opacity-100"
        } ${props.inputLayoutWrapperCss}`}
      >
        {/* <span>₹</span> */}
        {props.moneyInput ? <span>₹</span> : null}

        <span className={props.viewOnly ? "block" : "hidden"}>
          {props.viewOnlyText ?? props.defaultValue ?? props.value}
        </span>
        <input
          // onInput={(e) => props.onDateChange?.(e.currentTarget.value)}
          {...props}
          type={props.type === "password" && passwordVisibility ? "text" : props.type}
          ref={props.referal}
          className={`outline-none placeholder:text-gray-400 w-full text-sm ${
            props.className
          } ${props.viewOnly ? "hidden" : "block"} !bg-transparent`}
        />
        {props.type === "password" ? (
          <div>
            {passwordVisibility ? (
              <FaRegEye onClick={() => setPasswordVisibility(false)} size={17} className="cursor-pointer" />
            ) : (
              <FaRegEyeSlash onClick={() => setPasswordVisibility(true)} size={18} className="cursor-pointer" />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
