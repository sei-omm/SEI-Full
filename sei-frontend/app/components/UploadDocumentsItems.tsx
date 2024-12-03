import React, { useState } from "react";
import DropDown from "./DropDown";
import ChooseFileInput from "./ChooseFileInput";
import { OptionsType } from "../type";

interface IProps {
  filesTypes: OptionsType[];
}

export default function UploadDocumentsItems({ filesTypes }: IProps) {
  const [selectedDropdownValue, setSelectedDropDownValue] =
    useState<OptionsType>({ text: "Id Proof", value: "id-proof" });
  return (
    <div className="flex items-center gap-5">
      <DropDown
        onChange={(item) => setSelectedDropDownValue(item)}
        label="Choose Your File Type"
        options={filesTypes}
        defaultValue={"id-proof"}
      />
      <div className="w-full flex-grow">
        <ChooseFileInput
          id={selectedDropdownValue.value}
          label={`Upload ${selectedDropdownValue.text}`}
          fileName={`Choose And Upload Your ${selectedDropdownValue.text}`}
          name={selectedDropdownValue.value}
        />
      </div>
    </div>
  );
}
