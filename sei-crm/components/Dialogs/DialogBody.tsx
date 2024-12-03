import { setDialog } from "@/redux/slices/dialogs.slice";
import React from "react";
import { IoIosClose } from "react-icons/io";
import { useDispatch } from "react-redux";

interface IProps {
  children: React.ReactNode;
  className ? : string;
}

export default function DialogBody({ children, className }: IProps) {
  const dispatch = useDispatch();

  const closeDialog = () => {
    dispatch(
      setDialog({
        type: "CLOSE",
        dialogId: "",
      })
    );
  };
  return (
    <div
      onClick={closeDialog}
      className="size-full flex items-start justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-96 px-8 py-6 pb-8 relative top-10 rounded-xl shadow-2xl space-y-3 ${className}`}
      >
        <IoIosClose
          onClick={closeDialog}
          size={30}
          className="absolute right-5 top-5 active:scale-90 cursor-pointer"
        />
        {children}
      </div>
    </div>
  );
}
