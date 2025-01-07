import { getAuthTokenServer } from "@/app/actions/cookies";
import { BASE_API } from "@/app/constant";
import { CustomErrorPage } from "@/components/CustomErrorPage";
import LeaveActionButtons from "@/components/LeaveActionButtons";
import Pagination from "@/components/Pagination";
import TagsBtn from "@/components/TagsBtn";
import { ILeave, ISuccess } from "@/types";
import Image from "next/image";

const tableDatas = {
  heads: ["Name", "Leave From", "Leave To", "Description", "Status", "Action"],
  body: [
    [
      "Somnath Gupta",
      "12 Jun, 2024",
      "15 Jun, 2024",
      "Wedding leave",
      "approve",
      "action",
    ],
    [
      "Arindam Gupta",
      "12 Jun, 2024",
      "12 Jun 2024",
      "Medical leave",
      "decline",
      "action",
    ],
  ],
};
interface IProps {
  searchParams: any;
}

export default async function page({ searchParams }: IProps) {
  const AUTH_TOKEN_OBJ = await getAuthTokenServer();
  
  const urlSearchParams = new URLSearchParams(searchParams);
  const response = await fetch(
    `${BASE_API}/hr/leave?${urlSearchParams.toString()}`,
    {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...AUTH_TOKEN_OBJ,
      },
    }
  );
  if (!response.ok) return <CustomErrorPage message={response.statusText} />;

  const result = (await response.json()) as ISuccess<ILeave[]>;

  tableDatas.body = result.data.map((leaveInfo) => [
    leaveInfo.employee_name,
    leaveInfo.leave_from,
    leaveInfo.leave_to,
    leaveInfo.leave_reason,
    leaveInfo.leave_status,
    "action",
  ]);

  return (
    <section>
      <h2 className="text-xl font-semibold py-5">Pending Leave Requests</h2>
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
            {tableDatas.body.map((itemArray, index) => (
              <tr key={index} className="hover:bg-gray-100 group/bodyitem">
                {itemArray.map((value, childItemIndex) => (
                  <td
                    className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                    key={value}
                  >
                    <span className="line-clamp-1 inline-flex gap-x-3">
                      {value === "action" ? (
                        <LeaveActionButtons leaveINFO={result.data[index]} />
                      ) : childItemIndex === 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="size-10 bg-gray-200 overflow-hidden rounded-full">
                            <Image
                              className="size-full object-cover"
                              src={result.data[index].employee_profile_image}
                              alt="Employee Image"
                              height={90}
                              width={90}
                              quality={100}
                            />
                          </div>
                          {value}
                        </div>
                      ) : value === "success" ? (
                        <TagsBtn type="SUCCESS">Approve</TagsBtn>
                      ) : value === "decline" ? (
                        <TagsBtn type="FAILED">Decline</TagsBtn>
                      ) : value === "pending" ? (
                        <TagsBtn type="PENDING">Pending</TagsBtn>
                      ) : childItemIndex === 1 || childItemIndex === 2 ? (
                        new Date(value).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      ) : (
                        value
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
