import { Request } from "express";

export const getAuthToken = (req: Request) => {
  const authHeader = req.headers["authorization"];

  console.log(req.headers)

  if (!authHeader) {
    if (req.cookies && req.cookies["login-info"]) {
      try {
        const parseData = JSON.parse(req.cookies["login-info"]);
        return parseData.token;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return null;
  }

  return token;
};
