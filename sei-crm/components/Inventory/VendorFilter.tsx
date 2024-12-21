"use client";

import { useQuery } from "react-query";
import DropDown from "../DropDown";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { ISuccess } from "@/types";
import HandleDataSuspense from "../HandleDataSuspense";
import Button from "../Button";
import { CiSearch } from "react-icons/ci";
import { useRouter } from "next/navigation";

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
    <HandleDataSuspense data={data?.data} isLoading={isFetching} error={error}>
      {(filterInfo) => (
        <form action={handleForm} className="flex items-end justify-between *:flex-grow gap-5">
          <DropDown
            name="institute"
            label="Institute"
            options={[
              { text: "Not Selected", value: -1 },
              { text: "Kolkata", value: "Kolkata" },
              { text: "Faridabad", value: "Faridabad" },
            ]}
          />
          <DropDown
            name="service_type"
            label="Type of Service"
            options={[
              { text: "Not Selected", value: -1 },
              ...filterInfo.service_type.map((item) => ({
                text: item,
                value: item,
              })),
            ]}
          />
          <Button className="flex-center gap-3 mb-1">
            <CiSearch />
            Search
          </Button>
        </form>
      )}
    </HandleDataSuspense>
  );
}
