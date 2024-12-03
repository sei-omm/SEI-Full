interface IRadioInput {
  name?: string;
  checked?: boolean;
  onClick?: () => void;
  label: string;
  className ? : string;
}

export function RadioInput({className, name, onClick, checked, label }: IRadioInput) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 text-xs font-semibold ${className}`}
    >
      <input
        name={name}
        type="radio"
        className="cursor-pointer"
        checked={checked}
      />
      <span className="inline-block pt-[2px] cursor-pointer">{label}</span>
    </div>
  );
}
