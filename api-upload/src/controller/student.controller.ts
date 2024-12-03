import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";

import { handleUpload } from "@vercel/blob/client";

export const uploadStudentsFiles = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const response = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        console.log(pathname);
        console.log(clientPayload);
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "application/pdf", "image/webp"],
          token: process.env.BLOB_READ_WRITE_TOKEN as string,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("Upload completed:", blob, tokenPayload);
      },
    });

    res.status(200).json(response); // Return the upload URL to the client
  }
);
