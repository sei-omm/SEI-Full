"use server";

import { cookies } from "next/headers";
import { TLoginSuccess } from "../type";

export const setCookie = async (key: string, value: string) => {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  (await cookies()).set(key, value, {
    expires,
    httpOnly: true,
    // secure : process.env.NODE_ENV === "production" ? true : false,
    // sameSite: "none",
  });
};

export const getAuthTokenServer = async () => {
  const cookieStore = await cookies();
  const loginInfo = cookieStore.get("login-info")?.value;
  let token = "";
  if (loginInfo) {
    token = (JSON.parse(loginInfo) as TLoginSuccess).token;
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const deleteCookie = async (key: string) => {
  (await cookies()).delete(key);
};
