"use client";

import { RootState } from "@/redux/store";
import { useSearchParams } from "next/navigation";
import { forwardRef, useState } from "react";
import { useSelector } from "react-redux";
import DropDownNew from "./FormInputs/DropDownNew";

export interface OptionsType {
  value: string;
  text: string;
}

interface IProps {
  label?: string;
  onChange?: (item: OptionsType) => void;
  error?: string;
  changeSearchParamsOnChange?: boolean;
  defaultValue?: any;
}

const CampusNew = forwardRef<HTMLInputElement, IProps>(
  (
    { label, onChange, error, changeSearchParamsOnChange, defaultValue },
    ref
  ) => {
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
      <DropDownNew
        changeSearchParamsOnChange={changeSearchParamsOnChange}
        name="institute"
        options={options}
        label={label ?? "Choose Campus"}
        error={error}
        onChange={onChange}
        defaultValue={
          searchParams.get("institute") || campus === "Both"
            ? defaultValue
              ? defaultValue
              : "Kolkata"
            : campus
        }
        ref={ref}
      />
    );
  }
);

CampusNew.displayName = "Campus"; // Fix for forwardRef warnings

export default CampusNew;
