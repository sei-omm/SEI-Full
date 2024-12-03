import React from "react";
import { GrFormClose } from "react-icons/gr";
import { MdFileDownloadDone } from "react-icons/md";
import { MdPendingActions } from "react-icons/md";

interface IProps {
  className?: string;
  children: React.ReactNode;
  type: "SUCCESS" | "FAILED" | "PENDING" | "ANY";
  onClick?: () => void;
  noIcon?: boolean;
  icon?: React.ReactNode;
  btnTypeProps ? : "button" | "submit" | "reset"
}

export default function TagsBtn({
  className,
  children,
  type,
  onClick,
  noIcon,
  icon,
  btnTypeProps
}: IProps) {
  return (
    <button
      type={btnTypeProps}
      onClick={onClick}
      className={`flex cursor-pointer px-3 py-1 rounded-full text-xs ${
        type == "SUCCESS"
          ? "bg-[#15803c36] border border-[#15803D]"
          : type === "PENDING"
          ? "bg-[#FFFF99] border border-[#afa33a]"
          : type === "FAILED"
          ? "bg-[#f4433636] border border-[#F44336]"
          : ""
      } flex items-center gap-x-2 ${className}`}
    >
      {icon ? (
        icon
      ) : type === "SUCCESS" && !noIcon ? (
        <MdFileDownloadDone size={18} color="#15803D" />
      ) : type === "FAILED" && !noIcon ? (
        <GrFormClose size={18} color="#F44336" />
      ) : noIcon ? null : type === "PENDING" ? (
        <MdPendingActions size={15} color="#000000" />
      ) : (
        icon
      )}
      {/* {} */}
      {children}
    </button>
  );
}
