import { TPmsFrequency } from "@/types";

export const getNextDueDate = (
  nextDueDate: string,
  currentFrequency: TPmsFrequency
) => {
  const date = new Date(nextDueDate);
  if (currentFrequency === "Daily") {
    date.setDate(date.getDate() + 1);
  } else if (currentFrequency === "Weekly") {
    date.setDate(date.getDate() + 7);
  } else if (currentFrequency === "Monthly") {
    date.setDate(date.getDate() + 30);
  } else if (currentFrequency === "Half Yearly") {
    date.setDate(date.getDate() + 182);
  } else {
    date.setDate(date.getDate() + 365);
  }
  return date;
};
