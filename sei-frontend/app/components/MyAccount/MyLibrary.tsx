import React from "react";
import { CourseType, IResponse, TMyLibrarySearchParams } from "@/app/type";
import { BASE_API } from "@/app/constant";
import { formateDate } from "@/app/utils/formateDate";
import { getAuthTokenServer } from "@/app/actions/cookies";
import LibraryFilters from "./LibraryFilters";
import { PiFilePdf } from "react-icons/pi";
import { FaRegFileAudio, FaRegFileImage } from "react-icons/fa";
import { BsFiletypeDocx } from "react-icons/bs";
import { IoFilterOutline, IoLinkSharp } from "react-icons/io5";
import ViewLibraryBtn from "./ViewLibraryFileBtn";
import OpenDialogButton from "../OpenDialogButton";

interface IProps {
  courses: CourseType[];
  searchParams: TMyLibrarySearchParams;
}

type TLibraryInfo = {
  library_id: number;
  library_file_name: string;
  library_file_type: string;
  course_name: string | null;
  subject_names : string | null;
  allow_download: boolean;
  library_resource_link: string;
  created_at: string;
};

const file_types_icons: any = {
  pdf: { name: "Pdf File", icon: <PiFilePdf size={18} /> },
  audio: { name: "Audio File", icon: <FaRegFileAudio size={18} /> },
  doc: { name: "Docx File", icon: <BsFiletypeDocx size={18} /> },
  image: { name: "Image File", icon: <FaRegFileImage size={18} /> },
  link: { name: "Link", icon: <IoLinkSharp size={18} /> },
};

type TTable = {
  heads: string[];
  body: (string | null)[][];
};

export default async function MyLibrary({ courses, searchParams }: IProps) {
  const AUTH_HEADER_OBJ = await getAuthTokenServer();

  const urlSearchParams = new URLSearchParams(searchParams);
  urlSearchParams.delete("tab");
  if (urlSearchParams.get("course_id") === "all")
    urlSearchParams.delete("course_id");
  if (urlSearchParams.get("library_file_type") === "all")
    urlSearchParams.delete("library_file_type");

  const response = await fetch(
    `${BASE_API}/library/student${
      urlSearchParams.size !== 0 ? `?${urlSearchParams.toString()}` : ""
    }`,
    {
      headers: {
        ...AUTH_HEADER_OBJ,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );
  const result = (await response.json()) as IResponse<TLibraryInfo[]>;

  const tableDatas: TTable = {
    heads: ["Book Name", "Course/Subject", "Publish Date", "Action"],
    body: result.data.map((item) => [
      item.library_file_name,
      item.course_name || item.subject_names || "N/A",
      item.created_at,
      "actionBtn",
    ]),
  };

  return (
    <div className="py-4 space-y-10 sm:space-y-8">
      {/* filters */}
      <div className="hidden sm:flex items-center justify-end sm:pt-3">
        <OpenDialogButton
          className=""
          type="OPEN"
          dialogKey="mobile-library-filter"
          extraValue={{ courses }}
        >
          <div className="flex items-center justify-end gap-3">
            <span className="font-semibold">Filters</span>
            <IoFilterOutline size={20} />
          </div>
        </OpenDialogButton>
      </div>

      <div className="flex items-end justify-end gap-6 *:min-w-64 sm:hidden">
        <h2 className="flex-grow font-semibold text-2xl pb-3 sm:hidden">
          My Library
        </h2>
        <LibraryFilters courses={courses} />
      </div>
      {/* all elements */}
      <div className="size-full">
        {/* <ul className="grid-libary-items"> */}
        {!result.data.map || result.data.length === 0 ? (
          <h2 className="text-center text-gray-500 text-sm">
            No Library Item Found
          </h2>
        ) : (
          // <ul className="grid gap-8 grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))]">
          //   {result.data.map((library) => (
          //     <li className="p-4 py-5 shadow-md rounded-xl border space-y-2 relative">
          //       <h2 className="font-semibold text-lg">
          //         {library.library_file_name}
          //       </h2>
          //       <h3 className="text-sm text-gray-600 flex items-center gap-2">
          //         <MdOutlineDateRange />

          //         <span>{formateDate(library.created_at)}</span>
          //       </h3>
          //       <h4 className="text-sm text-gray-600 flex items-center gap-2">
          //         {file_types_icons[library.library_file_type].icon}
          //         <span>
          //           {file_types_icons[library.library_file_type].name}
          //         </span>
          //       </h4>
          //       <h5 className="text-sm text-gray-600 flex items-center gap-2">
          //         <MdOutlineAdminPanelSettings />
          //         <span>By SEI Educational Trust</span>
          //       </h5>
          //       <ViewLibraryBtn
          //         fileNameOrLink={library.library_resource_link}
          //         allowDownload={library.allow_download}
          //         libraryItemId={library.library_id}
          //       />
          //     </li>
          //   ))}
          // </ul>
          <div className="w-full overflow-hidden card-shdow">
            <div className="w-full overflow-x-auto scrollbar-thin scrollbar-track-black">
              <table className="min-w-max w-full table-auto">
                <thead className="uppercase w-full border-b border-gray-100">
                  <tr>
                    {tableDatas.heads.map((item) => (
                      <th
                        className="text-left text-[15px] font-semibold pb-2 px-5 py-4"
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
                          className="text-left text-[15px] py-3 px-5 space-x-3 relative max-w-52"
                          key={value}
                        >
                          {value === "actionBtn" ? (
                            <ViewLibraryBtn
                              fileNameOrLink={
                                result.data[rowIndex].library_resource_link
                              }
                              allowDownload={
                                result.data[rowIndex].allow_download
                              }
                              libraryItemId={result.data[rowIndex].library_id}
                            />
                          ) : columnIndex === 0 ? (
                            <div>
                              <span className="float-left mr-2 mt-[1px]">
                                {
                                  file_types_icons[
                                    result.data[rowIndex].library_file_type
                                  ].icon
                                }
                              </span>
                              <span>{value}</span>
                            </div>
                          ) : columnIndex === 2 ? (
                            <span>
                              {formateDate(result.data[rowIndex].created_at)}
                            </span>
                          ) : (
                            value
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
