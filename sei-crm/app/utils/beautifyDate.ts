export const beautifyDate = (dateStr: string) => {
  const date = new Date(dateStr);

  //2024-11-01 13:44:17.787182

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);

  return formattedDate;
};
