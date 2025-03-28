"use client";

import { useQuery } from "react-query";
import DropDown from "../DropDown";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { ISuccess } from "@/types";
import Button from "../Button";
import { CiSearch } from "react-icons/ci";
import { useRouter, useSearchParams } from "next/navigation";
import HandleSuspence from "../HandleSuspence";
import Campus from "../Campus";

type TFiltersInfo = {
  service_type: string[];
};

export default function VendorFilter() {
  const { data, error, isFetching } = useQuery<ISuccess<TFiltersInfo>>({
    queryKey: "filters-info",
    queryFn: async () =>
      (await axios.get(`${BASE_API}/inventory/vendor/filter-items`)).data,
  });

  const route = useRouter();
  const searchParams = useSearchParams();

  const handleForm = (formData: FormData) => {
    const urlSearchParams = new URLSearchParams();
    formData.forEach((value, key) => {
      if (value.toString() != "-1") {
        urlSearchParams.set(key, value.toString());
      }
    });

    route.push(`/dashboard/vendor?${urlSearchParams.toString()}`, {
      scroll: false,
    });
  };

  return (
    <HandleSuspence dataLength={1} isLoading={isFetching} error={error}>
      <form
        action={handleForm}
        className="flex items-end justify-between *:flex-grow gap-5"
      >
        {/* <DropDown
          name="institute"
          label="Campus"
          options={[
            { text: "Not Selected", value: -1 },
            { text: "Kolkata", value: "Kolkata" },
            { text: "Faridabad", value: "Faridabad" },
          ]}
          defaultValue={searchParams.get("institute") || -1}
        /> */}
        <Campus />
        <DropDown
          name="service_type"
          label="Type of Service"
          options={[
            { text: "Not Selected", value: -1 },
            ...(data?.data.service_type?.map?.((item) => ({
              text: item,
              value: item,
            })) || []),
          ]}
          defaultValue={searchParams.get("service_type") || -1}
        />
        <Button className="flex-center gap-3 mb-1">
          <CiSearch />
          Search
        </Button>
      </form>
    </HandleSuspence>
  );
}
