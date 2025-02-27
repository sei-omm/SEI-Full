import { EmployeeLoginInfoType } from "@/types";
import { useEffect, useState } from "react";

export const useIsAuthenticated = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<null | boolean>(null);
  const [userInfo, setUserInfo] = useState<EmployeeLoginInfoType | null>(null);

  // useEffect(() => {
  //   const isLoginTokenExist = localStorage.getItem("login-token");
  //   if (isLoginTokenExist) {
  //     setIsAuthenticated(true);
  //     const info = JSON.parse(
  //       localStorage.getItem("employee-info") || "{}"
  //     ) as EmployeeLoginInfoType;
  //     setUserInfo(info);
  //   } else {
  //     setIsAuthenticated(false);
  //     setUserInfo(null);
  //   }
  // }, []);

  useEffect(() => {
    const employeeInfo = localStorage.getItem("employee-info");
    if (employeeInfo) {
      setIsAuthenticated(true);
      const info = JSON.parse(employeeInfo) as EmployeeLoginInfoType;
      setUserInfo(info);
    } else {
      setIsAuthenticated(false);
      setUserInfo(null);
    }
  }, []);

  return { isAuthenticated, userInfo };
};
