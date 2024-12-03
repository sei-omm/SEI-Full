"use client";

import { deleteCookie, setCookie } from "@/app/actions/cookies";

export const setInfo = async (key: string, value: string) => {
  await setCookie(key, value);
  localStorage.setItem(key, value);
};

export const removeInfo = async (key: string) => {
  await deleteCookie(key);
  localStorage.removeItem(key);
};
