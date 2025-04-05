"use client";

import { useFieldArray, useForm } from "react-hook-form";
import Button from "../Button";
import InputNew from "../FormInputs/InputNew";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useDoMutation } from "@/app/utils/useDoMutation";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import HandleSuspence from "../HandleSuspence";
import { ISuccess } from "@/types";
import { useRef, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { MdOutlineDeleteOutline } from "react-icons/md";
import Spinner from "../Spinner";
import { usePurifySearchParams } from "@/hooks/usePurifySearchParams";
import Campus from "../Campus";

const socialLinkSchema = z.object({
  social_platform: z
    .string()
    .min(1, { message: "Social Platform Name Is Required" }),
  link: z.string().min(1, { message: "Social Link Is Required" }),
  icon: z.string().min(1, { message: "Social Icon Is Required" }),
  institute: z.string().min(1, { message: "Institute Is Required" }),
});

const formSchema = z.object({
  social_links: z.array(socialLinkSchema), // ✅ use array
});

type FormType = z.infer<typeof formSchema>;

type TSocialLinks = {
  social_link_id: number;
  social_platform: string;
  link: string;
  icon: string;
  institute: string;
};

async function getSocialLinks(searchParams: URLSearchParams) {
  return (
    await axios.get(`${BASE_API}/website/social?${searchParams.toString()}`)
  ).data;
}

type TTable = {
  heads: string[];
  body: (string | null)[][];
};

export default function SocialLinks() {
  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: ["Platform Name", "Platform Link", "Icon", "Action"],
    body: [],
  });
  const searchParams = usePurifySearchParams();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      social_links: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "social_links",
    control,
  });

  const { data, isFetching, error, refetch } = useQuery<
    ISuccess<TSocialLinks[]>
  >({
    queryKey: ["social-links", searchParams.toString()],
    queryFn: () => getSocialLinks(searchParams),
    onSuccess(data) {
      setTableDatas((prev) => ({
        ...prev,
        body: data.data.map((item) => [
          item.social_platform,
          item.link,
          item.icon,
          "actionBtn",
        ]),
      }));
    },

    refetchOnMount: true,
  });

  const { isLoading: isDeletingRow, mutate: deleteRow } = useDoMutation();
  const whichIndexClicked = useRef(0);
  const handleDelete = (rowIndex: number) => {
    if (!confirm("Are you sure you want to delete ?")) return;

    whichIndexClicked.current = rowIndex;
    deleteRow({
      apiPath: "/website/social",
      method: "delete",
      id: data?.data[rowIndex].social_link_id,
      onSuccess() {
        refetch();
      },
    });
  };

  const updateIds = useRef<number[]>([]);
  const { isLoading: isUpdating, mutate: setUpdate } = useDoMutation();
  const handleUpdate = (data: FormType) => {
    setUpdate({
      apiPath: "/website/social",
      method: "put",
      formData: data.social_links.map((item, index) => ({
        social_link_id: updateIds.current[index],
        social_platform: item.social_platform,
        icon: item.icon,
        link: item.link,
        institute: item.institute,
      })),
      onSuccess() {
        reset({
          social_links: [],
        });
        refetch();
      },
    });
  };

  const { isLoading, mutate } = useDoMutation();
  const storeNewData = (data: FormType) => {
    mutate({
      apiPath: "/website/social",
      method: "post",
      formData: data.social_links,
      onSuccess() {
        reset({
          social_links: [],
        });
        refetch();
      },
    });
  };
  const handleFormSubmit = (data: FormType) => {
    if (updateIds.current.length === 0) {
      storeNewData(data);
    } else {
      handleUpdate(data);
    }
  };

  return (
    <main className="space-y-5">
      <div className="flex items-center justify-between">
        {/* <h2 className="font-semibold text-xl">Social Links</h2> */}
        <Campus changeSearchParamsOnChange label="Filter With Campus" />

        <Button
          onClick={() => {
            append({
              social_platform: "",
              link: "",
              icon: "",
              institute: searchParams.get("institute") || "",
            });
          }}
          className="flex items-center gap-3"
        >
          <span>+</span> <span>Add Links</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <ul>
          {fields.map((item, index) => (
            <li key={item.id} className="mb-4 flex items-center gap-5">
              <InputNew
                {...register(`social_links.${index}.social_platform`)}
                wrapperCss="flex-1"
                placeholder="Platform Name"
                error={errors.social_links?.[index]?.social_platform?.message}
              />
              <InputNew
                {...register(`social_links.${index}.link`)}
                wrapperCss="flex-1"
                placeholder="Link"
                error={errors.social_links?.[index]?.link?.message}
              />
              <InputNew
                {...register(`social_links.${index}.icon`)}
                wrapperCss="flex-1"
                placeholder="Icon"
                error={errors.social_links?.[index]?.icon?.message}
              />
              <Button
                type="button"
                onClick={() => {
                  remove(index);
                  updateIds.current.splice(index, 1);
                }}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>

        {errors.root ? (
          <p className="text-sm text-red-600">{errors.root.message}</p>
        ) : null}

        {fields.length !== 0 ? (
          <Button
            loading={isLoading || isUpdating}
            disabled={isLoading || isUpdating}
            type="submit"
          >
            Submit
          </Button>
        ) : null}
      </form>

      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={data?.data.length}
      >
        <div className="w-full overflow-hidden card-shdow">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
            <table className="min-w-max w-full table-auto">
              <thead className="uppercase w-full border-b border-gray-100">
                <tr>
                  {tableDatas.heads?.map?.((item) => (
                    <th
                      className="text-left text-[14px] font-semibold pb-2 px-5 py-4"
                      key={item}
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableDatas.body?.map?.((itemArray, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-100 group/bodyitem"
                  >
                    {itemArray.map((value, columnIndex) => (
                      <td
                        className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                        key={value}
                      >
                        {columnIndex === 2 ? (
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="size-10 bg-gray-600 flex items-center justify-center overflow-hidden">
                              <div
                                className="size-[20px]"
                                dangerouslySetInnerHTML={{
                                  __html: data?.data[rowIndex]?.icon || "",
                                }}
                              ></div>
                            </div>
                          </div>
                        ) : value === "actionBtn" ? (
                          <div className="flex items-center gap-3">
                            <CiEdit
                              onClick={() => {
                                append({
                                  icon: data?.data[rowIndex].icon || "",
                                  link: data?.data[rowIndex].link || "",
                                  institute:
                                    data?.data[rowIndex].institute || "",
                                  social_platform:
                                    data?.data[rowIndex].social_platform || "",
                                });
                                updateIds.current.push(
                                  data?.data[rowIndex].social_link_id || 0
                                );
                              }}
                              className="cursor-pointer"
                              size={18}
                            />
                            {isDeletingRow &&
                            whichIndexClicked.current === rowIndex ? (
                              <Spinner size="16px" />
                            ) : (
                              <MdOutlineDeleteOutline
                                onClick={() => handleDelete(rowIndex)}
                                className="cursor-pointer"
                                size={18}
                              />
                            )}
                          </div>
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </HandleSuspence>
    </main>
  );
}
