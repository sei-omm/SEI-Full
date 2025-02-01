import { setDialog } from "@/redux/slices/dialogs.slice";
import React from "react";
import { IoIosClose } from "react-icons/io";
import { useDispatch } from "react-redux";

interface IProps {
  children: React.ReactNode;
  className?: string;
  preventToClose?: boolean | undefined;
  preventToCloseOnSideClick?: boolean | undefined;
}

export default function DialogBody({
  children,
  className,
  preventToClose = false,
  preventToCloseOnSideClick = false,
}: IProps) {
  const dispatch = useDispatch();

  const closeDialog = (whoClicked: "side" | "close-btn") => {
    if (preventToClose) {
      return;
    }

    if (preventToCloseOnSideClick && whoClicked === "side") return;
    dispatch(
      setDialog({
        type: "CLOSE",
        dialogId: "",
      })
    );
  };
  return (
    <div
      onClick={() => closeDialog("side")}
      className="size-full flex items-start justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-96 px-8 py-6 pb-8 relative top-10 rounded-xl shadow-2xl space-y-3 ${className}`}
      >
        {preventToClose ? null : (
          <IoIosClose
            onClick={() => closeDialog("close-btn")}
            size={30}
            className="absolute right-5 top-5 active:scale-90 cursor-pointer"
          />
        )}

        {children}
      </div>
    </div>
  );
}
