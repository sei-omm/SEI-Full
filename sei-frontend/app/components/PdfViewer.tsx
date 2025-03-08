"use client";

import React from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";

import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

// Import styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { BASE_API } from "../constant";

function PdfViewer({ fileName }: { fileName: string }) {
  // Create an instance of the default layout plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const {
            CurrentPageInput,
            GoToNextPage,
            GoToPreviousPage,
            NumberOfPages,
            ZoomIn,
            ZoomOut,
          } = slots;

          // Customize the toolbar, excluding Download and Print buttons
          return (
            <div
              style={{ display: "flex", alignItems: "center", padding: "4px" }}
            >
              <GoToPreviousPage />
              <CurrentPageInput /> / <NumberOfPages />
              <GoToNextPage />
              <ZoomOut />
              <ZoomIn />
            </div>
          );
        }}
      </Toolbar>
    ),
    // Optionally hide the sidebar or other elements if desired
    sidebarTabs: (defaultTabs) => defaultTabs, // Keep default sidebar tabs, or customize
  });

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
      <div id="pdf-container">
        <Viewer
          withCredentials
          fileUrl={`${BASE_API}/library/view-file/${fileName}`}
          plugins={[defaultLayoutPluginInstance]}
        />
      </div>
    </Worker>
  );
}

export default PdfViewer;
