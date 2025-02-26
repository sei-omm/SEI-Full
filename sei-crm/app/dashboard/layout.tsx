import Header from "@/components/Header";

import Sidebar from "@/components/Sidebar";
import "@/lib/_axiosInterceptor";

interface IProps {
  children: React.ReactNode;
}

export default function layout({ children }: IProps) {
  return (
    <>
      <Sidebar />
      <div className="h-screen w-full p-5 overflow-hidden">
        <div className="size-full bg-white rounded-lg overflow-y-auto overflow-hidden hide-scrollbar">
          <Header />
          {children}
        </div>
      </div>
    </>
  );
}
