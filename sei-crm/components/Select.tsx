"use client";

import { useEffect, useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";

interface IProps<T> {
  className?: string;
  label: string;
  options?: T[];
  itemToLoad?: (item: T, index: number) => React.ReactNode;
  children?: React.ReactNode;
}

export default function Select<T>({
  className,
  label,
  options,
  itemToLoad,
  children,
}: IProps<T>) {
  const modalRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const checkClickOutside = (event: MouseEvent) => {
    if (isOpen && !modalRef.current?.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", checkClickOutside);

    return () => document.removeEventListener("click", checkClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={modalRef}
      className={`bg-gray-50 group/dropdown border rounded-xl min-w-48 border-gray-300 text-gray-900 text-sm cursor-pointer *:cursor-pointer focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${className}`}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between text-sm relative p-2.5"
      >
        <h2 className="font-semibold">{label}</h2>
        <FaAngleDown />

        <div
          className={`${
            isOpen ? "block" : "hidden"
          } left-0 right-0 top-2 absolute z-20`}
        >
          {itemToLoad ? (
            <ul className="bg-white border rounded-xl overflow-hidden relative top-11">
              {options?.map((option, index) => (
                <li key={index}>{itemToLoad(option, index)}</li>
              ))}
            </ul>
          ) : (
            <div className="bg-white border rounded-xl overflow-hidden relative top-11">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
