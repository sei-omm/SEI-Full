import Header from "@/components/Header";
import IsAuthenticated from "@/components/IsAuthenticated";
import Sidebar from "@/components/Sidebar";

interface IProps {
  children: React.ReactNode;
}

export default function layout({ children }: IProps) {
  return (
    <IsAuthenticated>
      <Sidebar />
      <div className="h-screen w-full p-5 overflow-hidden">
        <div className="size-full bg-white rounded-lg overflow-y-auto overflow-hidden hide-scrollbar">
          <Header />
          {children}
        </div>
      </div>
    </IsAuthenticated>
  );
}
