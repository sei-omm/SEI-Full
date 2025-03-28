"use client";

import axios, { AxiosError } from "axios";
import { BASE_API } from "@/app/constant";
import { useCallback, useEffect, useState } from "react";
import _ from "lodash";
import { toast } from "react-toastify";
import Button from "../Button";
import { EmployeeType, ISuccess, TInputSuggestion } from "@/types";
import Input from "../Input";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { queryClient } from "@/redux/MyProvider";
import Campus from "../Campus";
import { useSearchParams } from "next/navigation";
import { usePurifyCampus } from "@/hooks/usePurifyCampus";

type TSearch = {
  name: string;
  id: number;
  employee_type: EmployeeType;
};

export default function SearchForPermission() {
  const [query, setQuery] = useState<string>("");
  // const [results, setReslts] = useState<TSearch[]>([]);
  const [searchResult, setSearchResult] = useState<TSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<TInputSuggestion | null>(null);

  const searchParams = useSearchParams();
  const {campus} = usePurifyCampus(searchParams);

  const searchName = async (searchTerm: string) => {
    try {
      setLoading(true);
      const { data } = await axios.get<ISuccess<TSearch[]>>(
        `${BASE_API}/employee/search?q=${searchTerm}&institute=${campus}`
      );
      setSearchResult(data.data);
      // setReslts(data.data);
    } catch (error) {
      const err = error as AxiosError;
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Debounced function
  const debouncedSearch = useCallback(
    _.debounce((searchTerm) => {
      searchName(searchTerm);
    }, 500), // 500ms delay
    [campus]
  );

  useEffect(() => {
    if (query) debouncedSearch(query);
    if (query === "") {
      setSearchResult([]);
      // setReslts([]);
    }
  }, [query, debouncedSearch]);

  const { isLoading, mutate } = useDoMutation();
  const handleFormAction = () => {
    mutate({
      apiPath: "/setting/member",
      method: "post",
      formData: {
        employee_id: selectedSuggestion?.value,
        permissions: "{}",
      },
      onSuccess() {
        queryClient.invalidateQueries(["get-members"]);
      },
    });
  };

  return (
    <div className="pb-4 space-y-3">
      <form action={handleFormAction} className="gap-3 flex items-end">
        <Campus
          changeSearchParamsOnChange
          onChange={() => {
            setSearchResult([]);
          }}
        />
        <Input
          required
          wrapperCss="flex-grow"
          label="Search Member"
          placeholder="Search by Member Name"
          suggestionOptions={searchResult.map((item) => ({
            text: item.name,
            value: item.id,
          }))}
          suggestionLoading={loading}
          onSuggestionItemClick={(option) => {
            setSelectedSuggestion(option);
            setSearchResult([]);
          }}
          onChange={(e) => setQuery(e.currentTarget.value)}
        />
        <Button disabled={isLoading} loading={isLoading} className="mb-1">
          Add Member
        </Button>
      </form>
    </div>
  );
}
