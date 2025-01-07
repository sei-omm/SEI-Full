import Image from "next/image";
import { BASE_API } from "@/app/constant";
import { ISuccess } from "@/types";
import AttendanceActionBtn from "@/components/AttendanceActionBtn";
import SelectDate from "@/components/SelectDate";
import DownloadFormUrl from "@/components/DownloadFormUrl";
import Button from "@/components/Button";
import { LuFileSpreadsheet } from "react-icons/lu";
import Pagination from "@/components/Pagination";

interface IProps {
  searchParams: string;
}

type TableTypes = {
  heads: string[];
  body: string[][];
};

export default async function page({ searchParams }: IProps) {
  const sParams = new URLSearchParams(searchParams);

  const tables: TableTypes = {
    heads: [],
    body: [],
  };

  const response = await fetch(
    BASE_API + "/hr/attendance?" + sParams.toString(),
    {
      cache: "no-cache",
    }
  );
  const result = (await response.json()) as ISuccess<any[]>;

  result.data?.forEach((item, index) => {
    const tempBody: string[] = [];
    for (const [key, value] of Object.entries(item)) {
      if (key != "employee_id" && key != "profile_image") {
        if (index == 0) {
          tables.heads.push(key);
        }
        tempBody.push(value as string);
      }
    }
    tables.body[index] = tempBody;
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
            BASE_API + "/hr/attendance/export-sheet?" + sParams.toString()
          }
        >
          <Button className="!bg-[#34A853] flex-center gap-4">
            <LuFileSpreadsheet size={20} />
            Generate Excel Sheet
          </Button>
        </DownloadFormUrl>
      </div>

      {/* table info */}
      <div className="w-full overflow-x-auto card-shdow">
        <table className="min-w-max w-full table-auto">
          <thead className="uppercase w-full border-b border-gray-100">
            <tr>
              {tables?.heads.map((item, index) => (
                <th
                  className={`text-left text-[14px] font-semibold pb-2 px-5 py-4 ${
                    index === 0 ? "sticky left-0 z-10 bg-white p-0" : ""
                  }`}
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
              <tr key={index} className={``}>
                {itemArray.map((value, childItemIndex) => (
                  <td
                    className={`text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52 ${
                      childItemIndex === 0 ? "sticky left-0 z-10 bg-white" : ""
                    }`}
                    key={childItemIndex}
                  >
                    <span className="line-clamp-1 inline-flex gap-x-3">
                      {childItemIndex === 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="size-10 border border-gray-300 overflow-hidden rounded-full">
                            <Image
                              className="size-full object-cover"
                              src={result.data[index].profile_image}
                              alt="Employee Image"
                              height={90}
                              width={90}
                              quality={100}
                            />
                          </div>
                          {value}
                        </div>
                      ) : (
                        <AttendanceActionBtn
                          date={tables.heads[childItemIndex]}
                          value={value}
                          employee_id={result.data[index].employee_id}
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

      <Pagination dataLength={result?.data.length} />
    </section>
  );
}
