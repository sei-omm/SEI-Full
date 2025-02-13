"use client";

import { InputTypes } from "@/types";
import { KeyboardEvent, LegacyRef, useEffect, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import Spinner from "./Spinner";

type TTagInputSuggestion = { text: string; value: any };

interface IProps extends InputTypes {
  wrapperCss?: string;
  label?: string;
  hideLabel?: boolean;
  referal?: LegacyRef<HTMLInputElement>;
  hideInput?: boolean;
  suggestionOptions?: TTagInputSuggestion[];
  suggestionLoading?: boolean;
  onSuggestionItemClick?: (option: TTagInputSuggestion) => void;
  onTagRemove?: (index: number) => void;
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

  const handleSuggestionOptionClick = (option: TTagInputSuggestion) => {
    const newArr = [...tags];
    newArr.push(option.text);
    setTags(newArr);
    if (props.onSuggestionItemClick) {
      props.onSuggestionItemClick(option);
    }
  };

  const handleRemoveTag = (index: number) => {
    const newArr = [...tags];
    newArr.splice(index, 1);
    setTags(newArr);
    if (props.onTagRemove) {
      props.onTagRemove(index);
    }
  };

  useEffect(() => {
    if (props.defaultValue) {
      const newArr = props.defaultValue.toString().split(",");
      setTags(newArr);
    }
  }, [props.defaultValue]);

  return (
    <div className={`${props.wrapperCss} !relative`}>
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
      {props.suggestionOptions && props.suggestionOptions.length !== 0 ? (
        <div className="absolute w-full z-40">
          <div className="mt-1 bg-white shadow-2xl border-2 border-gray-200 rounded-lg">
            {props.suggestionLoading ? (
              <div className="flex items-center justify-center py-5">
                <Spinner size="18px" />
              </div>
            ) : (
              <ul>
                {props.suggestionOptions.map((item) => (
                  <li
                    onClick={() => handleSuggestionOptionClick(item)}
                    key={item.value}
                    className="py-2 px-4 text-sm font-medium cursor-pointer hover:bg-gray-200"
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
