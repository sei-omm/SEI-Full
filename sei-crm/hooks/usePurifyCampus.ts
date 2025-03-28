import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export const usePurifyCampus = (searchParams: URLSearchParams | undefined) => {
  const { campus: userCampus } = useSelector(
    (state: RootState) => state.campus
  );
  const [campus, setCampus] = useState<string>(() => {
    if (userCampus === "Both") {
      return searchParams?.get("institute") || "Kolkata";
    }

    return userCampus || ""
  });

  useEffect(() => {
    if (userCampus === "Both") {
      setCampus(searchParams?.get("institute") || "Kolkata");
      return;
    }
    setCampus(userCampus || "");
  }, [searchParams?.toString()]);

  return {campus, setCampus};
};
