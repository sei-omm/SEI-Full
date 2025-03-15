import { BASE_API } from "@/app/constant";
import { headers, cookies } from "next/headers";
import UnAuthPage from "./UnAuthPage";
import SavePermissionClient from "./Account/SavePermissionClient";
import { ISuccess } from "@/types";

interface IProps {
  children: React.ReactNode;
}

// as you know this component will render only one time in production mode if user not refresh the page
export default async function AuthProvider({ children }: IProps) {
  const headerList = headers();
  const cookieStore = await cookies();
  const refreshToknen = cookieStore.get("refreshToken")?.value;
  const permissionToken = cookieStore.get("permissionToken")?.value;

  if (headerList.get("x-current-path")?.includes("/auth/login"))
    return <>{children}</>;

  const response = await fetch(`${BASE_API}/employee/is-login`, {
    headers: {
      Cookie: `refreshToken=${refreshToknen}; permissionToken=${permissionToken}`,
    },
    credentials : "include"
  });

  if (!response.ok && (response.status === 401 || response.status === 403))
    return <UnAuthPage />;

  const result = (await response.json()) as ISuccess<string>;
  if (result.data !== null) {
    return (
      <>
        <SavePermissionClient permissions={result.data} />
        {children}
      </>
    );
  }

  return <>{children}</>;
}
