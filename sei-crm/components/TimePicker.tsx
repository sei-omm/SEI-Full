"use client";

import React, { useState, ChangeEvent, useEffect } from "react";

interface IProps {
  label?: string;
  onPicked?: (value: string) => void;
}

const TimePicker = ({ label, onPicked }: IProps) => {
  const [hour, setHour] = useState<string>("12");
  const [minute, setMinute] = useState<string>("00");
  const [period, setPeriod] = useState<string>("AM");

  const handleHourChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setHour(event.target.value);
  };

  const handleMinuteChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setMinute(event.target.value);
  };

  const handlePeriodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setPeriod(event.target.value);
  };

  // const getTime = (): string => `${hour}:${minute} ${period}`;

  useEffect(() => {
    onPicked?.(`${hour}:${minute} ${period}`);
  }, [hour, minute, period]);

  return (
    <div>
      {label ? (
        <span className="block font-semibold text-sm pl-1 pb-2">{label}</span>
      ) : null}

      <div className="border-2 border-gray-200 rounded-lg w-full text-sm px-4 py-3 space-x-3">
        <select
          className="cursor-pointer"
          value={hour}
          onChange={handleHourChange}
        >
          {Array.from({ length: 13 }, (_, i) =>
            String(i).padStart(2, "0")
          ).map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span>:</span>
        <select
          className="cursor-pointer"
          value={minute}
          onChange={handleMinuteChange}
        >
          {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map(
            (m) => (
              <option key={m} value={m}>
                {m}
              </option>
            )
          )}
        </select>
        <select
          className="cursor-pointer"
          value={period}
          onChange={handlePeriodChange}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
};

export default TimePicker;
