import { NextFunction, Request, Response } from "express";
import { TRoles, TTokenDataType } from "../types";
import { ErrorHandler } from "../utils/ErrorHandler";
import { getAuthToken } from "../utils/getAuthToken";
import { verifyToken } from "../utils/token";
import asyncErrorHandler from "./asyncErrorHandler";

export const roles = (requiredRole: TRoles[]) => {
  return asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const token = getAuthToken(req);

      if (!token) {
        throw new ErrorHandler(401, "Authorization Token missing!");
      }

      const { error, data: tokenData } = await verifyToken<TTokenDataType>(
        token
      );
      if (error) throw new ErrorHandler(401, error.message);

      const userRole = tokenData?.role;

      if (!userRole) {
        throw new ErrorHandler(403, "Role is missing");
      }

      // Check if the userRole matches any of the required roles
      // if (!requiredRole.includes(userRole as any)) {
      //   // req.params.id = tokenData.employee_id?.toString() || "0"
      //   throw new ErrorHandler(403, "Access denied: Insufficient permissions");
      // }

      // console.log(tokenData.employee_id)

      if (tokenData.employee_id) {
        res.locals.employee_id = tokenData.employee_id;
      }

      next();
    }
  );
};
