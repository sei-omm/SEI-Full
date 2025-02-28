import { LegacyRef } from "react";

interface IProps
  extends React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > {
  wrapperCss?: string;
  label?: string;
  hideLabel?: boolean;
  referal?: LegacyRef<HTMLTextAreaElement>;
  defaultValue?: any;
  viewOnly?: boolean;
  viewOnlyText?: string;
  inputLayoutWrapperCss?: string;
}

export default function TextArea(props: IProps) {
  return (
    <div className={`${props.wrapperCss}`}>
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
        <span className={props.viewOnly ? "block" : "hidden"}>
          {props.viewOnlyText ?? props.defaultValue ?? props.value}
        </span>
        {props.viewOnly ? (
          <input
            className="hidden"
            name={props.name}
            value={props.viewOnlyText ?? props.defaultValue ?? props.value}
          />
        ) : (
          <textarea
            {...props}
            ref={props.referal}
            className={`outline-none w-full h-full${
              props.viewOnly ? "opacity-80 bg-slate-200" : "opacity-100"
            } ${props.className}`}
          ></textarea>
        )}
      </div>
    </div>
  );
}
