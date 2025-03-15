import { NextFunction, Request, Response } from "express";
import asyncErrorHandler from "./asyncErrorHandler";
import { createToken, verifyToken } from "../utils/token";
import { ErrorHandler } from "../utils/ErrorHandler";
import { PERMISSION_PATH_MAP } from "../constant";
import { pool } from "../config/db";

type IPermissionToken = {
  permissions: string;
};

export const checkPermission = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Extract base URL and route pattern
    const baseUrl = req.baseUrl; // e.g., "/api/v1/hr"
    const routePattern = req.route?.path || ""; // e.g., "/department/:department_id"

    const pathToSearch = baseUrl.replace("/api/v1", "") + routePattern.replace(/\/:[^/]+/g, "");

    //after verify auth then i will check the permission
    //&& parentPathName !== "/is-login"
    if (res.locals?.employee_id) {
      const permissionToken = req.cookies.permissionToken;
      // if the user is employee -> skip permissions for students
      if (!permissionToken) {
        //if the user not assign as a crm member through 403 error
        if (!res.locals?.member_id)
          throw new ErrorHandler(
            403,
            "You Are Not Authorized to Access This Module. Contact Your Admin to Get Access."
          );

        // if the employee avilable in member database than get the permissions form db
        const { rows, rowCount } = await pool.query(
          `SELECT permissions FROM members WHERE member_row_id = $1`,
          [res.locals?.member_id]
        );

        // if no member id found in the database through 403 error
        if (!rowCount || rowCount === 0)
          throw new ErrorHandler(
            403,
            "You Are Not Authorized to Access This Module. Contact Your Admin to Get Access."
          );

        // if get the set the permission token again as http cookie
        const newPermissionToken = createToken(
          {
            permissions: rows[0].permissions,
          },
          { expiresIn: "15m" }
        );

        res.cookie("permissionToken", newPermissionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          // sameSite: "lax", // "lax" works better for local development
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          domain:
            process.env.NODE_ENV === "production"
              ? process.env.DOMAIN
              : undefined,
          maxAge: 1000 * 60 * 15, // 15 minits
        });

        // now perse the permission and check is current route is accessable or not
        const permission = JSON.parse(rows[0].permissions || "{}");
        let isAccessable = false;
        if(Array.isArray(PERMISSION_PATH_MAP[pathToSearch])) {
          isAccessable = PERMISSION_PATH_MAP[pathToSearch].some((path) => permission[path]);
        } else {
          isAccessable = permission[PERMISSION_PATH_MAP[pathToSearch]] === true;
        }
        if (!isAccessable)
          throw new ErrorHandler(
            403,
            "You Are Not Authorized to Access This Module. Contact Your Admin to Get Access."
          );
      } else {
        //if token exist than verify the token and get all the permsions form inside the token
        const { error, data: permissionData } =
          await verifyToken<IPermissionToken>(permissionToken);
        if (error)
          throw new ErrorHandler(
            403,
            "You Are Not Authorized to Access This Module. Contact Your Admin to Get Access."
          );
        const permission = JSON.parse(permissionData?.permissions || "{}");
        let isAccessable = false;
        if(Array.isArray(PERMISSION_PATH_MAP[pathToSearch])) {
          isAccessable = PERMISSION_PATH_MAP[pathToSearch].some((path) => permission[path]);
        } else {
          isAccessable = permission[PERMISSION_PATH_MAP[pathToSearch]] === true;
        }
        if (!isAccessable)
          throw new ErrorHandler(
            403,
            "You Are Not Authorized to Access This Module. Contact Your Admin to Get Access."
          );
      }
    }

    next();
  }
);
