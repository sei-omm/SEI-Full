import MyCourses from "@/app/components/MyAccount/MyCourses";
import UserDetails from "@/app/components/MyAccount/UserDetails";
import TabMenu from "@/app/components/TabMenu";
import { notFound } from "next/navigation";

interface IProps {
  params: {
    tabName: string;
  };
}

export default function page({ params }: IProps) {
  if (params.tabName != "user-details" && params.tabName != "courses") {
    notFound();
  }

  return (
    <>
      <TabMenu
        tabs={[
          {
            isSelected: params.tabName === "user-details" ? true : false,
            text: "User Details",
            slug: "/my-account/user-details",
          },
          {
            isSelected: params.tabName === "courses" ? true : false,
            text: "Enrolled Courses",
            slug: "/my-account/courses",
          },
          {
            isSelected: false,
            text: "library",
            slug: "/my-account/library",
          },
        ]}
      />
      {params.tabName === "user-details" ? <UserDetails /> : <MyCourses courses={[]} />}
    </>
  );
}
