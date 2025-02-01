"use client";

import { InputTypes } from "@/types";
import { KeyboardEvent, LegacyRef, useEffect, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";

interface IProps extends InputTypes {
  wrapperCss?: string;
  label?: string;
  hideLabel?: boolean;
  referal?: LegacyRef<HTMLInputElement>;
  hideInput?: boolean;
}

export default function TagInput(props: IProps) {
  const [tags, setTags] = useState<string[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const newArr = [...tags];
      newArr.push(event.currentTarget.value);
      setTags(newArr);
    }
  };

  const handleRemoveTag = (index: number) => {
    const newArr = [...tags];
    newArr.splice(index, 1);
    setTags(newArr);
  };

  useEffect(() => {
    if (props.defaultValue) {
      const newArr = props.defaultValue.toString().split(",");
      setTags(newArr);
    }
  }, [props.defaultValue]);

  return (
    <div className={`${props.wrapperCss}`}>
      {props.hideLabel ? null : (
        <span className="block font-semibold text-sm pl-1 mb-[0.5rem]">
          {props.label}
        </span>
      )}

      <div className="flex relative items-center gap-3 border-2 border-gray-200 rounded-lg overflow-hidden px-4 py-3">
        <input
          className="absolute -z-10"
          required={props.required}
          name={props.name}
          defaultValue={tags.join(",")}
        />
        {tags.length === 0 ? null : (
          <ul className="flex items-center flex-wrap gap-2">
            {tags.map((tag, index) => (
              <li
                className="text-xs flex text-nowrap items-center gap-2 bg-gray-200 py-1 px-3 rounded-xl"
                key={tag}
              >
                {tag}
                {props.disabled ? null : (
                  <IoCloseOutline
                    onClick={() => handleRemoveTag(index)}
                    size={20}
                    className="cursor-pointer"
                  />
                )}
              </li>
            ))}
          </ul>
        )}

        <input
          type="text"
          {...props}
          required={false}
          name=""
          defaultValue={""}
          ref={props.referal}
          onKeyDownCapture={handleKeyDown}
          className={`outline-none w-full text-sm ${props.className} ${
            props.hideInput ? "hidden" : ""
          }`}
        />
      </div>
    </div>
  );
}