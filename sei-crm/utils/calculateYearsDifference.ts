export function calculateYearsDifference(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  let yearsDifference = end.getFullYear() - start.getFullYear();

  // Check if the end date is before the anniversary of the start date in the end year
  if (
    end.getMonth() < start.getMonth() ||
    (end.getMonth() === start.getMonth() && end.getDate() < start.getDate())
  ) {
    yearsDifference--;
  }

  return yearsDifference;
}
