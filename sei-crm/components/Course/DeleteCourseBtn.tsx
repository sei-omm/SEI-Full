"use client";

import { useDoMutation } from "@/app/utils/useDoMutation";
import { useRouter } from "next/navigation";
import Spinner from "../Spinner";

interface IProps {
  id: number;
  children: React.ReactNode;
}

export default function DeleteCourseBtn({ children, id }: IProps) {
  const { mutate, isLoading } = useDoMutation();
  const route = useRouter();

  const handleDeleteCourseBtn = () => {
    if(isLoading) return;
    if(!confirm("Are you sure you want to delete?")) return;
    mutate({
      apiPath: "/course",
      method: "delete",
      id: id,
      onSuccess() {
        route.push("/dashboard/course-management?code=" + Math.round(Math.random() * 100));
      },
    });
  };

  return (
    <div onClick={handleDeleteCourseBtn}>
      {isLoading ? <Spinner size="20px" /> : children}
    </div>
  );
}
