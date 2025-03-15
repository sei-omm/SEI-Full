import { NextFunction, Request, Response } from "express";
import asyncErrorHandler from "./asyncErrorHandler";
import { ErrorHandler } from "../utils/ErrorHandler";
import {  verifyToken } from "../utils/token";
import { TTokenDataType } from "../types";
import { getAuthToken } from "../utils/getAuthToken";

export const isAuthenticated = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = getAuthToken(req);

    if (!token) {
      throw new ErrorHandler(401, "Authorization Token missing");
    }

    const { error, data } = await verifyToken<TTokenDataType>(token);
    if (error) throw new ErrorHandler(401, "Unauthorized");

    if (data?.student_id) {
      res.locals.student_id = data.student_id;
    }
    if (data?.employee_id) {
      res.locals.employee_id = data.employee_id;
    }
    if (data?.role) {
      res.locals.role = data.role;
    }

    if (data?.member_id) {
      res.locals.member_id = data.member_id;
    }

    next();
  }
);
