import React from "react";

interface IRadioInput {
  disabled?: boolean;
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onClick?: () => void;
  label: string;
}

export default function RadioInput({
  name,
  onClick,
  checked,
  label,
  disabled,
  defaultChecked,
}: IRadioInput) {
  return (
    <div
      onClick={() => (disabled === true ? () => {} : onClick?.())}
      className="flex items-center gap-2 text-xs font-semibold"
    >
      <input
        name={name}
        type="radio"
        className="cursor-pointer"
        checked={checked}
        defaultValue={label}
        defaultChecked={defaultChecked}
      />
      <span className="inline-block pt-[2px]">{label}</span>
    </div>
  );
}
