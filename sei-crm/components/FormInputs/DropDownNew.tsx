"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { forwardRef, useEffect, useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";

export interface OptionsType {
  value: string;
  text: string;
}

interface IProps {
  label: string;
  name: string;
  options: OptionsType[];
  onChange?: (item: OptionsType) => void;
  error?: string;
  defaultValue?: any;
  changeSearchParamsOnChange?: boolean;
}

const DropDownNew = forwardRef<HTMLInputElement, IProps>(
  (
    {
      label,
      name,
      options,
      onChange,
      error,
      defaultValue,
      changeSearchParamsOnChange,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<OptionsType | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const route = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

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
      const selected = options.find((option) => option.value == defaultValue);
      setSelectedItem(selected || options[0]);
    }, [defaultValue, options]);

    return (
      <div ref={modalRef} className="relative space-y-2 min-w-48">
        <label className="block font-semibold text-sm pl-1 mb-1">{label}</label>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`relative border-2 ${
            error ? "border-red-300" : "border-gray-200"
          }  rounded-lg px-4 py-3 flex justify-between items-center cursor-pointer`}
        >
          <span className="text-sm font-semibold">
            {selectedItem?.text || "Select an option"}
          </span>
          <FaAngleDown />
        </div>

        {/* Hidden Input for Form Submission */}
        <input
          ref={ref}
          name={name}
          hidden
          defaultValue={selectedItem?.value || options[0]?.value}
        />

        {/* Dropdown Options */}
        {isOpen && (
          <ul className="absolute w-full bg-white shadow-lg mt-1 border rounded-lg z-10">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  setSelectedItem(option);
                  onChange?.(option); // ✅ Update form value
                  setIsOpen(false);

                  if (changeSearchParamsOnChange) {
                    const urlSearchParams = new URLSearchParams(searchParams);
                    urlSearchParams.set(name || "", option.value);
                    route.push(`${pathname}?${urlSearchParams.toString()}`);
                  }
                }}
                className={`px-4 py-3 text-sm hover:bg-gray-200 cursor-pointer ${
                  selectedItem?.value === option.value ? "bg-gray-200" : ""
                }`}
              >
                {option.text}
              </li>
            ))}
          </ul>
        )}
        {error ? (
          <span className="text-xs text-red-600 font-medium tracking-wider pl-1">
            {error}
          </span>
        ) : null}
      </div>
    );
  }
);

DropDownNew.displayName = "DropDown"; // Fix for forwardRef warnings

export default DropDownNew;
