"use client";

import { OptionsType } from "@/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { MdOutlineDone } from "react-icons/md";

interface IProps {
  wrapperCss?: string;
  className?: string;
  label: string;
  options: OptionsType[];
  defaultValue?: any[];
  name?: string;
  onChange?: (item: OptionsType) => void;
  changeSearchParamsOnChange?: boolean;
  viewOnly?: boolean;
  valueRef?: React.RefObject<HTMLInputElement>;
}

export default function MultiSelectDropDown({
  wrapperCss,
  className,
  label,
  options,
  name,
  defaultValue,
  onChange,
  changeSearchParamsOnChange,
  viewOnly,
  valueRef,
}: IProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OptionsType[]>([]);

  const route = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const checkClickOutside = (event: MouseEvent) => {
    if (isOpen && !modalRef.current?.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (defaultValue !== undefined) {
      const findTextFromValue = options.filter(
        (item) => defaultValue.includes(item.value)
      );
      setSelectedItem(findTextFromValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    document.addEventListener("click", checkClickOutside);

    return () => document.removeEventListener("click", checkClickOutside);
  }, [isOpen]);

  return (
    <div className={wrapperCss}>
      <span className="block font-semibold text-sm pl-1 mb-[0.5rem]">
        {label}
      </span>

      <div
        ref={modalRef}
        className={`bg-gray-50 group/dropdown border rounded-xl min-w-48 border-gray-300 text-gray-900 text-sm cursor-pointer *:cursor-pointer focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${className} !rounded-lg !py-[0.20rem]`}
      >
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between text-sm relative p-2.5"
        >
          <h2 className="font-semibold line-clamp-1">
            {selectedItem.length === 0
              ? "Select Options"
              : selectedItem.map((item) => item.text).join(", ")}
          </h2>
          {viewOnly ? null : (
            <>
              <FaAngleDown />
              <div
                className={`${
                  isOpen ? "block" : "hidden"
                } left-0 right-0 top-2 absolute z-20`}
              >
                <input
                  ref={valueRef}
                  hidden
                  name={name}
                  defaultValue={selectedItem
                    .map((item) => item.value)
                    .join(",")}
                />
                <ul className="bg-white border rounded-xl drop_down_sidebar overflow-x-hidden relative top-11 max-h-60 overflow-y-auto">
                  {options?.map((option, index) => (
                    <li
                      onClick={() => {
                        if (changeSearchParamsOnChange) {
                          const urlSearchParams = new URLSearchParams(
                            searchParams
                          );
                          urlSearchParams.set(name || "", option.value);
                          route.push(
                            `${pathname}?${urlSearchParams.toString()}`
                          );
                        }

                        const newOptions = [...selectedItem];
                        const indexToRemove = newOptions.findIndex(
                          (item) => item.value === option.value
                        );
                        if (indexToRemove === -1) {
                          newOptions.push(option);
                        } else {
                          newOptions.splice(indexToRemove, 1);
                        }
                        setSelectedItem(newOptions);
                        onChange?.(option);
                      }}
                      key={index}
                      className={`px-5 py-3 hover:bg-gray-300 flex items-center gap-3`}
                    >
                      {selectedItem.findIndex(
                        (item) => item.value === option.value
                      ) !== -1 ? (
                        <MdOutlineDone />
                      ) : null}
                      {option.text}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
