export const beautifyDate = (
  dateStr: string,
  withTime: boolean = false
): string => {
  if (dateStr === "") return "";

  const date = new Date(dateStr);

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);

  if (withTime) {
    const formattedTime = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Ensures 24-hour format
    }).format(date);

    return `${formattedDate} ${formattedTime}`;
  }

  return formattedDate;
};
