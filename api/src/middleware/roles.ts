import { NextFunction, Request, Response } from "express";
import { TRoles, TTokenDataType } from "../types";
import { ErrorHandler } from "../utils/ErrorHandler";
import { getAuthToken } from "../utils/getAuthToken";
import { verifyToken } from "../utils/token";
import asyncErrorHandler from "./asyncErrorHandler";

interface IProps {
  roles: TRoles[];
  params?: string[];
}

export const roles = ({ roles, params }: IProps) => {
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
      // if (!roles.includes(userRole as any)) {
      //   //we will not throw error if "own"

      //   if (!roles.includes("Own")) {
      //     throw new ErrorHandler(
      //       403,
      //       "Access denied: Insufficient permissions"
      //     );
      //   }

      //   req.params[params?.[0] as any] = tokenData?.employee_id as any
      // }

      if (tokenData?.student_id) {
        res.locals.student_id = tokenData.student_id;
      }
      if (tokenData?.employee_id) {
        res.locals.employee_id = tokenData.employee_id;
      }
      if (tokenData?.role) {
        res.locals.role = tokenData.role;
      }

      next();
    }
  );
};
