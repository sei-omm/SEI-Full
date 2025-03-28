"use client";

import axios, { AxiosError } from "axios";
import { BASE_API } from "@/app/constant";
import { useCallback, useEffect, useState } from "react";
import _ from "lodash";
import { toast } from "react-toastify";
import DropDown from "../DropDown";
import Button from "../Button";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useDispatch } from "react-redux";
import { EmployeeType, ISuccess, TInputSuggestion } from "@/types";
import Input from "../Input";
import Campus from "../Campus";
import { usePurifyCampus } from "@/hooks/usePurifyCampus";
import { useSearchParams } from "next/navigation";

type TSearch = {
  name: string;
  id: number;
  employee_type: EmployeeType;
};

export default function TranningGenerate() {
  const [query, setQuery] = useState<string>("");
  const [results, setReslts] = useState<TSearch[]>([]);
  const [searchResult, setSearchResult] = useState<TSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<TInputSuggestion | null>(null);
  const searchParams = useSearchParams();
  const { campus } = usePurifyCampus(searchParams);

  const dispatch = useDispatch();

  const searchName = async (searchTerm: string) => {
    try {
      setLoading(true);
      const { data } = await axios.get<ISuccess<TSearch[]>>(
        `${BASE_API}/employee/search?q=${searchTerm}&institute=${campus}`
      );
      setSearchResult(data.data);
      setReslts(data.data);
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
    [searchParams.toString()]
  );

  useEffect(() => {
    if (query) debouncedSearch(query);
    if (query === "") {
      setSearchResult([]);
      setReslts([]);
    }
  }, [query, debouncedSearch]);

  const handleFormAction = (formData: FormData) => {
    dispatch(
      setDialog({
        type: "OPEN",
        dialogId: formData.get("tranning_name") as string,
        extraValue: {
          employee_id: selectedSuggestion?.value,
          btn_type: "Generate",
          employee_type: results.find(
            (item) => item.id === selectedSuggestion?.value
          )?.employee_type,
        },
      })
    );
  };

  return (
    <div className="pb-4 space-y-3">
      <h2 className="font-semibold text-lg text-gray-600 opacity-70">
        Generate Training Form
      </h2>
      <form action={handleFormAction} className="gap-3 flex items-end">
        {/* <DropDown
          changeSearchParamsOnChange
          onChange={() => {
            setSearchResult([]);
            setReslts([]);
          }}
          name="institute"
          label="Campus"
          options={[
            { text: "Kolkata", value: "Kolkata" },
            { text: "Faridabad", value: "Faridabad" },
          ]}
          defaultValue={searchParams.get("institute") || "Kolkata"}
        /> */}
        <Campus
          changeSearchParamsOnChange
          onChange={() => {
            setSearchResult([]);
            setReslts([]);
          }}
        />
        <Input
          required
          wrapperCss="flex-grow"
          label="Search Employee"
          placeholder="Search by Employee Name"
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
        <div className="flex-grow">
          <DropDown
            name="tranning_name"
            label="Training Name"
            options={[
              { text: "Induction Training", value: "Induction Training" },
              { text: "Skill Enhancement", value: "Skill Enhancement" },
              { text: "Training Requirement", value: "Training Requirement" },
            ]}
          />
        </div>
        <Button className="mb-1">Generate</Button>
      </form>
    </div>
  );
}
