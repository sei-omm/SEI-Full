import React from "react";
import DialogBody from "./DialogBody";
import { CiCalendarDate } from "react-icons/ci";

const notices = [
  {
    heading: "1 SPECIAL PACKAGE FOR JULY & AUGUST-2024",
    date: "14 July, 2024",
    description:
      "SPECIAL PACKAGE FOR JULY & AUGUST-2024 HURRY UP ASM+SMS ONLY RS. 24,999/-",
  },
  {
    heading: "2 SPECIAL PACKAGE FOR JULY & AUGUST-2024",
    date: "14 July, 2024",
    description:
      "SPECIAL PACKAGE FOR JULY & AUGUST-2024 HURRY UP ASM+SMS ONLY RS. 24,999/-",
  },
  {
    heading: "3 SPECIAL PACKAGE FOR JULY & AUGUST-2024",
    date: "14 July, 2024",
    description:
      "SPECIAL PACKAGE FOR JULY & AUGUST-2024 HURRY UP ASM+SMS ONLY RS. 24,999/-",
  },

  {
    heading: "4 SPECIAL PACKAGE FOR JULY & AUGUST-2024",
    date: "14 July, 2024",
    description:
      "SPECIAL PACKAGE FOR JULY & AUGUST-2024 HURRY UP ASM+SMS ONLY RS. 24,999/-",
  },

  {
    heading: "5 SPECIAL PACKAGE FOR JULY & AUGUST-2024",
    date: "14 July, 2024",
    description:
      "SPECIAL PACKAGE FOR JULY & AUGUST-2024 HURRY UP ASM+SMS ONLY RS. 24,999/-",
  },
];

export default function NoticeDialog() {
  return (
    <DialogBody>
      <div className="space-y-1">
        <h2 className="font-bold text-gray-700 text-2xl">
          Latest <span className="text-[#e9b858]">News</span>
        </h2>
        <p className="text-gray-600 text-sm">Latest notices for our students</p>
      </div>

      {/* Notice List */}
      <ul className="space-y-3 mt-3 size-full max-h-60 overflow-y-auto notice-board-scroll">
        {notices.map((notice, index) => (
          <li key={index}>
            {/* Notice Heading */}
            <h2 className="font-[600] text-sm">{notice.heading}</h2>
            <p className="flex items-center gap-x-1 text-xs">
              <CiCalendarDate />
              {notice.date}
            </p>
            <p className="text-xs">{notice.description}</p>
          </li>
        ))}
      </ul>
    </DialogBody>
  );
}
