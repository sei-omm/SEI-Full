"use client";

import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import Spinner from "./Spinner";
import { LegacyRef, useEffect, useRef, useState } from "react";
import { InputTypes, TInputSuggestion } from "@/types";

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
  suggestionOptions?: TInputSuggestion[];
  suggestionLoading?: boolean;
  onSuggestionItemClick?: (option: TInputSuggestion) => void;
  onClickOutSide?: () => void;
}

// export default function Input(props: IProps) {
//   const [passwordVisibility, setPasswordVisibility] = useState(false);

//   const inputRef = useRef<HTMLInputElement>(null);

//   return (
//     <div className={props.wrapperCss + " !relative"}>
//       {props.hideLabel ? null : (
//         <span className="block font-semibold text-sm pl-1 mb-[0.5rem]">
//           {props.label}
//         </span>
//       )}

//       <div
//         className={`w-full flex items-center gap-[2px] border-2 border-gray-200 rounded-lg text-sm px-4 py-3 ${
//           props.viewOnly ? "opacity-80 bg-slate-200" : "opacity-100"
//         } ${props.inputLayoutWrapperCss}`}
//       >
//         {/* <span>₹</span> */}
//         {props.moneyInput ? <span>₹</span> : null}

//         <span className={props.viewOnly ? "block" : "hidden"}>
//           {props.viewOnlyText ?? props.defaultValue ?? props.value}
//         </span>
//         <input
//           // onInput={(e) => props.onDateChange?.(e.currentTarget.value)}
//           {...props}
//           type={
//             props.type === "password" && passwordVisibility
//               ? "text"
//               : props.type
//           }
//           ref={props.referal ?? inputRef}
//           className={`outline-none placeholder:text-gray-400 w-full text-sm ${
//             props.className
//           } ${props.viewOnly ? "hidden" : "block"} !bg-transparent`}
//         />
//         {props.type === "password" ? (
//           <div>
//             {passwordVisibility ? (
//               <FaRegEye
//                 onClick={() => setPasswordVisibility(false)}
//                 size={17}
//                 className="cursor-pointer"
//               />
//             ) : (
//               <FaRegEyeSlash
//                 onClick={() => setPasswordVisibility(true)}
//                 size={18}
//                 className="cursor-pointer"
//               />
//             )}
//           </div>
//         ) : null}
//       </div>

//       {props.suggestionOptions ? (
//         <div className="absolute w-full z-40 pt-1">
//           {props.suggestionLoading ? (
//             <div
//               className={`flex items-center justify-center py-5 bg-white shadow-2xl border-2 border-gray-200 rounded-lg`}
//             >
//               <Spinner size="18px" />
//             </div>
//           ) : props.suggestionOptions.length !== 0 ? (
//             <div className="bg-white shadow-2xl border-2 border-gray-200 rounded-lg">
//               <ul>
//                 {props.suggestionOptions.map((item) => (
//                   <li
//                     onClick={() => {
//                       if (inputRef.current) {
//                         inputRef.current.value = item.text;
//                       }
//                       if (props.onSuggestionItemClick) {
//                         props.onSuggestionItemClick(item);
//                       }
//                     }}
//                     key={item.value}
//                     className="py-2 px-4 text-sm font-medium cursor-pointer hover:bg-gray-200"
//                   >
//                     {item.text}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ) : null}
//         </div>
//       ) : null}
//     </div>
//   );
// }

export default function Input({
  onSuggestionItemClick,
  suggestionOptions,
  onClickOutSide,
  ...props
}: IProps) {
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const checkClickOutside = (event: MouseEvent) => {
    if (!inputRef.current?.contains(event.target as Node)) {
      onClickOutSide?.();
    }
  };

  useEffect(() => {
    document.addEventListener("click", checkClickOutside);

    return () => document.removeEventListener("click", checkClickOutside);
  }, [suggestionOptions?.toString()]);

  return (
    <div className={props.wrapperCss + " !relative"}>
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
        {props.moneyInput ? <span>₹</span> : null}

        <span className={props.viewOnly ? "block" : "hidden"}>
          {props.viewOnlyText ?? props.defaultValue ?? props.value}
        </span>

        {/* Spread only valid input props */}
        <input
          {...props}
          type={
            props.type === "password" && passwordVisibility
              ? "text"
              : props.type
          }
          ref={props.referal ?? inputRef}
          className={`outline-none placeholder:text-gray-400 w-full text-sm ${
            props.className
          } ${props.viewOnly ? "hidden" : "block"} !bg-transparent`}
        />

        {props.type === "password" && (
          <div>
            {passwordVisibility ? (
              <FaRegEye
                onClick={() => setPasswordVisibility(false)}
                size={17}
                className="cursor-pointer"
              />
            ) : (
              <FaRegEyeSlash
                onClick={() => setPasswordVisibility(true)}
                size={18}
                className="cursor-pointer"
              />
            )}
          </div>
        )}
      </div>

      {/* Handle Suggestions */}
      {suggestionOptions && (
        <div className="absolute w-full z-40 pt-1">
          {props.suggestionLoading ? (
            <div className="flex items-center justify-center py-5 bg-white shadow-2xl border-2 border-gray-200 rounded-lg">
              <Spinner size="18px" />
            </div>
          ) : suggestionOptions.length !== 0 ? (
            <div className="bg-white shadow-2xl border-2 border-gray-200 rounded-lg">
              <ul>
                {suggestionOptions.map((item) => (
                  <li
                    key={item.value}
                    onClick={() => {
                      if (inputRef.current) {
                        inputRef.current.value = item.text;
                      }
                      // Call the function only if it exists
                      onSuggestionItemClick?.(item);
                    }}
                    className="py-2 px-4 text-sm font-medium cursor-pointer hover:bg-gray-200"
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
