import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { IError } from "../types";

const DBERRORS: any = {
  "42703": "undefined_column",
  "42601": "syntax_error",
};

const backErrorResponse = (
  err: IError,
  res: Response,
  mode: "prod" | "dev"
) => {
  console.log(err)
  if (err.isOperational) {
    //these errors will throw by me
    res
      .status(err.statusCode)
      .json(
        new ApiResponse(err.statusCode, err.message, mode == "dev" ? err : null)
      );
  } else if (err.code) {
    if (DBERRORS[err.code]) {
      return res
        .status(400)
        .json(new ApiResponse(400, DBERRORS[err.code], err));
    }

    res.status(400).json(new ApiResponse(400, err.message, err));
  } else {
    res.status(500).json(new ApiResponse(500, "Internal Server Error", err));
  }
};

export const globalErrorController = (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  backErrorResponse(err, res, "dev");
};
