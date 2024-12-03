import Button from "@/components/Button";
import TagsBtn from "@/components/TagsBtn";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineMail } from "react-icons/hi";
import { IoEyeOutline } from "react-icons/io5";
import { MdClose, MdDone } from "react-icons/md";

const tableDatas = {
  heads: ["Name", "Role", "Salary", "Payslip"],
  body: [
    ["Somnath Gupta", "Full Stack Developer", "$590", "actionbtns"],
    ["Arindam Gupta", "Finance", "$5555", "actionbtns"],
  ],
};

export default function page() {
  return (
    <div className="size-full">
      <section className="py-5">
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
                      {value.includes("@") ? (
                        <Link
                          className="text-[#346FD8] font-medium"
                          href={`mailto:${value}`}
                        >
                          {value}
                        </Link>
                      ) : (
                        <span className="line-clamp-1 inline-flex gap-x-3">
                          {value === "action" ? (
                            // <Link
                            //   href={"/dashboard/hr-module/manage-employee/01"}
                            // >
                            //   <Button className="bg-transparent border text-black font-semibold flex-center gap-x-2 !px-5">
                            //     <GrEdit />
                            //     Edit
                            //   </Button>
                            // </Link>
                            <div className="flex items-center gap-3 *:cursor-pointer">
                              <div
                                title="Approve Request"
                                className="size-5 shadow-2xl border-gray-700 border bg-green-600 flex-center rounded-full text-white"
                              >
                                <MdDone />
                              </div>
                              <div
                                title="Disapprove Request"
                                className="size-5 shadow-2xl bg-red-600 border-gray-700 border flex-center rounded-full text-white"
                              >
                                <MdClose />
                              </div>
                            </div>
                          ) : childItemIndex === 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="size-10 bg-gray-200 overflow-hidden rounded-full">
                                <Image
                                  className="size-full object-cover"
                                  src={"/employee-sample.jpg"}
                                  alt="Employee Image"
                                  height={90}
                                  width={90}
                                  quality={100}
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold">{value}</span>
                                <span className="text-xs">SG14IOM</span>
                              </div>
                            </div>
                          ) : value === "actionbtns" ? (
                            <div className="flex items-center gap-5">
                              <Link
                                href={
                                  "/dashboard/hr-module/payslip?eid=FT-0009"
                                }
                              >
                                <Button className="flex-center gap-4">
                                  <IoEyeOutline />
                                  <span>View</span>
                                </Button>
                              </Link>
                              <Button className="flex-center gap-4 !bg-white !text-black !border">
                                <HiOutlineMail />
                                <span>Send</span>
                              </Button>
                            </div>
                          ) : value === "Paid" ? (
                            <TagsBtn type="SUCCESS">Paid</TagsBtn>
                          ) : value === "Pending" ? (
                            <TagsBtn type="PENDING">Pending</TagsBtn>
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
    </div>
  );
}
