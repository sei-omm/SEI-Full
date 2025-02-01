"use client";

import React, { forwardRef, useEffect, useState } from "react";
import InputNew from "./InputNew";

interface IProps {
  viewOnly?: boolean;
  viewOnlyText?: string;
  name?: string;
  label?: string;
  date?: string | null;
  // onChange?: (value: string) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void; // ✅ Accept event instead of string
  required?: boolean;
  type?: React.HTMLInputTypeAttribute;
  max?: number | string;
  min?: number | string;
  error?: string;
}

const DateInputNew = forwardRef<HTMLInputElement, IProps>(
  ({ ...props }, ref) => {
    const [date, setDate] = useState("");

    useEffect(() => {
      setDate(props.date || "");
    }, [props.date]);

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setDate(event.currentTarget.value);
      props.onChange?.(event);
    };

    return (
      <InputNew
        ref={ref}
        viewOnly={props.viewOnly}
        viewOnlyText={props.viewOnlyText}
        {...props}
        onChange={handleDateChange}
        type={props.type || "date"}
        value={date}
        max={props.max}
        min={props.min}
        error={props.error}
      />
    );
  }
);

DateInputNew.displayName = "DateInputNew"

export default DateInputNew;
