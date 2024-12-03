"use client";

import { TLoginSuccess } from "../type";

export const getAuthToken = () => {

  const localLoginInfo = localStorage.getItem("login-info");
  let token = "";
  if(localLoginInfo) {
    const loginInfo = JSON.parse(localLoginInfo || "{}") as TLoginSuccess
    token = loginInfo.token
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};
