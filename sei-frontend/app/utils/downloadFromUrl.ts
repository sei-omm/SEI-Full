"use client";

import { getAuthToken } from "./getAuthToken";

export const downloadFromUrl = async (urlToDownload: string) => {
  try {
    const response = await fetch(urlToDownload, {
      method: "GET",
      headers: {
        "Content-Type": "application/octet-stream",
        ...getAuthToken()
      },
    });

    if (!response.ok) {
      throw new Error("Failed to download");
    }

    const disposition = response.headers.get("Content-Disposition");
    let fileName = "not_found_filename";
    if (disposition && disposition.includes("filename=")) {
      const filenameMatch = disposition.match(
        /filename[^;=\n]*=(['"]?)([^'"\n]*)\1/
      );
      if (filenameMatch) {
        fileName = filenameMatch[2];
      }
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};
