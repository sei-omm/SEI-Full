"use client";

import { TFileFolderOptionAction } from "@/types";
import React from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { IoOpenOutline } from "react-icons/io5";

const options: {
  action: TFileFolderOptionAction;
  icon: React.JSX.Element;
  text: string;
}[] = [
  {
    action: "open",
    icon: <IoOpenOutline size={15} />,
    text: "Open",
  },
  {
    action: "delete",
    icon: <AiOutlineDelete size={15} />,
    text: "Delete",
  },
  {
    action: "rename",
    icon: <AiOutlineEdit size={15} />,
    text: "Rename",
  },
  // {
  //   action: "copy",
  //   icon: <IoCopyOutline size={15} />,
  //   text: "Copy",
  // },
  // {
  //   action: "cut",
  //   icon: <IoCutOutline size={15} />,
  //   text: "Cut",
  // },
  // {
  //   action: "paste",
  //   icon: <GoPaste size={15} />,
  //   text: "Paste",
  // },
];

interface IProps {
  className?: string;
  handleOptionClick?: (actionName: TFileFolderOptionAction) => void;
}

export default function FileFolderMoreOption({
  className,
  handleOptionClick,
}: IProps) {
  return (
    <ul
      className={`absolute overflow-hidden right-0 top-10 bg-white z-20 shadow-lg rounded-xl border border-gray-300 ${className}`}
    >
      {options.map((item) => (
        <li
          onClick={() => handleOptionClick?.(item.action)}
          key={item.text}
          className="flex items-center gap-2 p-3 min-w-48 cursor-pointer hover:bg-slate-300"
        >
          {item.icon}
          <span className="text-sm">{item.text}</span>
        </li>
      ))}
    </ul>
  );
}
