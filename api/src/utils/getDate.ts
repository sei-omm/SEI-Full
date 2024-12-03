export const getDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Add 1 and ensure 2 digits
  const day = String(date.getDate()).padStart(2, "0"); // Ensure 2 digits
  return `${year}-${month}-${day}`; // Combine into "yyyy-mm-dd" format
};
