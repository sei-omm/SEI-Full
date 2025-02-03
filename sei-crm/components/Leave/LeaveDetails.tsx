import React from "react";

type TTable = {
  head: string[];
  body: string[][];
};

export default function LeaveDetails() {
  const tableDatas: TTable = {
    head: [
      "Year",
      "Campus",
      "Casual Leave",
      "Sick Leave",
      "EL",
      "Paid Maternity Leave",
    ],
    body: [["2025", "Kolkata", "10", "10", ""]],
  };

  return (
    <div className="py-10">
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black card-shdow rounded-xl">
        <table className="min-w-max w-full table-auto">
          <thead className="uppercase w-full border-b border-gray-100">
            <tr>
              {tableDatas.head.map((item) => (
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
                {itemArray.map((value) => (
                  <td
                    className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                    key={value}
                  >
                    <span className="line-clamp-1 inline-flex gap-x-3">
                      {value}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
