import React, { useState } from "react";
import Input from "../Input";
import TextArea from "../TextArea";
import { InfoLayout } from "./InfoLayout";
import Button from "../Button";
import { appraisalOptions, BASE_API } from "@/app/constant";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { useRouter, useSearchParams } from "next/navigation";
// import { getAuthToken } from "@/app/utils/getAuthToken";
import { useQuery } from "react-query";
import axios from "axios";
import { ISuccess, TAppraisal } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { beautifyDate } from "@/app/utils/beautifyDate";
import { calculateAge } from "@/app/utils/calculateAge";
import BackBtn from "../BackBtn";
import { FcApproval } from "react-icons/fc";
import { IoMdCloseCircle } from "react-icons/io";
import { useIsAuthenticated } from "@/app/hooks/useIsAuthenticated";

async function getSingleAppraisal(appraisalId: number) {
  return (await axios.get(`${BASE_API}/employee/appraisal/${appraisalId}`))
    .data;
}

interface IProps {
  wrapperClassName?: string;
  disableAll?: boolean; // Make it optional
}

export default function AppraisalForm({
  wrapperClassName,
  disableAll = false,
}: IProps) {
  const { mutate, isLoading } = useDoMutation();
  const searchParams = useSearchParams();
  const route = useRouter();
  const { userInfo } = useIsAuthenticated();

  // const parsedOptions = useRef<any>({});
  const [parsedOptionsEmployee, setParsedOptionsEmployee] = useState<any>(null);
  const [parsedOptionsHod, setParsedOptionsHod] = useState<any>(null);

  const isNew = searchParams.get("id") === "add";
  const appraisalID = searchParams.get("id");

  const { data: appraisal } = useQuery<ISuccess<TAppraisal>>({
    queryKey: ["get-single-appraisal", searchParams.get("id")],
    queryFn: () => getSingleAppraisal(parseInt(appraisalID || "0")),
    onSuccess(data) {
      if (data.data.appraisal_info.appraisal_options_employee) {
        setParsedOptionsEmployee(
          JSON.parse(data.data.appraisal_info.appraisal_options_employee)
        );
      }
      if (data.data.appraisal_info.appraisal_options_hod) {
        setParsedOptionsHod(
          JSON.parse(data.data.appraisal_info.appraisal_options_hod)
        );
      }
    },
    refetchOnMount: true,
  });

  function handleFormAction(formData: FormData) {
    const dataToStore: any = {};
    const optionToObjHod: any = {};
    const optionToObjEmployee: any = {};

    formData.forEach((value, key) => {
      if (key.includes("employee-option-")) {
        optionToObjEmployee[key] = value;
      } else if (key.includes("hod-option-") && !isNew) {
        optionToObjHod[key] = value;
      } else {
        dataToStore[key] = value;
      }
    });

    dataToStore["appraisal_options_employee"] =
      JSON.stringify(optionToObjEmployee);

    //if for creating appraisal
    if (isNew) {
      delete dataToStore["state_of_health"];
      delete dataToStore["integrity"];

      mutate({
        apiPath: "/employee/appraisal",
        method: "post",
        // headers: {
        //   "Content-Type": "application/json",
        //   ...getAuthToken(),
        // },
        formData: dataToStore,
        onSuccess() {
          route.push("/account?tab=appraisal");
        },
      });
      return;
    }

    dataToStore["appraisal_options_hod"] = JSON.stringify(optionToObjHod);
    dataToStore["appraisal_options_employee"] =
      JSON.stringify(optionToObjEmployee);

    mutate({
      apiPath: "/employee/appraisal",
      method: "put",
      // headers: {
      //   "Content-Type": "application/json",
      //   ...getAuthToken(),
      // },
      id: parseInt(appraisalID || "0"),
      formData: dataToStore,
      onSuccess() {
        route.push("/account?tab=otherapr");
      },
    });
  }

  return (
    <>
      {appraisal ? (
        <InfoLayout className={`space-y-3 ${wrapperClassName}`}>
          <h2 className="text-sm font-semibold text-yellow-700 text-center">
            Appraisal Of
          </h2>

          <div className="flex items-start gap-5">
            <Link
              href={appraisal?.data.appraisal_of_info.profile_image || ""}
              target="__blank"
              className="size-36 block cursor-pointer overflow-hidden rounded-xl"
            >
              <Image
                src={appraisal?.data.appraisal_of_info.profile_image || ""}
                alt="Profile Image"
                height={200}
                width={200}
                quality={100}
                className="size-full object-cover"
                objectFit="cover"
              />
            </Link>

            <div className="space-y-1">
              <h2 className="font-semibold">
                {appraisal?.data.appraisal_of_info.name}
              </h2>
              <div className="flex flex-col gap-1">
                <span className="text-sm">
                  <span className="font-semibold text-gray-600">
                    Date of Birth
                  </span>{" "}
                  : {beautifyDate(appraisal?.data.appraisal_of_info.dob || "")}
                </span>
                <span className="text-sm">
                  <span className="font-semibold text-gray-600">Age</span> :{" "}
                  {calculateAge(appraisal?.data.appraisal_of_info.dob || "")}
                </span>
                <span className="text-sm">
                  <span className="font-semibold text-gray-600">
                    Date Of Joining
                  </span>{" "}
                  :{" "}
                  {beautifyDate(
                    appraisal?.data.appraisal_of_info.joining_date || ""
                  )}
                </span>
                <span className="text-sm">
                  <span className="font-semibold text-gray-600">Authority</span> :{" "}
                  {appraisal?.data.appraisal_of_info.authority}
                </span>
                <span className="text-sm">
                  <span className="font-semibold text-gray-600">Department</span> :{" "}
                  {appraisal?.data.appraisal_of_info.department_name}
                </span>
              </div>
            </div>
          </div>
        </InfoLayout>
      ) : null}

      <InfoLayout className={wrapperClassName}>
        <form action={handleFormAction} className="space-y-8">
          {/* Part 1 */}
          <div className="space-y-5">
            <h2 className="text-sm font-semibold text-yellow-700 text-center">
              Part I (to be filled by Faculty & Staff member)
            </h2>
            <Input
              key={isNew + " 1"}
              required
              name="discipline"
              label="Discipline *"
              placeholder="Type here.."
              defaultValue={appraisal?.data.appraisal_info.discipline}
              viewOnly={!isNew || disableAll}
            />

            <TextArea
              key={isNew + " 2"}
              required
              name="duties"
              label="Brief description of duties (please mention point-wise) *"
              placeholder="Type here.."
              rows={6}
              defaultValue={appraisal?.data.appraisal_info.duties}
              viewOnly={!isNew || disableAll}
            />

            <TextArea
              key={isNew + " 3"}
              required
              name="targets"
              label="Specify targets / objectives / goals (in quantitative or other terms) of work you set for yourself or that were set for you, eight to ten items of work in the order of priority and your achievement against each target: *"
              placeholder="Type objectives here.."
              rows={6}
              defaultValue={appraisal?.data.appraisal_info.targets}
              viewOnly={!isNew || disableAll}
            />

            <TextArea
              key={isNew + " 4"}
              required
              name="achievements"
              label="Achievements *"
              placeholder="Type achievements here.."
              defaultValue={appraisal?.data.appraisal_info.achievements}
              viewOnly={!isNew || disableAll}
            />
          </div>
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
                authority on a scale of 1-10, where 1 refers to the lowest and
                10 to the highest grade).
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
                      <div className="basis-20 flex items-start gap-6">
                        <div className="space-y-2">
                          {index === 0 ? (
                            <span className="text-xs font-semibold">
                              Employee
                            </span>
                          ) : null}
                          <select
                            name={"employee-" + item.id}
                            className="border border-gray-500 text-xs px-2 py-1 cursor-pointer outline-none"
                            defaultValue={
                              parsedOptionsEmployee?.["employee-" + item.id]
                            }
                            key={parsedOptionsEmployee?.["employee-" + item.id]}
                            disabled={!isNew || disableAll}
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
                        <div className="space-y-2">
                          {index === 0 ? (
                            <span className="text-xs font-semibold">
                              HOI/HOD
                            </span>
                          ) : null}
                          <select
                            name={"hod-" + item.id}
                            disabled={isNew || disableAll}
                            className="border border-gray-500 text-xs px-2 py-1 cursor-pointer outline-none"
                            defaultValue={parsedOptionsHod?.["hod-" + item.id]}
                            key={parsedOptionsHod?.["hod-" + item.id]}
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
              viewOnly={isNew || disableAll}
              viewOnlyText="NA"
              label="State of Health"
              placeholder="Type here.."
              defaultValue={appraisal?.data.appraisal_info.state_of_health}
            />
            <Input
              name="integrity"
              viewOnly={isNew || disableAll}
              viewOnlyText="NA"
              label="Integrity"
              placeholder="Type here.."
              defaultValue={appraisal?.data.appraisal_info.integrity}
            />
          </div>

          {appraisal ? (
            <div className="flex items-center flex-wrap gap-4">
              {appraisal?.data.appraisal_info.sended_to.map((item) =>
                item.status === "Pending" ? null : (
                  <span
                    key={item.employee_id}
                    className={`font-semibold flex items-center gap-2 ${
                      item.status === "Approved" ? "bg-green-600" : "bg-red-600"
                    }  text-white py-1 px-4 rounded-xl`}
                  >
                    <span className="text-xs">
                      {item.status === "Approved"
                        ? "Approved By "
                        : "Rejected By "}{" "}
                      {userInfo?.employee_id === item.employee_id
                        ? "You"
                        : item.name}
                    </span>
                    {item.status === "Approved" ? (
                      <FcApproval size={20} />
                    ) : (
                      <IoMdCloseCircle size={20} />
                    )}
                  </span>
                )
              )}
            </div>
          ) : null}

          <div
            className={`flex items-center gap-4 ${isNew ? "hidden" : "block"}`}
          >
            <BackBtn />
            {!disableAll && (
              <Button loading={isLoading} disabled={isLoading}>
                Submit
              </Button>
            )}
          </div>

          <div
            className={`flex items-center gap-4 ${isNew ? "block" : "hidden"}`}
          >
            <BackBtn />
            {!disableAll && (
              <Button loading={isLoading} disabled={isLoading}>
                Submit
              </Button>
            )}
          </div>
        </form>
      </InfoLayout>
    </>
  );
}
