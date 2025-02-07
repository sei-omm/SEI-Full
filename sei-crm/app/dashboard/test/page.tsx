"use client";

import { stickyFirstCol } from "@/app/utils/stickyFirstCol";
import Input from "@/components/Input";
import React, { useState } from "react";
import { CiEdit } from "react-icons/ci";

export default function Test() {
  const [currentEditableIndex, setCurrentEditableIndex] = useState(-1);

  const tableDatas = {
    heads: [
      "Columm 1",
      "Column 2",
      "Column 3",
      "Column 4",
      "Column 5",
      "Column 6",
      "Column 7",
    ],
    body: [
      [
        "Somnath Gupta",
        "Mobile Phone",
        "Coding, Next Js, React Js, Node Js",
        "17 July, 2000",
        "Hello World",
        "This is column 6",
        "This is column 7",
      ],
      [
        "Somnath Gupta",
        "Mobile Phone",
        "Coding, Next Js, React Js, Node Js",
        "17 July, 2000",
        "Hello World",
        "This is column 6",
        "This is column 7",
      ],
    ],
  };

  return (
    <div className="py-4 px-10">
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black card-shdow rounded-xl">
        <table className="min-w-max w-full table-auto scrollbar-thin scrollbar-track-black">
          <thead className="uppercase w-full border-b border-gray-100">
            <tr>
              {tableDatas.heads.map((item, index) => (
                <th
                  className={`text-left text-[14px] font-semibold pb-2 px-5 py-4 ${stickyFirstCol(
                    index,
                    false
                  )}`}
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
                className="hover:bg-gray-100 group/bodyitem relative"
              >
                {itemArray.map((value, colIndex) => (
                  <td
                    className={`text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52 ${stickyFirstCol(
                      colIndex
                    )}`}
                    key={value}
                  >
                    {currentEditableIndex === rowIndex ? (
                      <span>
                        {colIndex === 0 ? (
                          <span className="flex items-center gap-2">
                            <Input
                              type="text"
                              placeholder="Type Something"
                              defaultValue={value}
                            />
                          </span>
                        ) : (
                          <Input
                            type="text"
                            placeholder="Type Something"
                            defaultValue={value}
                          />
                        )}
                      </span>
                    ) : (
                      <span className="line-clamp-1 inline-flex gap-x-3">
                        {colIndex === 0 ? (
                          <span>
                            <CiEdit
                              onClick={() => setCurrentEditableIndex(rowIndex)}
                              className="float-left mr-2 cursor-pointer"
                              size={20}
                            />
                            {value}
                          </span>
                        ) : (
                          value
                        )}
                      </span>
                    )}
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
