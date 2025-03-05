import { InputTypes } from "@/types";
import { forwardRef, LegacyRef } from "react";

interface IProps extends InputTypes {
  wrapperCss?: string;
  label?: string;
  hideLabel?: boolean;
  referal?: LegacyRef<HTMLInputElement>;
  defaultValue?: any;
  moneyInput?: boolean;
  iconBeforeFild?: React.ReactNode,
  viewOnly?: boolean;
  viewOnlyText?: string;
  inputLayoutWrapperCss?: string;
  error?: string;
}

const InputNew = forwardRef<HTMLInputElement, IProps>(({ ...props }, ref) => {
  return (
    <div className={props.wrapperCss ? props.wrapperCss : undefined}>
      {props.hideLabel ? null : (
        <span className="block font-semibold text-sm pl-1 mb-[0.5rem]">
          {props.label}
        </span>
      )}

      <div
        className={`w-full flex items-center gap-[2px] border-2 ${
          props.error ? "border-red-300" : "border-gray-200"
        } rounded-lg text-sm px-4 py-3 ${
          props.viewOnly || props.disabled
            ? "opacity-80 bg-slate-200"
            : "opacity-100"
        } ${props.inputLayoutWrapperCss}`}
      >
        {/* <span>₹</span> */}
        {props.moneyInput ? <span>₹</span> : null}
        {props.iconBeforeFild ? <span>{props.iconBeforeFild}</span> : null}

        <span className={props.viewOnly ? "block" : "hidden"}>
          {props.viewOnlyText ?? props.defaultValue ?? props.value}
        </span>
        <input
          type="text"
          ref={ref}
          {...props}
          // ref={props.referal}
          className={`outline-none placeholder:text-gray-400 w-full text-sm ${
            props.className
          } ${props.viewOnly ? "hidden" : "block"}`}
        />
      </div>
      {props.error ? (
        <span className="text-xs text-red-600 font-medium tracking-wider pl-1">
          {props.error}
        </span>
      ) : null}
    </div>
  );
});

InputNew.displayName = "InputNew";

export default InputNew;
