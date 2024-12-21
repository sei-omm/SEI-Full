"use client";

import DialogBody from "./DialogBody";
import LibraryFilters from "../MyAccount/LibraryFilters";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";

export default function LibraryMobileFilterDialog() {
  const { extraValue } = useSelector((state: RootState) => state.dialog);

  return (
    <DialogBody className="space-y-3">
      <LibraryFilters courses={extraValue.courses} />
    </DialogBody>
  );
}
