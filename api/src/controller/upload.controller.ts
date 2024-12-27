import { Request, Response } from "express";
import asyncErrorHandler from "../middleware/asyncErrorHandler";

import { handleUpload } from "@vercel/blob/client";

export const uploadStudentDocument = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const vercelBlobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const response = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          token: vercelBlobToken as string,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {},
    });

    res.status(200).json(response); // Return the upload URL to the client
  }
);

export const uploadDocsFromCRM = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const vercelBlobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const response = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "application/pdf",
            "image/png",
            "image/webp",
          ],
          token: vercelBlobToken as string,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {},
    });

    res.status(200).json(response); // Return the upload URL to the client
  }
);

export const uploadToComplianceRecord = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const vercelBlobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const response = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        return {
          allowedContentTypes: [
            "image/*",
            "application/*",
            "*/*",
            "text/*",
            "audio/*",
            "video/*",
          ],
          token: vercelBlobToken as string,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {},
    });

    res.status(200).json(response); // Return the upload URL to the client
  }
);


export const uploadCandidateResume = asyncErrorHandler(
  async (req: Request, res: Response) => {
    const vercelBlobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const response = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        return {
          allowedContentTypes: ["application/pdf", "application/msword"],
          token: vercelBlobToken as string,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {},
    });

    res.status(200).json(response); // Return the upload URL to the client
  }
);
