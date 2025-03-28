import { RootState } from "@/redux/store";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export const usePurifySearchParams = () => {
  const searchParams = useSearchParams();
  const { campus: userCampus } = useSelector(
    (state: RootState) => state.campus
  );
  const [sParams, setSParams] = useState<URLSearchParams>(() => {
    const newUrlSearchParams = new URLSearchParams(searchParams);
    if (userCampus === "Both") {
      if (!searchParams.get("institute")) {
        newUrlSearchParams.set("institute", "Kolkata");
      }

      return newUrlSearchParams;
    }

    // if user has only one campus permission
    if (userCampus === "Kolkata") {
      // mean user has only kolkata campus permission
      // modify the serach params
      newUrlSearchParams.set("institute", "Kolkata");
    } else if (userCampus === "Faridabad") {
      // mean user has only faridabad campus permission
      newUrlSearchParams.set("institute", "Faridabad");
    } else {
      newUrlSearchParams.delete("institute");
    }
    return newUrlSearchParams;
  });

  useEffect(() => {
    // now i will check if the user have current institute permission or not
    const newUrlSearchParams = new URLSearchParams(searchParams);

    if (userCampus === "Both") {
      // mean user has both (all) campus permissions
      if (!searchParams.get("institute")) {
        newUrlSearchParams.set("institute", "Kolkata");
      }
      setSParams(newUrlSearchParams);
      return;
    }

    // if user has only one campus permission
    if (userCampus === "Kolkata") {
      // mean user has only kolkata campus permission
      // modify the serach params
      newUrlSearchParams.set("institute", "Kolkata");
    } else if (userCampus === "Faridabad") {
      // mean user has only faridabad campus permission
      newUrlSearchParams.set("institute", "Faridabad");
    } else {
      newUrlSearchParams.delete("institute");
    }

    setSParams(newUrlSearchParams);
  }, [searchParams.toString()]);

  return sParams;
};
