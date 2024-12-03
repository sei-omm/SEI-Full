import { handleUpload } from "@vercel/blob/client";
import asyncErrorHandler from "../middleware/asyncErrorHandler";
import { Request, Response } from "express";

export const uploadCv = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const response = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        return {
          allowedContentTypes: ["application/pdf"],
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
