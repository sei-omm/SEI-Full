import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { ErrorHandler } from "../utils/ErrorHandler";
import { ApiResponse } from "../utils/ApiResponse";

export const getResources = (req: Request, res: Response) => {
  const filename = req.params.filename || null;

  if (!filename) throw new ErrorHandler(400, "filename is required");

  const filePath = path.join(__dirname, "../../resource", filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json(new ApiResponse(404, "File Not Found"));
    }
    res.sendFile(filePath);
  });
};
