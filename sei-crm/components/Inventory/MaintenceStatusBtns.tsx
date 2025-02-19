"use client";

import TagsBtn from "../TagsBtn";

type TStatus = "Completed" | "Pending";

interface IProps {
  status: TStatus;
  onStatusChange?: (status: TStatus) => void;
}

export default function MaintenceStatusBtns({
  status,
  onStatusChange,
}: IProps) {
  const handleStatus = (status: TStatus) => {
    onStatusChange?.(status);
  };

  return (
    <div className="flex flex-col gap-y-2 group/items">
      <TagsBtn
        onClick={() => handleStatus("Completed")}
        className={`${
          status === "Completed" ? "flex" : "hidden group-hover/items:!flex"
        }`}
        type="SUCCESS"
      >
        Completed
      </TagsBtn>

      <TagsBtn
        onClick={() => handleStatus("Pending")}
        className={`${
          status === "Pending" ? "flex group-hover/items:flex" : "hidden"
        }`}
        type="PENDING"
      >
        Pending
      </TagsBtn>
    </div>
  );
}
