"use client";

import { ChangeEvent, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { IoCloudUploadOutline, IoEyeOutline } from "react-icons/io5";
import { MdOutlineDeleteOutline } from "react-icons/md";

interface IProps {
  viewOnly?: boolean;
  accept?: string;
  name: string;
  fileName?: string;
  label: string;
  id: string;
  viewLink?: string | null;
  onFilePicked?: (file: File) => void;
}

export default function ChooseFileInput({
  viewOnly,
  id,
  accept,
  fileName,
  name,
  label,
  viewLink,
  onFilePicked,
}: IProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleViewFile = () => {
    if (file) {
      const url = URL.createObjectURL(file);
      window.open(url);
    }

    window.open(viewLink || "");
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length !== 0) {
      setFile(event.target.files[0]);
      onFilePicked?.(event.target.files[0]);
    }
  };

  return (
    <div className={`space-y-2`}>
      <input
        disabled = {viewOnly ?? viewOnly}
        accept={accept}
        onChange={handleInputChange}
        hidden
        id={id}
        type="file"
        name={name}
      />
      <span className="block font-semibold text-sm pl-1">{label}</span>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center justify-between border-2 border-gray-200 text-gray-500 rounded-lg w-full text-sm px-4 py-3"
      >
        <h2 className="line-clamp-1 max-w-[90%]">{file ? file.name : fileName}</h2>
        <div className="flex items-center gap-3 *:cursor-pointer">
          {!file && !viewLink ? null : (
            <IoEyeOutline onClick={handleViewFile} size={18} />
          )}

          {!file && !viewLink ? (
            <label className={viewOnly ? "hidden" : "inline"} htmlFor={id}>
              <IoCloudUploadOutline size={18} />
            </label>
          ) : (
            <>
              <label className={viewOnly ? "hidden" : "inline"} htmlFor={id}>
                <CiEdit size={18} />
              </label>
              <MdOutlineDeleteOutline className={viewOnly ? "hidden" : "inline"} onClick={() => setFile(null)} size={18} />
            </>
          )}
        </div>
      </label>
    </div>
  );
}
