import Link from "next/link";
import Image from "next/image";
import { HiOutlineMail } from "react-icons/hi";
import {
  MdOutlineDateRange,
  MdOutlinePhone,
} from "react-icons/md";
import TabMenu from "../components/TabMenu";
import MyCourses from "../components/MyAccount/MyCourses";
import { PiBuildingOfficeLight } from "react-icons/pi";
import { BASE_API } from "../constant";
import { getAuthTokenServer } from "../actions/cookies";
import { IResponse, IStudent } from "../type";
import StudentProfileImage from "../components/StudentProfileImage";
import IsAuthenticated from "../components/IsAuthenticated";
import Button from "../components/Button";
import { CiEdit } from "react-icons/ci";
import OpenDialogButton from "../components/OpenDialogButton";
import { IoDocumentTextOutline } from "react-icons/io5";

interface IProps {
  searchParams: {
    tab: string | undefined;
  };
}

export default async function page({ searchParams }: IProps) {
  const AUTH_HEADER_OBJ = await getAuthTokenServer();

  const response = await fetch(BASE_API + "/student", {
    headers: {
      ...AUTH_HEADER_OBJ,
      "Content-Type": "application/json",
    },
  });

  const result = (await response.json()) as IResponse<IStudent>;

  return (
    <IsAuthenticated>
      <div className="w-full h-[60vh] relative overflow-hidden flex items-start sm:h-[48vh]">
        <Image
          className="size-full object-cover"
          src={"/images/Banners/LoginPageBanner.jpg"}
          alt="Courses Banner"
          height={1200}
          width={1200}
        />

        <div className="absolute inset-0 size-full bg-[#000000bb]">
          <div className="main-layout size-full flex-center flex-col">
            <h1 className="tracking-wider text-gray-100 text-4xl font-semibold uppercase">
              My Account
            </h1>
            <span className="text-background">
              <Link href={"/"}>Home</Link>
              <span> / </span>
              <Link href={"/account"}>My Account</Link>
            </span>
          </div>
        </div>
      </div>

      <div className="main-layout pt-10 space-y-12">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div className="flex items-start gap-8 flex-wrap">
            <StudentProfileImage
              imageUrl={result.data.profile_image}
              student_id={result.data.student_id}
            />

            <div className="space-y-2 sm:flex justify-center flex-col">
              <h1 className="font-semibold text-2xl">{result.data?.name}</h1>
              <h2 className="flex items-center gap-2">
                <HiOutlineMail className="mt-[0.17rem]" />
                {result.data?.email}
              </h2>
              <h2 className="flex items-center gap-2">
                <MdOutlinePhone />
                {result.data?.mobile_number}
              </h2>
              <h2 className="flex items-center gap-2">
                <MdOutlineDateRange />
                {new Date(result.data?.dob).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </h2>
              <h2 className="flex items-center gap-2 *:cursor-pointer">
                <PiBuildingOfficeLight />
                {result.data?.indos_number ||
                result.data.indos_number !== "" ? (
                  result.data.indos_number + " (INDOS)"
                ) : (
                  <>
                    <span>Add Indos Number</span>
                    <OpenDialogButton
                      type="OPEN"
                      dialogKey="edit-indos-num-dialog"
                    >
                      <CiEdit className="cursor-pointer active:scale-90" />
                    </OpenDialogButton>
                  </>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center justify-center sm:w-full">
            <OpenDialogButton
              className="sm:w-full"
              type="OPEN"
              dialogKey="upload-documents-dialog"
              extraValue={{
                courseIds: result.data.courses
                  .map((item) => item.course_id)
                  .join(","),
                preventToClose: false,
              }}
            >
              <Button className="shadow-none !border-gray-500 !px-5 !text-black active:scale-95 sm:w-full">
                <IoDocumentTextOutline />
                Your Documents
              </Button>
            </OpenDialogButton>
          </div>
        </div>

        <div>
          <TabMenu
            tabs={[
              {
                isSelected:
                  searchParams.tab === undefined ||
                  searchParams.tab === "course"
                    ? true
                    : false,
                text: "Enrolled Courses",
                slug: "/account?tab=course",
              },
              {
                isSelected: searchParams.tab === "library" ? true : false,
                text: "library",
                slug: "/account?tab=library",
              },
            ]}
          />

          {searchParams.tab === "course" || searchParams.tab === undefined ? (
            <MyCourses courses={result.data.courses || []} />
          ) : null}
        </div>
      </div>
    </IsAuthenticated>
  );
}
