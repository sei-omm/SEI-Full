"use client";

interface IProps {
  urlToDownload: string;
  children: React.ReactNode;
  className ? : string
}
export default function DownloadFormUrl({ urlToDownload, children, className }: IProps) {
  const downloadData = async () => {
    try {
      const response = await fetch(urlToDownload, {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download");
      }

      const disposition = response.headers.get("Content-Disposition");
      let filename = "excel_sheet.xlsx";
      if (disposition && disposition.includes("filename=")) {
        const filenameMatch = disposition.match(/filename[^;=\n]*=(['"]?)([^'"\n]*)\1/);
        if (filenameMatch) {
          filename = filenameMatch[2];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return <div className={`max-w-max ${className}`} onClick={downloadData}>{children}</div>;
}
