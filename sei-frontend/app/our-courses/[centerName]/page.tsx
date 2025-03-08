import CoursesPage from "@/app/components/CoursesPage";
import { TCourseCategory } from "@/app/type";
import { notFound } from "next/navigation";

interface IProps {
  params: {
    centerName: string;
  };
  searchParams: {
    category: TCourseCategory;
  };
}
// export const dynamic = "force-dynamic";
export default async function page({ params, searchParams }: IProps) {
  if (params.centerName != "kolkata" && params.centerName != "faridabad") {
    return notFound();
  }
  return (
    <CoursesPage
      centerName={params.centerName}
      category={searchParams.category}
    />
  );
}
