import { InputTypes } from "@/types";
import { forwardRef, KeyboardEvent, LegacyRef, useEffect, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";

interface IProps extends InputTypes {
  wrapperCss?: string;
  label?: string;
  hideLabel?: boolean;
  referal?: LegacyRef<HTMLInputElement>;
  hideInput?: boolean;
  error?: string;
}


const TagInputNew = forwardRef<HTMLInputElement, IProps>(({ onChange, ...props }, ref) => {
  const [tags, setTags] = useState<string[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission on Enter
      const newTag = event.currentTarget.value.trim();
      if (!newTag) return; // Avoid empty tags
      const newTags = [...tags, newTag];
      setTags(newTags);
      onChange?.(newTags.join(",") as any); // ✅ Notify react-hook-form
      event.currentTarget.value = ""; // Clear input after adding
    }
  };

  const handleRemoveTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    onChange?.(newTags.join(",") as any); // ✅ Notify react-hook-form
  };

  useEffect(() => {
    if (props.defaultValue) {
      const newTags = props.defaultValue.toString().split(",");
      setTags(newTags);
    }
  }, [props.defaultValue]);

  return (
    <div className={`${props.wrapperCss}`}>
      {props.hideLabel ? null : (
        <span className="block font-semibold text-sm pl-1 mb-[0.5rem]">
          {props.label}
        </span>
      )}

      <div className={`flex relative items-center gap-3 border-2 ${props.error ? "border-red-300" : "border-gray-200"} rounded-lg overflow-hidden px-4 py-3`}>
        <input
          {...props}
          ref={ref}
          className="absolute right-10"
          hidden
          value={tags.join(",")} // ✅ Ensure form gets correct value
          readOnly
        />
        {tags.length === 0 ? null : (
          <ul className="flex items-center flex-wrap gap-2">
            {tags.map((tag, index) => (
              <li
                className="text-xs flex text-nowrap items-center gap-2 bg-gray-200 py-1 px-3 rounded-xl"
                key={tag}
              >
                {tag}
                {props.disabled ? null : (
                  <IoCloseOutline
                    onClick={() => handleRemoveTag(index)}
                    size={20}
                    className="cursor-pointer"
                  />
                )}
              </li>
            ))}
          </ul>
        )}

        <input
          type="text"
          {...props}
          ref={null}
          required={false}
          defaultValue=""
          onKeyDownCapture={handleKeyDown}
          className={`outline-none w-full text-sm ${props.className} ${
            props.hideInput ? "hidden" : ""
          }`}
        />
      </div>
      {props.error ? (
        <span className="text-xs text-red-600 font-medium tracking-wider pl-1">
          {props.error}
        </span>
      ) : null}
    </div>
  );
});

TagInputNew.displayName = "TagInputNew"

export default TagInputNew;