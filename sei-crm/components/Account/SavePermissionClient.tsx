"use client";

import { useEffect } from "react";

interface IProps {
  permissions: string;
}

export default function SavePermissionClient({ permissions }: IProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("permissions", permissions);
    }
  }, [permissions]);

  return <></>;
}
