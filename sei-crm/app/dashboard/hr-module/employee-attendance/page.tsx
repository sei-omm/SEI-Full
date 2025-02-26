"use client";

import Image from "next/image";
import { BASE_API } from "@/app/constant";
import { IError, ISuccess } from "@/types";
import AttendanceActionBtn from "@/components/AttendanceActionBtn";
import SelectDate from "@/components/SelectDate";
import DownloadFormUrl from "@/components/DownloadFormUrl";
import Button from "@/components/Button";
import { LuFileSpreadsheet } from "react-icons/lu";
import Pagination from "@/components/Pagination";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import HandleSuspence from "@/components/HandleSuspence";
import { axiosQuery } from "@/utils/axiosQuery";
import { toast } from "react-toastify";
import { useLoadingDialog } from "@/app/hooks/useLoadingDialog";
import { stickyFirstCol } from "@/app/utils/stickyFirstCol";

type TableTypes = {
  heads: string[];
  body: string[][];
};

type TAttendanceUpdate = {
  employee_id: number;
  attendance_option: string;
  attendance_date: string;
};

async function getAttendance(searchParams: ReadonlyURLSearchParams) {
  return (
    await axios.get(`${BASE_API}/hr/attendance?${searchParams.toString()}`)
  ).data;
}

export default async function EmployeeAttendance() {
  const searchParams = useSearchParams();
  const [tables, setTables] = useState<TableTypes>();

  const attendanceToUpdate = useRef<TAttendanceUpdate[]>([]);
  const { openDialog, closeDialog } = useLoadingDialog();

  const { data, isFetching, error } = useQuery<ISuccess<any[]>>({
    queryKey: ["get-attendance", searchParams.toString()],
    queryFn: () => getAttendance(searchParams),
    onSuccess(data) {
      const heads: string[] = [];
      const body: string[][] = [];

      data.data.forEach((item, index) => {
        const tempBody: string[] = [];
        for (const [key, value] of Object.entries(item)) {
          if (key != "employee_id" && key != "profile_image") {
            if (index == 0) {
              heads.push(key);
            }
            tempBody.push(value as string);
          }
        }
        body[index] = tempBody;
      });

      setTables({ heads, body });
    },
    refetchOnMount: true,
  });

  return (
    <section className="w-full space-y-5">
      <div className="flex items-center justify-between">
        {/* <h2 className="font-semibold text-xl text-foreground">
          Employee&apos;s Attendance
        </h2> */}
        <SelectDate />
      </div>

      <div className="flex items-center justify-end">
        <DownloadFormUrl
          urlToDownload={
            BASE_API + "/hr/attendance/export-sheet?" + searchParams.toString()
          }
        >
          <Button className="!bg-[#34A853] flex-center gap-4">
            <LuFileSpreadsheet size={20} />
            Generate Excel Sheet
          </Button>
        </DownloadFormUrl>
      </div>

      {/* table info */}
      <HandleSuspence
        isLoading={isFetching}
        error={error}
        dataLength={data?.data.length}
      >
        <div className="w-full overflow-x-auto card-shdow">
          <table className="min-w-max w-full table-auto">
            <thead className="uppercase w-full border-b border-gray-100">
              <tr>
                {tables?.heads.map((item, index) => (
                  <th
                    className={`text-left text-[14px] font-semibold pb-2 px-5 py-4 ${stickyFirstCol(
                      index
                    )}`}
                    key={index}
                  >
                    {index !== 0
                      ? new Date(item).toLocaleString("en-US", {
                          day: "numeric",
                          month: "short",
                        })
                      : item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="relative">
              {tables?.body.map((itemArray, index) => (
                <tr key={index}>
                  {itemArray.map((value, childItemIndex) => (
                    <td
                      className={`text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52 ${stickyFirstCol(
                        childItemIndex
                      )}`}
                      key={`${index}${childItemIndex}`}
                    >
                      <span className="inline-flex gap-x-3">
                        {childItemIndex === 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="size-12">
                              <div className="size-10 border border-gray-300 overflow-hidden rounded-full">
                                <Image
                                  className="size-full object-cover"
                                  src={data?.data[index].profile_image}
                                  alt="Employee Image"
                                  height={100}
                                  width={100}
                                  quality={100}
                                />
                              </div>
                            </div>
                            {value}
                          </div>
                        ) : (
                          <AttendanceActionBtn
                            onChange={(value) => {
                              const attendance_info = [
                                ...attendanceToUpdate.current,
                              ];
                              const indexAlreadyExist =
                                attendance_info.findIndex(
                                  (item) =>
                                    item.employee_id ===
                                      (data?.data[index].employee_id || 0) &&
                                    item.attendance_date ===
                                      tables?.heads[childItemIndex]
                                );
                              if (indexAlreadyExist === -1) {
                                attendance_info.push({
                                  employee_id:
                                    data?.data[index].employee_id || 0,
                                  attendance_date:
                                    tables?.heads[childItemIndex],
                                  attendance_option: value,
                                });
                              } else {
                                attendance_info[indexAlreadyExist] = {
                                  employee_id:
                                    data?.data[index].employee_id || 0,
                                  attendance_date:
                                    tables?.heads[childItemIndex],
                                  attendance_option: value,
                                };
                              }
                              attendanceToUpdate.current = attendance_info;
                            }}
                            value={value}
                          />
                        )}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HandleSuspence>
      <div className="flex items-center justify-end pt-3">
        <Button
          onClick={async () => {
            openDialog();
            const { error, response } = await axiosQuery<IError, ISuccess>({
              url: `${BASE_API}/hr/attendance`,
              method: "PATCH",
              data: attendanceToUpdate.current,
            });

            closeDialog();
            if (error) toast.error(error.message);

            toast.success(response?.message);
            attendanceToUpdate.current = [];
          }}
        >
          Save Changes
        </Button>
      </div>

      <Pagination dataLength={data?.data.length} />
    </section>
  );
}
