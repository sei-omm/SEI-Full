import { Request } from "express";

export function parsePagination(req: Request) {
  const LIMIT = 10;
  const page = parseInt((req.query.page as string) || "1");
  const OFFSET = (page - 1) * LIMIT;
  delete req.query.page;
  return { OFFSET, LIMIT };
}

