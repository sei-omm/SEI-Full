"use client";

import { MdOutlineSecurity } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import SearchForPermission from "../Settings/SearchForPermission";
import HandleSuspence from "../HandleSuspence";
import { useRef, useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { BASE_API } from "@/app/constant";
import { ISuccess, TMembers } from "@/types";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useDoMutation } from "@/app/utils/useDoMutation";
import Spinner from "../Spinner";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { useDispatch } from "react-redux";

type TTable = {
  heads: string[];
  body: (string | null)[][];
};

const getMembers = async (searchParams: ReadonlyURLSearchParams) => {
  return (
    await axios.get(`${BASE_API}/setting/member?${searchParams.toString()}`)
  ).data;
};

export default function PermissionManagement() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const selectedMemberId = useRef(-1);

  const [tableDatas, setTableDatas] = useState<TTable>({
    heads: ["Member", "Role", "Action"],
    body: [],
  });

  const { isFetching, error, data, refetch } = useQuery<ISuccess<TMembers[]>>({
    queryKey: ["get-members", searchParams.toString()],
    queryFn: () => getMembers(searchParams),
    onSuccess(data) {
      setTableDatas((prev) => ({
        ...prev,
        body: data.data.map((item) => [
          item.name,
          item.employee_role,
          "actionBtn",
        ]),
      }));
    },
    refetchOnMount: true,
  });

  const { isLoading, mutate } = useDoMutation();
  const deleteOneMember = (member_id?: number) => {
    if (!member_id) return alert("Please select a member to delete");

    if (!confirm("Are you sure you want to delete this member?")) return;

    selectedMemberId.current = member_id;

    mutate({
      apiPath: "/setting/member",
      method: "delete",
      id: member_id,
      onSuccess() {
        refetch();
      },
    });
  };

  const { isLoading: isChengingRole, mutate: setRole } = useDoMutation();
  const changeRole = (
    employeeRole: string,
    employee_id?: number,
    member_id?: number
  ) => {
    if (!employee_id || !member_id)
      return alert("Please select a member to change role");

    if (!confirm("Are you sure you want to change the role of this member?"))
      return;

    selectedMemberId.current = member_id;

    setRole({
      apiPath: "/setting/member/role",
      method: "patch",
      id: employee_id,
      formData: {
        role: employeeRole,
      },
      onSuccess() {
        refetch();
      },
    });
  };

  return (
    <div className="size-full py-5 space-y-10">
      <SearchForPermission />

      <div className="space-y-5">
        <h3 className="font-semibold">All Members</h3>

        <HandleSuspence
          isLoading={isFetching}
          error={error}
          dataLength={data?.data.length}
        >
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black card-shdow rounded-xl">
            <table className="min-w-max w-full table-auto">
              <thead className="uppercase w-full border-b border-gray-100">
                <tr>
                  {tableDatas.heads.map((item) => (
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
                {tableDatas.body.map((itemArray, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-100 group/bodyitem"
                  >
                    {itemArray.map((value, columnIndex) => (
                      <td
                        className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                        key={value}
                      >
                        {
                          <span className="line-clamp-1 inline-flex gap-x-3">
                            {columnIndex === 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="size-10 bg-gray-200 overflow-hidden rounded-full">
                                  <Image
                                    className="size-full object-cover"
                                    src={
                                      data?.data[rowIndex]?.profile_image ||
                                      "/placeholder_image.jpg"
                                    }
                                    alt="Employee Image"
                                    height={90}
                                    width={90}
                                    quality={100}
                                  />
                                </div>
                                <div>
                                  <span>{value}</span>
                                  <span className="block text-gray-500">
                                    {data?.data[rowIndex]?.employee_login_id}
                                  </span>
                                </div>
                              </div>
                            ) : columnIndex === 1 ? (
                              isChengingRole &&
                              selectedMemberId.current ===
                                data?.data[rowIndex]?.member_id ? (
                                <Spinner size="16px" />
                              ) : (
                                <select
                                  disabled={isChengingRole}
                                  onChange={(e) =>
                                    changeRole(
                                      e.currentTarget.value,
                                      data?.data[rowIndex]?.employee_id,
                                      data?.data[rowIndex]?.member_id
                                    )
                                  }
                                  className="cursor-pointer *:cursor-pointer bg-transparent min-w-full"
                                  defaultValue={value?.toString() || ""}
                                >
                                  <option value="Employee">Employee</option>
                                  <option value="Admin">Admin</option>
                                  <option value="HR">Hr</option>
                                </select>
                              )
                            ) : value === "actionBtn" ? (
                              <div className="flex items-center gap-3">
                                <MdOutlineSecurity
                                  onClick={() => {
                                    dispatch(
                                      setDialog({
                                        type: "OPEN",
                                        dialogId: "assign-permission",
                                        extraValue : {
                                          member_id : data?.data[rowIndex]?.member_id
                                        }
                                      })
                                    );
                                  }}
                                  size={16}
                                  className="active:scale-90 cursor-pointer"
                                />

                                {isLoading &&
                                selectedMemberId.current ===
                                  data?.data[rowIndex]?.member_id ? (
                                  <Spinner size="16px" />
                                ) : (
                                  <button
                                    disabled={isLoading}
                                    onClick={() =>
                                      deleteOneMember(
                                        data?.data[rowIndex]?.member_id
                                      )
                                    }
                                  >
                                    <AiOutlineDelete
                                      size={16}
                                      className="active:scale-90 cursor-pointer"
                                    />
                                  </button>
                                )}
                              </div>
                            ) : (
                              value
                            )}
                          </span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </HandleSuspence>
      </div>
    </div>
  );
}
