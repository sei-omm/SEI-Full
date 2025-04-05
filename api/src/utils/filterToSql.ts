export function filterToSql(query: object, preFix: string[] | string | null = null) {
  let filterQuery = "";
  const filterValues: any[] = [];
  let placeholderNum = 1;
  Object.entries(query).forEach(([key, value], index) => {
    if(key === 'page') return;

    if (filterQuery === "") filterQuery = "WHERE";

    const preFixStr = Array.isArray(preFix) ? `${preFix[index]}.` : preFix ? `${preFix}.` : "";

    if (index === 0) {
      filterQuery += ` ${preFixStr}${key} = $${placeholderNum}`;
    } else {
      filterQuery += ` AND ${preFixStr}${key} = $${placeholderNum}`;
    }
    filterValues.push(value);
    placeholderNum++;
  });

  return { filterQuery, filterValues, placeholderNum };
}
