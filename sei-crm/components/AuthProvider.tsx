import { BASE_API } from "@/app/constant";
import { headers, cookies } from "next/headers";
import UnAuthPage from "./UnAuthPage";

interface IProps {
  children: React.ReactNode;
}

export default async function AuthProvider({ children }: IProps) {
  const headerList = headers();
  const refreshToknen = await cookies().get("refreshToken")?.value;
  
  const response = await fetch(`${BASE_API}/employee/is-login`, {
    headers : {
      'Cookie': `refreshToken=${refreshToknen}`
    }
  });
  if(headerList.get("x-current-path")?.includes("/auth/login")) return <>{children}</>;
  if(!response.ok && (response.status === 401 || response.status === 403)) return <UnAuthPage />;
  return <>{children}</>
}
