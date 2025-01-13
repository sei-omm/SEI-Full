"use client"; // Ensures this runs on the client

import { useEffect, useState } from "react";
import axios from "axios";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

interface IProps {
  params: {
    file_name: string;
  };
}


// Import styles
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { BASE_API } from "@/app/constant";

export default function PdfViewer({ params }: IProps) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: undefined,
  });
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const { data } = await axios.get(
          `${BASE_API}/library/view-file/${params.file_name}`,
          { responseType: "arraybuffer", withCredentials: true }
        );
        const blob = new Blob([data], { type: "application/pdf" });
        setBlobUrl(URL.createObjectURL(blob));
      } catch (error) {
        console.error("Error fetching PDF:", error);
      }
    };

    fetchPdf();
  }, []);

  if (!blobUrl) {
    return <p>Loading PDF...</p>;
  }

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <div
        style={{
          height: "100%",
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
        }}
        // className="w-full mx-auto"
      >
        <Viewer fileUrl={`${BASE_API}/library/view-file/${params.file_name}`} withCredentials = {true} plugins={[defaultLayoutPluginInstance]} />
      </div>
    </Worker>
  );
}
