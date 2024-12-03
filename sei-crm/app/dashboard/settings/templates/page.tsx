import Button from "@/components/Button";
import Link from "next/link";
import { IoAdd } from "react-icons/io5";
import { HiOutlineMail } from "react-icons/hi";
import { MdOutlineTextsms } from "react-icons/md";
import { MdOutlineDateRange } from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import { MdDeleteOutline } from "react-icons/md";
import { FiEdit3 } from "react-icons/fi";

export default function page() {
  return (
    <div className="size-full py-5 space-y-6">
      <div className="flex items-center justify-end">
        <Button className="flex items-center gap-x-2 relative group/create-template-btn active:scale-100">
          <IoAdd size={20} />
          <span>Create Template</span>

          <div className="absolute w-full h-max border shadow-md inset-0 top-11 text-xs hidden group-focus-within/create-template-btn:block bg-white">
            <Link
              href={"/settings/templates/email"}
              className="flex items-center gap-x-3 text-black hover:bg-gray-200 p-3 font-semibold"
            >
              <HiOutlineMail size={18} />
              <span>Email Template</span>
            </Link>
            <Link
              href={""}
              className="flex items-center gap-x-3 text-black hover:bg-gray-200 p-3 font-semibold"
            >
              <MdOutlineTextsms size={18} />
              <span>SMS Template</span>
            </Link>
          </div>
        </Button>
      </div>

      {/* Old Template List */}
      <ul className="grid grid-cols-3 gap-7">
        {[1, 2, 3, 4].map((item, index) => (
          <li
            key={index}
            className="border shadow-md rounded-lg w-full p-4 space-y-3"
          >
            <h2 className="font-semibold">Welcome Template</h2>
            <p className="text-xs tracking-wider flex items-center gap-x-2">
              <MdOutlineDateRange size={16} />
              <span className="text-gray-500">
                Last Modified in 19 Sep 2024
              </span>
            </p>
            <p className="text-xs tracking-wider flex items-center gap-x-2">
              <BiCategory size={16} />
              <span className="text-gray-500">Email Template</span>
            </p>

            <div className="border-t flex items-center gap-x-5 pt-3">
              <MdDeleteOutline
                size={16}
                className="text-red-600 cursor-pointer active:scale-90"
              />
              <FiEdit3 size={16} className="cursor-pointer active:scale-90" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
