"use client";

import { setDialog } from "@/app/redux/slice/dialog.slice";
import React from "react";
import { IoCloseOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";

interface IProps {
  children: React.ReactNode;
  className?: string;
  preventToClose?: boolean | undefined;
  preventToCloseOnSideClick?: boolean | undefined;
  withoutDimBackground?:boolean;
}

export default function DialogBody({
  children,
  className,
  preventToClose = false,
  preventToCloseOnSideClick = false,
  withoutDimBackground = false
}: IProps) {
  const dispatch = useDispatch();

  const closeDialog = (whoClicked : "side" | "close-btn") => {
    if (preventToClose) {
      return;
    }

    if(preventToCloseOnSideClick && whoClicked === "side") return;

    dispatch(
      setDialog({
        type: "CLOSE",
        dialogKey: "",
      })
    );
  };

  return (
    <div
      onClick={() => closeDialog("side")}
      className={`size-full flex justify-center items-center ${withoutDimBackground ? "" : "bg-[#00000063]"}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white h-max w-96 rounded-3xl shadow-2xl p-10 flex flex-col relative sm:w-full sm:mx-2 sm:p-8 ${className}`}
      >
        {preventToClose ? null : (
          <IoCloseOutline
            onClick={() => closeDialog("close-btn")}
            size={20}
            className="absolute top-6 right-6 cursor-pointer active:scale-75"
          />
        )}
        {children}
      </div>
    </div>
  );
}
