"use client";

import React, { useEffect, useState } from "react";
import Input from "./Input";

interface IProps {
  viewOnly?: boolean;
  viewOnlyText?: string;
  name?: string;
  label?: string;
  date?: string | null;
  onChange?: (value: string) => void;
  required?: boolean;
}

export default function DateInput(props: IProps) {
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(props.date || "");
  }, [props.date]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDate(event.currentTarget.value);
    props.onChange?.(event.currentTarget.value);
  };

  return (
    <Input
      viewOnly={props.viewOnly}
      viewOnlyText={props.viewOnlyText}
      {...props}
      onChange={handleDateChange}
      type="date"
      value={date}
    />
  );
}
