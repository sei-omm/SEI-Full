"use client";

import { OptionsType } from "@/types";
import { useEffect, useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { IoCloseOutline } from "react-icons/io5";

interface IProps {
  wrapperCss?: string;
  className?: string;
  label: string;
  options: OptionsType[];
  defaultValues?: any[];
  name?: string;
  // onChange?: (item: OptionsType) => void;
}

export default function DropDownTag({
  wrapperCss,
  className,
  label,
  options,
  name,
  defaultValues,
  // onChange,
}: IProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const [tags, setTags] = useState<OptionsType[]>(options.filter((item) => defaultValues?.includes(item.value)));

  const checkClickOutside = (event: MouseEvent) => {
    if (isOpen && !modalRef.current?.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", checkClickOutside);

    return () => document.removeEventListener("click", checkClickOutside);
  }, [isOpen]);


  useEffect(() => {
    if (defaultValues) {
      setTags(options.filter((item) => defaultValues.includes(item.value)));
    }
  }, [defaultValues]);

  const handleRemoveTag = (index: number) => {
    setTags((prev) => prev.filter((item) => item.value !== prev[index].value));
  };

  function handleAddNewItem(option: OptionsType) {
    setTags((preState) => [...preState, option]);
  }

  return (
    <div className={wrapperCss}>
      <span className="block font-semibold text-sm pl-1 mb-[0.5rem]">
        {label}
      </span>

      <ul className="w-full flex items-center flex-wrap gap-4 mb-2">
        {tags.map((option, index) => (
          <li
            className="text-xs flex text-nowrap items-center gap-2 bg-gray-200 py-1 px-3 rounded-xl"
            key={option.value}
          >
            {option.text}
            {/* {props.disabled ? null : ( */}
            <IoCloseOutline
              onClick={() => handleRemoveTag(index)}
              size={20}
              className="cursor-pointer"
            />
            {/* )} */}
          </li>
        ))}
      </ul>

      <div
        ref={modalRef}
        className={`bg-gray-50 group/dropdown border rounded-xl min-w-48 border-gray-300 text-gray-900 text-sm cursor-pointer *:cursor-pointer focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${className} !rounded-lg !py-[0.20rem]`}
      >
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between text-sm relative p-2.5"
        >
          <h2 className="font-semibold line-clamp-1">{label}</h2>
          <FaAngleDown />
          <div
            className={`${
              isOpen ? "block" : "hidden"
            } left-0 right-0 top-2 absolute z-20`}
          >
            <input
              hidden
              name={name}
              defaultValue={tags?.map((item) => item.value).join(",")}
            />
            <ul className="bg-white border rounded-xl drop_down_sidebar overflow-x-hidden relative top-11 max-h-60 overflow-y-auto">
              {options.map((option, index) => {
                if (tags.includes(option)) return null;
                return (
                  <li
                    onClick={() => handleAddNewItem(option)}
                    key={index}
                    className={`px-5 py-3 hover:bg-gray-300`}
                  >
                    {option.text}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
