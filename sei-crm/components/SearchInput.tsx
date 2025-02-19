"use client";

import { useSearchParams } from "next/navigation";
import Input from "./Input";
import { RiSearchLine } from "react-icons/ri";

interface IPorps {
  handleSearch: (searchInput: string) => void;
  placeHolder?:string;
  search_key?:string
}

export default function SearchInput({ handleSearch, placeHolder, search_key }: IPorps) {
  const searchParams = useSearchParams();
  return (
    <form
      action={(formData) => {
        const searchValue = formData.get("search_input");
        if (searchValue) {
          handleSearch(searchValue.toString());
        }
      }}
      className="flex items-center gap-3 relative"
    >
      <Input
        key={searchParams.get("search")}
        required
        title="Type Something For Search"
        name="search_input"
        placeholder={placeHolder ?? "Search.."}
        className="!min-w-80"
        defaultValue={searchParams.get(search_key ?? "search")}
      />
      <button type="submit">
        <RiSearchLine className="mt-2 cursor-pointer" size={20} />
      </button>
    </form>
  );
}
