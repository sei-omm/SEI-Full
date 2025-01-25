import React from "react";
import DropDown from "./DropDown";
import DateInput from "./DateInput";
import Button from "./Button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Input from "./Input";
import { STUDENT_RANKS } from "@/app/constant";

interface IProps {
  withMoreFilter?: boolean;
  withStudentRank?: boolean;
}

export default function DateDurationFilter({
  withMoreFilter,
  withStudentRank,
}: IProps) {
  const searchParams = useSearchParams();
  const route = useRouter();
  const pathname = usePathname();

  // const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   const formData = new FormData(event.currentTarget);

  //   const searchParams = new URLSearchParams();
  //   searchParams.set("institute", `${formData.get("institute")}`);
  //   searchParams.set("from_date", `${formData.get("from_date")}`);
  //   searchParams.set("to_date", `${formData.get("to_date")}`);
  //   route.push(`${pathname}?${searchParams.toString()}`);
  // };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const urlSearchParams = new URLSearchParams();

    if (formData.has("form_1")) {
      formData.delete("form_1");

      formData.forEach((value, key) => {
        if (value !== "" && urlSearchParams.size === 0) {
          urlSearchParams.set(key, value.toString());
        }
      });
    }

    if (formData.has("form_2")) {
      formData.delete("form_2");

      formData.forEach((value, key) => {
        urlSearchParams.set(key, value.toString());
      });
    }

    route.push(`${pathname}?${urlSearchParams.toString()}`);
  };

  return (
    <div className="w-full">
      {withMoreFilter ? (
        <>
          <form
            onSubmit={handleFormSubmit}
            className="w-full flex items-end justify-between *:flex-grow gap-x-5 pb-5"
          >
            <input name="form_1" hidden />
            <Input name="form_id" label="Form ID" placeholder="Type here.." />
            <span className="text-xs">OR</span>
            <Input
              name="indos_number"
              label="INDOS No."
              placeholder="Type here.."
            />
            <span className="text-xs">OR</span>
            <Input name="cdc_num" label="CDC No." placeholder="Type here.." />
            <span className="text-xs">OR</span>
            <Input
              name="passport_num"
              label="Passport No."
              placeholder="Type here.."
            />
            <div className="mb-2">
              <Button>Search</Button>
            </div>
          </form>
          <span className="font-semibold">OR</span>
        </>
      ) : null}

      <form
        onSubmit={handleFormSubmit}
        className="flex items-end gap-5 *:flex-grow"
      >
        <input name="form_2" hidden />
        {withStudentRank ? (
          <DropDown
            // onChange={(item) => setInstitute(item.value)}
            key={"student_rank"}
            name="rank"
            label="Student Rank"
            options={STUDENT_RANKS.map((item) => ({ text: item, value: item }))}
            defaultValue={searchParams.get("rank") || STUDENT_RANKS[0]}
          />
        ) : null}

        <DropDown
          name="institute"
          label="Campus"
          options={[
            { text: "Kolkata", value: "Kolkata" },
            { text: "Faridabad", value: "Faridabad" },
          ]}
          defaultValue={searchParams.get("institute") || "Kolkata"}
        />

        <DateInput
          required
          label="From Date"
          name="from_date"
          date={searchParams.get("from_date")}
        />

        <DateInput
          required
          label="To Date"
          name="to_date"
          date={searchParams.get("to_date")}
        />

        <div className="!mb-2 !flex-grow-0 flex items-center gap-5">
          <Button className="">Search</Button>
        </div>
      </form>
    </div>
  );
}
