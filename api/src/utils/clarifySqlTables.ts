import { ErrorHandler } from "./ErrorHandler";

export const clarifySqlTables = (tableText: string | null) => {
  if (!tableText) return "";

  const reservedWords = [
    "select",
    "from",
    "where",
    "and",
    "or",
    "not",
    "in",
    "like",
    "is",
    "null",
    "true",
    "false",
  ];

  const tableName = tableText.trim().toLowerCase().split(",");

  tableName.forEach((item) => {
    const eachTable = item.replace(/[^a-z0-9_]/g, "");

    if (reservedWords.includes(eachTable)) {
      throw new ErrorHandler(
        400,
        `"${tableName}" is a reserved word and cannot be used as a table name.`
      );
    }

    if (eachTable.match(/;|\/\*|--/)) {
      throw new ErrorHandler(400, "SQL injection attempt detected.");
    }
  });

  return tableName.join(",");
};
