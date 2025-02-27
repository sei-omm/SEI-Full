"use server";

import { cookies } from "next/headers";

export const setCookie = async (key: string, value: string) => {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  (await cookies()).set(key, value, { expires, httpOnly: true });
};

export const getAuthTokenServer = async () => {
  // const cookieStore = await cookies();
  // return {
  //   Authorization: `Bearer ${cookieStore.get("login-token")?.value}`,
  // };
  return {
    Authorization: `Bearer null`,
  };
};

export const deleteCookie = async (key: string) => {
  (await cookies()).delete(key);
};

export const getCookie = async (key: string) => {
  return await cookies().get(key)?.value;
};
