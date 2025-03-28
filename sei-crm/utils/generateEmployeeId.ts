export const generateEmployeeId = (isoDate : string) => {
  const dateObj = new Date(isoDate);

  // Extract month, day, and year
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(dateObj.getUTCDate()).padStart(2, "0");
  const year = dateObj.getUTCFullYear();

  const formattedDate = `${month}${day}${year}`;
  console.log(formattedDate); // Output: 01102025
};
