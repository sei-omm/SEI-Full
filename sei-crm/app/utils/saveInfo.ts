"use client";

import { deleteCookie, setCookie } from "@/app/actions/cookies";

type TOtherOptions = {
  inLocalstorage?: boolean;
  inCookie?: boolean;
};

export const setInfo = async (
  key: string,
  value: string,
  { inCookie = true, inLocalstorage = false }: TOtherOptions = {}
) => {
  if (inCookie) {
    await setCookie(key, value);
  }
  if (inLocalstorage) {
    localStorage.setItem(key, value);
  }
};

export const removeInfo = async (
  key: string,
  { inCookie = true, inLocalstorage = false }: TOtherOptions = {}
) => {
  if (inCookie) {
    await deleteCookie(key);
  }
  if (inLocalstorage) {
    localStorage.removeItem(key);
  }
};
