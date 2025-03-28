"use client";

import { useSearchParams } from "next/navigation";
import DropDown from "./DropDown";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { IDropDown, OptionsType } from "@/types";
import { useState } from "react";

interface IProps extends IDropDown {
  readonly?: string;
}

export default function Campus(props: IProps) {
  const searchParams = useSearchParams();

  const { campus } = useSelector((state: RootState) => state.campus);

  const [options] = useState<OptionsType[]>(() => {
    if (campus === "Kolkata") return [{ text: "Kolkata", value: "Kolkata" }];
    if (campus === "Faridabad")
      return [{ text: "Faridabad", value: "Faridabad" }];
    if (campus === "Both")
      return [
        { text: "Kolkata", value: "Kolkata" },
        { text: "Faridabad", value: "Faridabad" },
      ];

    return [];
  });

  return options.length === 0 ? null : (
    <DropDown
      name="institute"
      options={options}
      label={"Select Campus"}
      {...props}
      defaultValue={
        searchParams.get("institute") || campus === "Both"
          ? props.defaultValue
            ? props.defaultValue
            : "Kolkata"
          : campus
      }
    />
  );
}
