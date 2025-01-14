export const getDatesInBetween = (
  startDate: string,
  endDate: string,
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const dateArray = [];
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    dateArray.push(currentDate.toISOString().split('T')[0]); // Format to 'YYYY-MM-DD'
    currentDate.setDate(currentDate.getDate() + 1); // Increment by one day
  }
  
  return dateArray;
};
