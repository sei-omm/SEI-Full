import { Request } from "express";

export function parsePagination(req: Request, limit? : number) {
  const LIMIT = limit || 10;
  const page = parseInt((req.query.page as string) || "1");
  const OFFSET = (page - 1) * LIMIT;
  delete req.query.page;
  return { OFFSET, LIMIT };
}
