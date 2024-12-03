import { DependencyList, useEffect, useState } from "react";
import { TLoginSuccess } from "../type";

export const useIsAuthenticated = (dependencylist? : DependencyList) => {
  const [isAuthenticated, setIsAuthenticated] = useState<null | boolean>(null);
  const [userInfo, setUserInfo] = useState<{
    profile_image: string | null;
  } | null>(null);

  useEffect(() => {
    const loginInfo = JSON.parse(localStorage.getItem("login-info") || "{}") as TLoginSuccess;
    setIsAuthenticated(loginInfo.token ? true : false);
    setUserInfo({
      profile_image: loginInfo.profile_image
    });
  }, dependencylist ? dependencylist : []);

  return { isAuthenticated, userInfo };
};
