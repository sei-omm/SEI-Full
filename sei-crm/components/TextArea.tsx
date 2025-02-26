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
}

export default function TextArea(props: IProps) {
  return (
    <div className={`${props.wrapperCss}`}>
      {props.hideLabel ? null : (
        <span className="block font-semibold text-sm pl-1 mb-[0.5rem]">
          {props.label}
        </span>
      )}

      <textarea
        {...props}
        ref={props.referal}
        className={`outline-none border-2 border-gray-200 placeholder:text-gray-400 rounded-lg w-full text-sm px-4 py-3 ${
          props.viewOnly ? "opacity-80 bg-slate-200" : "opacity-100"
        } ${props.className}`}
        disabled = {props.viewOnly}
      ></textarea>
    </div>
  );
}
