import Link from "next/link";
import Image from "next/image";
import { HiOutlineMail } from "react-icons/hi";
import { MdOutlineDateRange, MdOutlinePhone } from "react-icons/md";
import TabMenu from "../components/TabMenu";
import MyCourses from "../components/MyAccount/MyCourses";
import { PiBuildingOfficeLight } from "react-icons/pi";
import { BASE_API } from "../constant";
import { getAuthTokenServer } from "../actions/cookies";
import { IResponse, IStudent, TMyLibrarySearchParams } from "../type";
import StudentProfileImage from "../components/StudentProfileImage";
import IsAuthenticated from "../components/IsAuthenticated";
import Button from "../components/Button";
import { CiEdit } from "react-icons/ci";
import OpenDialogButton from "../components/OpenDialogButton";
import { IoDocumentTextOutline } from "react-icons/io5";
import MyLibrary from "../components/MyAccount/MyLibrary";
import UnAuthorizedPage from "../components/UnAuthorizedPage";
import ProfileLogoutBtn from "../components/MyAccount/ProfileLogoutBtn";
import { CustomErrorPage } from "../components/CustomErrorPage";

interface IProps {
  searchParams: TMyLibrarySearchParams;
}

export default async function page({ searchParams }: IProps) {
  const AUTH_HEADER_OBJ = await getAuthTokenServer();
  const response = await fetch(BASE_API + "/student", {
    headers: {
      ...AUTH_HEADER_OBJ,
      "Content-Type": "application/json",
    }
  });

  if (response.status === 401) return <UnAuthorizedPage />;
  if (!response.ok) return <CustomErrorPage message={await response.text()} />;

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

      <div className="main-layout pt-10 space-y-12 sm:pt-0 sm:space-y-0">
        <div className="flex items-start justify-between flex-wrap gap-6 sm:hidden">
          <div className="flex items-start gap-8 flex-wrap">
            <StudentProfileImage imageUrl={result.data.profile_image} />

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
                  ?.map((item) => item.course_id)
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

        <div className="hidden sm:block -translate-y-10 space-y-5">
          <StudentProfileImage imageUrl={result.data.profile_image} />
          <div className="flex justify-center flex-col gap-3 relative">
            <h1 className="font-semibold text-2xl">{result.data?.name}</h1>

            <div className="flex items-center gap-x-6 gap-y-3 flex-wrap">
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

            <div className="absolute -top-10 right-0">
              <ProfileLogoutBtn />
            </div>
          </div>

          <OpenDialogButton
            className="sm:w-full"
            type="OPEN"
            dialogKey="upload-documents-dialog"
            extraValue={{
              courseIds: result.data.courses
                ?.map((item) => item.course_id)
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
          ) : (
            <MyLibrary
              courses={result.data.courses || []}
              searchParams={searchParams}
            />
          )}
        </div>
      </div>
    </IsAuthenticated>
  );
}
