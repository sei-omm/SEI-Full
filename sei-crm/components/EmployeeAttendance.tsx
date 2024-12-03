"use client";

import Button from "./Button";
import { GrEdit } from "react-icons/gr";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setDialog } from "@/redux/slices/dialogs.slice";
import { IoIosAdd } from "react-icons/io";

const tableDatas = {
  heads: ["Date", "Check In", "Check Out", "Status", "Action"],
  body: [
    ["23 Oct 2024", "10:00am", "06:00pm", "Active", "edit"],
    ["22 Oct 2024", "00:00", "00:00", "Leave", "edit"],
  ],
};

export default function EmployeeAttendance() {
  const dispatch = useDispatch();

  const handleManageAttendance = () => {
    dispatch(
      setDialog({
        dialogId: "manage-employee-attendance",
        type: "OPEN",
        extraValue: "edit-employee-attendance",
      })
    );
  };

  const handleAddNewAttendance = () => {
    dispatch(
      setDialog({
        dialogId: "manage-employee-attendance",
        type: "OPEN",
        extraValue: "add-new-employee-attendance",
      })
    );
  };

  return (
    <section className="w-full">
      <div className="flex items-center justify-end pb-4">
        <Button
          onClick={handleAddNewAttendance}
          className="flex items-center gap-2"
        >
          <IoIosAdd size={25} />
          <span>Add New Attendance</span>
        </Button>
      </div>
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black card-shdow rounded-lg border">
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
                {itemArray.map((value) => (
                  <td
                    className="text-left text-[14px] py-3 px-5 space-x-3 relative max-w-52"
                    key={value}
                  >
                    {value.includes("@") ? (
                      <Link
                        className="text-[#346FD8] font-medium"
                        href={`mailto:${value}`}
                      >
                        {value}
                      </Link>
                    ) : (
                      <span className="line-clamp-1 inline-flex gap-x-3">
                        {value === "edit" ? (
                          <Button
                            onClick={handleManageAttendance}
                            className="bg-transparent border text-black font-semibold flex-center gap-x-2 !px-5"
                          >
                            <GrEdit />
                            Manage
                          </Button>
                        ) : value === "Active" ? (
                          <span className="bg-green-700 px-2 inline-block rounded-full text-white text-xs py-1">
                            {value}
                          </span>
                        ) : value === "Leave" ? (
                          <span className="bg-[#F44336] px-2 inline-block rounded-full text-white text-xs py-1">
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
    </section>
  );
}
