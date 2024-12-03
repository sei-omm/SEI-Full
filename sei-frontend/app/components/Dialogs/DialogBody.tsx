"use client";

import { setDialog } from "@/app/redux/slice/dialog.slice";
import React from "react";
import { IoCloseOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";

interface IProps {
  children: React.ReactNode;
  className?: string;
  preventToClose?: boolean;
}

export default function DialogBody({
  children,
  className,
  preventToClose = false,
}: IProps) {
  const dispatch = useDispatch();

  const closeDialog = () => {
    if (preventToClose) {
      return;
    }
    dispatch(
      setDialog({
        type: "CLOSE",
        dialogKey: "",
      })
    );
  };

  return (
    <div
      onClick={closeDialog}
      className="size-full flex justify-center items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white h-max w-96 rounded-3xl shadow-2xl p-10 flex flex-col relative sm:w-full sm:mx-2 sm:p-8 ${className}`}
      >
        {preventToClose ? null : (
          <IoCloseOutline
            onClick={closeDialog}
            size={20}
            className="absolute top-6 right-6 cursor-pointer active:scale-75"
          />
        )}
        {children}
      </div>
    </div>
  );
}
