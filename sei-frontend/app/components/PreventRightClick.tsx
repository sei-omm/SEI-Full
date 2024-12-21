"use client";

import React, { useEffect } from "react";

export default function PreventRightClick() {
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const preventKeyShortcuts = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "s" || e.key === "u")) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("keydown", preventKeyShortcuts);

    // Clean up event listeners on component unmount
    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("keydown", preventKeyShortcuts);
    };
  }, []);
  return <></>;
}
