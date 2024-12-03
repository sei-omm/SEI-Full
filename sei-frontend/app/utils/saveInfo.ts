"use client";

import { deleteCookie, setCookie } from "../actions/cookies";

export const setInfo = async (key: string, value: string, where : "localStorage" | "both" = "both") => {
  if(where === "localStorage") {
    localStorage.setItem(key, value);
    return;
  }

  await setCookie(key, value);
  localStorage.setItem(key, value);
};

export const removeInfo = async (key: string, where : "localStorage" | "both" = "both") => {
  if(where === "localStorage") {
    localStorage.removeItem(key);
  }
  await deleteCookie(key);
  localStorage.removeItem(key);
};