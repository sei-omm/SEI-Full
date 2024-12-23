import CoursesPage from "@/app/components/CoursesPage";
import { notFound } from "next/navigation";

interface IProps {
  params: {
    centerName: string;
  };
}
// export const dynamic = "force-dynamic";
export default function page({ params }: IProps) {
  if (params.centerName != "kolkata" && params.centerName != "faridabad") {
    return notFound();
  }

  return <CoursesPage centerName={params.centerName} />;
}
