"use client";

import { useQuery } from "react-query";
import DropDown from "../DropDown";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { ISuccess } from "@/types";
import Button from "../Button";
import { CiSearch } from "react-icons/ci";
import { useRouter } from "next/navigation";
import HandleSuspence from "../HandleSuspence";

type TFiltersInfo = {
  floors: number[];
  number_of_rows: number[];
  capacities: number[];
};

export default function DurableFilter() {
  const { data, error, isFetching } = useQuery<ISuccess<TFiltersInfo>>({
    queryKey: "filters-info",
    queryFn: async () =>
      (await axios.get(`${BASE_API}/inventory/durable/filter-items`)).data,
  });

  const route = useRouter();

  const handleForm = (formData: FormData) => {
    const urlSearchParams = new URLSearchParams();
    formData.forEach((value, key) => {
      if (value.toString() != "-1") {
        urlSearchParams.set(key, value.toString());
      }
    });

    route.push(`/dashboard/inventory/durable?${urlSearchParams.toString()}`, {
      scroll: false,
    });
  };

  return (
    <HandleSuspence dataLength={1} isLoading={isFetching} error={error}>
      <form action={handleForm} className="flex items-end gap-5">
          <DropDown
            name="is_available"
            label="Availability"
            options={[
              { text: "Not Selected", value: -1 },
              { text: "Avilable", value: true },
              { text: "Not-Avilable", value: false },
            ]}
          />
          <DropDown
            name="floor"
            label="Floors"
            options={[
              { text: "Not Selected", value: -1 },
              ...data?.data.floors?.map?.(item => ({text : item.toString(), value : item})) || []
            ]}
          />
          <DropDown
            name="number_of_rows"
            label="Rows In Room"
            options={[
              { text: "Not Selected", value: -1 },
              ...data?.data.number_of_rows?.map?.(item => ({text : item.toString(), value : item})) || [],
            ]}
          />
          <DropDown
            name="capasity"
            label="Room Capasity"
            options={[
              { text: "Not Selected", value: -1 },
              ...data?.data.capacities?.map?.(item => ({text : item.toString(), value : item})) || [],
            ]}
          />
          <Button className="flex-center gap-3 mb-1">
            <CiSearch />
            Search
          </Button>
        </form>
    </HandleSuspence>
  );
}
