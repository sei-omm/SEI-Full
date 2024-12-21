export function apiPaginationSql(page: any): string {
  const PAGE = page ? parseInt(page as string) : 1;
  if (Number.isNaN(PAGE)) return "LIMIT 10 OFFSET 0";

  const LIMIT = 10;
  const OFFSET = (PAGE - 1) * LIMIT;

  return `LIMIT ${LIMIT} OFFSET ${OFFSET}`;
}
