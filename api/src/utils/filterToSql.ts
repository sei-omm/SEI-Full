import { Request } from "express";

export function filterToSql(req: Request, preFix: string[] | string | null = null) {
  let filterQuery = "";
  const filterValues: any[] = [];
  Object.entries(req.query).forEach(([key, value], index) => {
    if (filterQuery === "") filterQuery = "WHERE";

    const preFixStr = Array.isArray(preFix) ? `${preFix[index]}.` : `${preFix}.`;

    if (index === 0) {
      filterQuery += ` ${preFixStr}${key} = $${index + 1}`;
    } else {
      filterQuery += ` AND ${preFixStr}${key} = $${index + 1}`;
    }
    filterValues.push(value);
  });

  return { filterQuery, filterValues };
}
