"use client";

import { useDispatch } from "react-redux";
import { DialogSliceType } from "../type";
import { setDialog } from "../redux/slice/dialog.slice";

interface IProps extends DialogSliceType {
  children: React.ReactNode;
  className?: string;
}

export default function OpenDialogButton({
  type,
  className,
  dialogKey,
  children,
  extraValue
}: IProps) {
  const dispatch = useDispatch();

  const onButtonClick = () => {
    dispatch(
      setDialog({
        dialogKey,
        type,
        extraValue
      })
    );
  };

  return (
    <div className={"cursor-pointer inline-block " + className} onClick={onButtonClick}>
      {children}
    </div>
  );
}
