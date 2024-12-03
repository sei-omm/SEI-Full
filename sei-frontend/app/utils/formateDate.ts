export function formateDate(dateString: string, withTime = false) {
  // Create a new Date object from the input string
  const date = new Date(dateString);

  // Define options for formatting
  const options: any = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  };

  if (withTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.hour12 = false;
  }

  // Format the date using toLocaleString
  const formattedDate = date.toLocaleString("en-US", options);

  // Replace the comma with " at " for the desired format
  return formattedDate;
}
