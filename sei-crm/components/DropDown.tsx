"use client";

import { IDropDown, OptionsType } from "@/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";

export default function DropDown({
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
}: IDropDown) {
  const modalRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OptionsType | null>(null);

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
      const findTextFromValue = options?.find(
        (item) => item.value == defaultValue
      );
      setSelectedItem(findTextFromValue || null);
    } else {
      setSelectedItem(options?.[0] || null);
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
          <h2 className="font-semibold line-clamp-1">{selectedItem?.text}</h2>
          {viewOnly ? null : (
            <>
              <FaAngleDown />
              <div
                className={`${
                  isOpen ? "block" : "hidden"
                } absolute left-0 right-0 top-2 z-[10000]`}
              >
                <input
                  ref={valueRef}
                  hidden
                  name={name}
                  defaultValue={selectedItem?.value}
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
                        setSelectedItem(option);
                        onChange?.(option);
                      }}
                      key={index}
                      className={`px-5 py-3 hover:bg-gray-300 ${
                        selectedItem?.value === option.value
                          ? "bg-gray-200"
                          : ""
                      }`}
                    >
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