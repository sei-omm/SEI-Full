import React, { useState } from "react";
import Input from "../Input";
import TextArea from "../TextArea";
import { InfoLayout } from "./InfoLayout";
import Button from "../Button";
import { appraisalOptions, BASE_API } from "@/app/constant";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthToken } from "@/app/utils/getAuthToken";
import { useQuery } from "react-query";
import axios from "axios";
import { ISuccess, TAppraisal } from "@/types";

async function getSingleAppraisal(appraisalId: number) {
  return (await axios.get(`${BASE_API}/employee/appraisal/${appraisalId}`))
    .data;
}

export default function AppraisalForm() {
  const { mutate, isLoading } = useDoMutation();
  const searchParams = useSearchParams();
  const route = useRouter();

  // const parsedOptions = useRef<any>({});
  const [parsedOptions, setParsedOptions] = useState<any>(null);

  const isNew = searchParams.get("id") === "add";
  const appraisalID = searchParams.get("id");

  const {
    data: appraisal,
  } = useQuery<ISuccess<TAppraisal>>({
    queryKey: "get-single-appraisal",
    queryFn: () => getSingleAppraisal(parseInt(appraisalID || "0")),
    enabled: !isNew,
    onSuccess(data) {
      if (data.data.appraisal_options) {
        setParsedOptions(JSON.parse(data.data.appraisal_options))
      }
    },
  });

  function handleFormAction(formData: FormData) {
    //if for creating appraisal
    if (isNew) {
      mutate({
        apiPath: "/employee/appraisal",
        method: "post",
        headers: {
          "Content-Type": "application/json",
          ...getAuthToken(),
        },
        formData: {
          discipline: formData.get("discipline"),
          duties: formData.get("duties"),
          targets: formData.get("targets"),
          achievements: formData.get("achievements"),
        },
        onSuccess() {
          route.push("/account?tab=appraisal");
        },
      });
      return;
    }

    const dataToStore: any = {};
    const optionToObj: any = {};
    formData.forEach((value, key) => {
      if (key.includes("option-")) {
        optionToObj[key] = value;
      } else {
        dataToStore[key] = value;
      }
    });

    dataToStore["appraisal_options"] = JSON.stringify(optionToObj);

    mutate({
      apiPath: "/employee/appraisal",
      method: "put",
      headers: {
        "Content-Type": "application/json",
        ...getAuthToken(),
      },
      id: parseInt(appraisalID || "0"),
      formData: dataToStore,
      onSuccess() {
        route.push("/account?tab=otherapr");
      },
    });
  }

  return (
    <InfoLayout>
      <form action={handleFormAction} className="space-y-8">
        {/* Part 1 */}
        <div className="space-y-5">
          <h2 className="text-sm font-semibold text-yellow-700 text-center">
            Part I (to be filled by Faculty & Staff member)
          </h2>
          <Input
            required
            name="discipline"
            label="Discipline *"
            placeholder="Type here.."
            defaultValue={appraisal?.data.discipline}
          />

          <TextArea
            required
            name="duties"
            label="Brief description of duties (please mention point-wise) *"
            placeholder="Type here.."
            rows={6}
            defaultValue={appraisal?.data.duties}
          />

          <TextArea
            required
            name="targets"
            label="Specify targets / objectives / goals (in quantitative or other terms) of work you set for yourself or that were set for you, eight to ten items of work in the order of priority and your achievement against each target: *"
            placeholder="Type objectives here.."
            rows={6}
            defaultValue={appraisal?.data.targets}
          />

          <TextArea
            required
            name="achievements"
            label="Achievements *"
            placeholder="Type achievements here.."
            defaultValue={appraisal?.data.achievements}
          />
        </div>
        <Button loading={isLoading} disabled={isLoading} hidden={!isNew}>
          Submit
        </Button>
        {/* Part 2 */}
        <div className="space-y-5">
          <h2 className="text-sm font-semibold text-yellow-700 text-center">
            Part II (to be filled by reporting officer)
          </h2>

          <span className="font-bold">Instruction</span>
          <ul className="outline-dotted p-3 space-y-2 text-sm">
            <li>
              1) Please state whether you agree with the self appraisal of the
              Staff reported upon as mentioned. If not, please furnish the
              factual details
            </li>
            <li>
              2) Assessment of work output / personal attributes / functional
              competency. (Numerical grading is to be assigned by Reporting
              authority on a scale of 1-10, where 1 refers to the lowest and 10
              to the highest grade).
            </li>
          </ul>

          <ul className="space-y-4">
            {appraisalOptions.map((item, index) => {
              const previousGroup =
                index === 0 ? item.group : appraisalOptions[index - 1].group;
              return (
                <li key={item.id} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="flex-grow basis-60">
                      {index + 1}) {item.text}
                    </span>
                    <div className="basis-20">
                      <select
                        name={item.id}
                        disabled={isNew}
                        className="border border-gray-500 text-xs px-2 py-1 cursor-pointer outline-none"
                        defaultValue={parsedOptions?.[item.id]}
                        key={parsedOptions?.[item.id]}
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                      </select>
                    </div>
                  </div>
                  {previousGroup !== item.group ? (
                    <div className="w-full flex-center">
                      <div className="w-[70%] h-[1px] border border-gray-500 border-dotted"></div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <Input
            name="state_of_health"
            viewOnly={isNew}
            viewOnlyText="NA"
            label="State of Health"
            placeholder="Type here.."
            defaultValue={appraisal?.data.state_of_health}
          />
          <Input
            name="integrity"
            viewOnly={isNew}
            viewOnlyText="NA"
            label="Integrity"
            placeholder="Type here.."
            defaultValue={appraisal?.data.integrity}
          />
        </div>
        <Button loading={isLoading} disabled={isLoading} hidden={isNew}>
          Submit
        </Button>
      </form>
    </InfoLayout>
  );
}
