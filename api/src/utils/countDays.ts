export function countDays(startDate: string, endDate: string): number {
    // Convert to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Ensure valid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid date format");
    }

    // Calculate the difference in time (milliseconds)
    const differenceInTime = end.getTime() - start.getTime();

    // Convert milliseconds to days and add 1 for inclusivity
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24)) + 1;

    return differenceInDays;
}
